import { validationResult } from 'express-validator';

export const validateFields = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            ok: false,
            errors: errors.mapped()
        });
    }
    next();
};

// Middleware para validar el tipo de archivo
export const validateFile = (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: false,
            msg: 'No se ha subido ningún archivo'
        });
    }

    const { document } = req.files;
    const allowedTypes = process.env.ALLOWED_FILE_TYPES.split(',');
    
    if (!allowedTypes.includes(document.mimetype)) {
        return res.status(400).json({
            ok: false,
            msg: `Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(', ')}`
        });
    }

    next();
};
