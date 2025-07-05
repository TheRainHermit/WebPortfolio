import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fileUpload from 'express-fileupload';
import connectDB from './config/database.js';
import mongoose from 'mongoose';

// Importar rutas
import apaRoutes from './routes/apa.routes.js';

// Configuración inicial
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const PORT = process.env.PORT || 4000;

// Conectar a la base de datos
connectDB();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar file upload
app.use(fileUpload({
    createParentPath: true,
    limits: { fileSize: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024 }, // 5MB por defecto
    abortOnLimit: true,
    responseOnLimit: 'El archivo excede el tamaño máximo permitido',
    useTempFiles: true,
    tempFileDir: join(__dirname, '../temp')
}));

// Configurar carpeta pública
app.use('/uploads', express.static(join(__dirname, '../uploads')));

// Rutas
app.get('/', (req, res) => {
    res.json({ 
        message: 'API del verificador de normas APA',
        version: '1.0.0',
        endpoints: {
            analyze: '/api/apa/analyze',
            results: '/api/apa/results/:id',
            examples: '/api/apa/examples'
        },
        database: {
            status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
        }
    });
});

// Rutas de la API
app.use('/api/apa', apaRoutes);

// Manejador de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        ok: false,
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Iniciar servidor
const server = app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Entorno: ${process.env.NODE_ENV}`);
    
    // Crear carpetas necesarias si no existen
    const folders = ['uploads', 'temp'];
    folders.forEach(folder => {
        const dir = join(__dirname, '..', folder);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`Carpeta creada: ${dir}`);
        }
    });
});

// Manejar cierre de la aplicación
process.on('SIGTERM', () => {
    console.log('Cerrando servidor...');
    server.close(() => {
        console.log('Servidor cerrado');
        process.exit(0);
    });
});