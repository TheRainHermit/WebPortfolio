import { analyzeFile } from '../services/apaService.js';
import pool from '../models/db.js';
import { unlinkSync } from 'fs';
import multer from 'multer';

export async function analyzeDocument(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se envió ningún archivo o el archivo no es válido.' });
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
      // Error de Multer (tamaño, tipo, etc)
      return res.status(400).json({ error: error.message });
    }
    if (error.message === 'Tipo de archivo no permitido.') {
      return res.status(400).json({ error: error.message });
    }
    console.error(error);
    res.status(500).json({ error: 'Error al analizar el documento.' });
  }
}

// Obtener todos los documentos analizados
export async function getAllDocuments(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    let whereClause = '';
    let params = [];

    if (search) {
      whereClause = 'WHERE originalname LIKE ?';
      params.push(`%${search}%`);
    }

    // Total count for pagination
    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM documents ${whereClause}`,
      params
    );
    const total = countRows[0].total;

    // Fetch paginated documents
    const [rows] = await pool.query(
      `SELECT * FROM documents ${whereClause} ORDER BY uploaded_at DESC LIMIT ? OFFSET ?`,
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
    res.status(500).json({ error: 'Error al obtener el historial de documentos.' });
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
        return res.status(404).json({ error: 'Documento no encontrado.' });
      }
  
      // Trae los resultados asociados
      const [results] = await pool.query(
        `SELECT * FROM analysis_results WHERE document_id = ? ORDER BY created_at ASC`, [id]
      );
      res.json({ document: docs[0], results });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener resultados.' });
    }
  }