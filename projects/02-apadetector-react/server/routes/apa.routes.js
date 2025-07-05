import { Router } from 'express';
import { check } from 'express-validator';
import { validateFields, validateFile } from '../middlewares/validate-fields.js';
import * as apaController from '../controllers/apa.controller.js';

const router = Router();

// Ruta para analizar un documento
router.post('/analyze', [
    // Validar que se haya subido un archivo
    check('document').custom((value, { req }) => {
        if (!req.files || Object.keys(req.files).length === 0) {
            throw new Error('No se ha subido ningún archivo');
        }
        return true;
    }),
    validateFields,
    validateFile
], apaController.analyzeDocument);

// Ruta para obtener los resultados de un análisis previo
router.get('/results/:id', [
    check('id', 'El ID no es válido').isString().notEmpty(),
    validateFields
], apaController.getAnalysisResults);

// Ruta para obtener estadísticas de análisis
router.get('/stats', apaController.getAnalysisStats);

// Ruta para obtener ejemplos de formato APA
router.get('/examples', apaController.getApaExamples);

export default router;
