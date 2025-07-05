import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import Analysis from '../models/Analysis.js';
import { validateApaFormat } from '../services/apaValidator.js';

// Función para guardar el archivo temporalmente
const saveTempFile = (file) => {
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const ext = path.extname(file.name);
    const tempFileName = `${uuidv4()}${ext}`;
    const tempPath = path.join(tempDir, tempFileName);
    
    return new Promise((resolve, reject) => {
        file.mv(tempPath, (err) => {
            if (err) {
                console.error('Error al guardar archivo temporal:', err);
                return reject(err);
            }
            resolve(tempPath);
        });
    });
};

// Función para extraer texto de un archivo
const extractTextFromFile = async (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    
    try {
        if (ext === '.pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdfParse(dataBuffer);
            return data.text;
        } else if (ext === '.docx') {
            const result = await mammoth.extractRawText({ path: filePath });
            return result.value;
        } else if (ext === '.txt') {
            return fs.readFileSync(filePath, 'utf-8');
        } else {
            throw new Error('Formato de archivo no soportado');
        }
    } catch (error) {
        console.error('Error al extraer texto:', error);
        throw new Error('No se pudo extraer el texto del documento');
    }
};

// Controlador para analizar documento
export const analyzeDocument = async (req, res) => {
    let tempPath;
    
    try {
        if (!req.files || !req.files.document) {
            return res.status(400).json({
                ok: false,
                message: 'No se ha subido ningún archivo'
            });
        }

        const document = req.files.document;
        
        // Validar tipo de archivo
        const allowedTypes = (process.env.ALLOWED_FILE_TYPES || '').split(',');
        if (!allowedTypes.includes(document.mimetype)) {
            return res.status(400).json({
                ok: false,
                message: `Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(', ')}`
            });
        }
        
        // Guardar archivo temporalmente
        tempPath = await saveTempFile(document);
        
        // Extraer texto
        const text = await extractTextFromFile(tempPath);
        
        // Validar formato APA
        const analysis = validateApaFormat(text);
        
        // Crear y guardar el análisis en la base de datos
        const newAnalysis = new Analysis({
            analysisId: uuidv4(),
            originalName: document.name,
            mimeType: document.mimetype,
            size: document.size,
            wordCount: analysis.wordCount,
            characterCount: analysis.characterCount,
            errors: analysis.errors,
            warnings: analysis.warnings,
            suggestions: analysis.suggestions,
            metadata: {
                clientIp: req.ip,
                userAgent: req.get('user-agent'),
                analysisTime: new Date().toISOString()
            }
        });

        const savedAnalysis = await newAnalysis.save();
        
        // Preparar respuesta
        const response = {
            analysisId: savedAnalysis.analysisId,
            originalName: savedAnalysis.originalName,
            wordCount: savedAnalysis.wordCount,
            characterCount: savedAnalysis.characterCount,
            errors: savedAnalysis.errors,
            warnings: savedAnalysis.warnings,
            suggestions: savedAnalysis.suggestions,
            timestamp: savedAnalysis.createdAt
        };
        
        res.json({
            ok: true,
            ...response
        });
        
    } catch (error) {
        console.error('Error en analyzeDocument:', error);
        res.status(500).json({
            ok: false,
            message: 'Error al procesar el documento',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        // Asegurarse de eliminar el archivo temporal
        if (tempPath && fs.existsSync(tempPath)) {
            try {
                fs.unlinkSync(tempPath);
            } catch (err) {
                console.error('Error al eliminar archivo temporal:', err);
            }
        }
    }
};

// Controlador para obtener resultados de análisis previo
export const getAnalysisResults = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Buscar el análisis en la base de datos
        const analysis = await Analysis.findOne({ analysisId: id });
        
        if (!analysis) {
            return res.status(404).json({
                ok: false,
                message: 'Análisis no encontrado'
            });
        }
        
        // Preparar respuesta
        const response = {
            analysisId: analysis.analysisId,
            originalName: analysis.originalName,
            wordCount: analysis.wordCount,
            characterCount: analysis.characterCount,
            errors: analysis.errors,
            warnings: analysis.warnings,
            suggestions: analysis.suggestions,
            timestamp: analysis.createdAt
        };
        
        res.json({
            ok: true,
            ...response
        });
        
    } catch (error) {
        console.error('Error en getAnalysisResults:', error);
        res.status(500).json({
            ok: false,
            message: 'Error al obtener los resultados del análisis',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Controlador para obtener estadísticas de análisis
export const getAnalysisStats = async (req, res) => {
    try {
        // Obtener estadísticas de la base de datos
        const stats = await Analysis.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    totalWords: { $sum: '$wordCount' },
                    totalCharacters: { $sum: '$characterCount' },
                    avgWords: { $avg: '$wordCount' },
                    avgCharacters: { $avg: '$characterCount' },
                    byType: {
                        $push: {
                            type: '$mimeType',
                            count: 1
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    total: 1,
                    totalWords: 1,
                    totalCharacters: 1,
                    avgWords: 1,
                    avgCharacters: 1,
                    byType: {
                        $arrayToObject: {
                            $map: {
                                input: '$byType',
                                as: 'type',
                                in: { k: '$$type.type', v: '$$type.count' }
                            }
                        }
                    }
                }
            }
        ]);
        
        res.json({
            ok: true,
            stats: stats[0] || {}
        });
        
    } catch (error) {
        console.error('Error en getAnalysisStats:', error);
        res.status(500).json({
            ok: false,
            message: 'Error al obtener estadísticas',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Controlador para obtener ejemplos de formato APA
export const getApaExamples = (req, res) => {
    const examples = {
        book: {
            description: 'Libro',
            format: 'Apellido, A. A. (Año). Título del libro en cursiva. Editorial.'
        },
        journalArticle: {
            description: 'Artículo de revista',
            format: 'Apellido, A. A., Apellido, B. B., & Apellido, C. C. (Año). Título del artículo. Nombre de la Revista en Cursiva, volumen(número), pp-pp. https://doi.org/xxxx'
        },
        website: {
            description: 'Página web',
            format: 'Apellido, A. A. (Año, Mes día). Título de la página. Nombre del sitio web. URL'
        }
    };

    res.json({
        ok: true,
        examples
    });
};