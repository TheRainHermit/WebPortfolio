import { analyzeFile } from '../services/apaService.js';
import pool from '../models/db.js';
import { unlinkSync } from 'fs';
import multer from 'multer';
import { errorResponse } from '../utils/errors.js';

// Analizar documento

export async function analyzeDocument(req, res) {
  try {
    // Verificar que se haya enviado un archivo
    if (!req.file) {
      return errorResponse(res, 400, 'No se envió ningún archivo o el archivo no es válido.');
    }

    // 1. Guardar documento
    const [docResult] = await pool.query(
      `INSERT INTO documents (filename, originalname, mimetype, size)
       VALUES (?, ?, ?, ?)`,
      [req.file.filename, req.file.originalname, req.file.mimetype, req.file.size]
    );
    const documentId = docResult.insertId;

    // 2. Analizar archivo
    const analysisResults = await analyzeFile(req.file.path);

    console.log('analysisResults:', analysisResults);

    // 3. Guardar resultados
    const insertPromises = analysisResults.map(result =>
      pool.query(
        `INSERT INTO analysis_results (document_id, type, title, message, suggestion)
         VALUES (?, ?, ?, ?, ?)`,
        [
          documentId,
          result.type,
          result.title,
          result.message,
          result.suggestion || null
        ]
      )
    );
    await Promise.all(insertPromises);

    // 4. Eliminar archivo temporal
    unlinkSync(req.file.path);

    // 5. Responder con resultados y documentId
    res.json({ documentId, results: analysisResults });

  } catch (error) {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return errorResponse(res, 'FILE_TOO_LARGE', 'El archivo es demasiado grande. Máximo permitido: 5 MB.', {}, 413);
      }
      return errorResponse(res, 'UPLOAD_ERROR', error.message, {}, 400);
    }
    if (error.code === 'FILE_TYPE_NOT_ALLOWED') {
      return errorResponse(res, 'FILE_TYPE_NOT_ALLOWED', error.message, error.details, 415);
    }
    console.error(error);
    return errorResponse(res, 500, 'Error al analizar el documento.');
  }
}

// Obtener todos los documentos analizados
export async function getAllDocuments(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const mimetype = req.query.mimetype || '';
    const dateFrom = req.query.dateFrom || '';
    const dateTo = req.query.dateTo || '';
    const orderBy = req.query.orderBy || 'uploaded_at';
    const orderDir = (req.query.orderDir || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (search) {
      whereClause += ' AND originalname LIKE ?';
      params.push(`%${search}%`);
    }
    if (mimetype) {
      whereClause += ' AND mimetype = ?';
      params.push(mimetype);
    }
    if (dateFrom) {
      whereClause += ' AND uploaded_at >= ?';
      params.push(dateFrom);
    }
    if (dateTo) {
      whereClause += ' AND uploaded_at <= ?';
      params.push(dateTo);
    }

    // Total count for pagination
    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM documents ${whereClause}`,
      params
    );
    const total = countRows[0].total;

    // Fetch paginated documents with ordering
    const [rows] = await pool.query(
      `SELECT * FROM documents ${whereClause} ORDER BY ${orderBy} ${orderDir} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      documents: rows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, 'Error al obtener el historial de documentos.');
  }
}
  
  // Obtener resultados de un documento específico
  export async function getAnalysisResults(req, res) {
    const { id } = req.params;
    try {
      // Verifica que el documento exista
      const [docs] = await pool.query(
        `SELECT * FROM documents WHERE id = ?`, [id]
      );
      if (docs.length === 0) {
        return errorResponse(res, 404, 'Documento no encontrado.');
      }
  
      // Trae los resultados asociados
      const [results] = await pool.query(
        `SELECT * FROM analysis_results WHERE document_id = ? ORDER BY created_at ASC`, [id]
      );
      res.json({ document: docs[0], results });
    } catch (error) {
      console.error(error);
      return errorResponse(res, 500, 'Error al obtener resultados.');
      }
  }