import { Router } from 'express';
const router = Router();
import { analyzeDocument, getAllDocuments, getAnalysisResults } from '../controllers/analysisController.js';
import upload from '../middlewares/uploadMiddleware.js';

// POST /api/analyze  — Subir y analizar documento
router.post('/', upload.single('file'), analyzeDocument);

// GET /api/analyze/documents  — Listar todos los documentos analizados
router.get('/documents', getAllDocuments);

// GET /api/analyze/results/:id  — Obtener resultados de un documento por ID
router.get('/results/:id', getAnalysisResults);

export default router;