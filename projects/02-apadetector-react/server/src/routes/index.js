import { Router } from 'express';
import exampleRoutes from './example.routes.js';
import analysisRoutes from './analysis.routes.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a la API de APADetector' });
});

// Aquí irán las rutas de la aplicación
router.use('/api/examples', exampleRoutes);

// Rutas de análisis
router.use('/api/analysis', analysisRoutes);

// Manejo de rutas no encontradas
router.use((req, res, next) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

export default router;