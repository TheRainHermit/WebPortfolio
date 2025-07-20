import { Router } from 'express';
import { analyzeText, getAnalysis } from '../controllers/analysisController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

// Ruta para analizar texto
router.post('/', protect, analyzeText);

// Obtener un análisis por ID
router.get('/:id', protect, getAnalysis);

export default router;