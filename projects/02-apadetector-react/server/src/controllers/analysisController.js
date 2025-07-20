import { validateCitations } from '../services/apaCitationService.js';
import pool from '../config/db.js';

export const analyzeText = async (req, res, next) => {
  try {
    const { text, documentId, userId } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'El texto a analizar es requerido'
      });
    }

    // Validar citas y referencias
    const { errors, warnings, suggestions } = validateCitations(text);

    // Guardar el análisis en la base de datos
    const [analysisResult] = await pool.execute(
      'INSERT INTO analyses (document_id, user_id, status, result_json) VALUES (?, ?, ?, ?)',
      [
        documentId || null,
        userId || 1, // Usar el ID del usuario autenticado
        'completed',
        JSON.stringify({
          errors,
          warnings,
          suggestions,
          stats: {
            totalErrors: errors.length,
            totalWarnings: warnings.length,
            totalSuggestions: suggestions.length
          }
        })
      ]
    );

    // Guardar resultados individuales
    const analysisId = analysisResult.insertId;
    const results = [...errors, ...warnings, ...suggestions].map(result => [
      analysisId,
      result.ruleId || null,
      result.type,
      result.message,
      result.position || 0,
      result.length || 0,
      JSON.stringify(result.suggestion || null),
      new Date()
    ]);

    if (results.length > 0) {
      await pool.query(
        'INSERT INTO analysis_results (analysis_id, rule_id, result_type, message, position, length, suggestion, created_at) VALUES ?',
        [results]
      );
    }

    res.status(200).json({
      success: true,
      data: {
        analysisId,
        errors,
        warnings,
        suggestions,
        stats: {
          totalErrors: errors.length,
          totalWarnings: warnings.length,
          totalSuggestions: suggestions.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getAnalysis = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const [analysis] = await pool.execute(
      'SELECT * FROM analyses WHERE id = ?',
      [id]
    );

    if (analysis.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Análisis no encontrado'
      });
    }

    const [results] = await pool.execute(
      'SELECT * FROM analysis_results WHERE analysis_id = ?',
      [id]
    );

    res.status(200).json({
      success: true,
      data: {
        ...analysis[0],
        results
      }
    });
  } catch (error) {
    next(error);
  }
};