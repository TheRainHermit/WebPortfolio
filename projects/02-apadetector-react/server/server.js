import express, { json } from 'express';
import cors from 'cors';
import analysisRoutes from './routes/analysisRoutes.js';
import { errorResponse } from './utils/errors.js';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

app.use(express.static(path.join(__dirname, 'client', 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares globales
app.use(cors());
app.use(json());

// Rutas
app.use('/api/analyze', analysisRoutes);

// Middleware global de errores
app.use((err, req, res, next) => {
  if (err.code && err.message) {
    // Error personalizado (como MulterCustomError)
    return errorResponse(res, err.code, err.message, err.details || {}, err.status || 500);
  }
  // Error genérico
  return errorResponse(res, 'INTERNAL_SERVER_ERROR', 'Error interno del servidor.', {}, 500);
});

// Inicio del servidor
app.listen(PORT, () => {
  console.log(`Servidor APA Detector backend corriendo en puerto ${PORT}`);
});

export default app;