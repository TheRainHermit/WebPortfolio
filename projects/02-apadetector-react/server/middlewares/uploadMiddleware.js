import multer, { diskStorage } from 'multer';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { errorResponse } from '../utils/errors.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Al inicio del archivo
class MulterCustomError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

// Carpeta temporal para archivos subidos
const uploadDir = join(__dirname, '../../uploads');
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir);
}

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

const storage = diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

function fileFilter(req, file, cb) {
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    return cb(new MulterCustomError('FILE_TYPE_NOT_ALLOWED', 'Tipo de archivo no permitido.', { allowedTypes: ALLOWED_TYPES }), false);
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE }
});

export default upload;