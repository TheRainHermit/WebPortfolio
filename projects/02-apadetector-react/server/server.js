import express, { json } from 'express';
import cors from 'cors';
import analysisRoutes from './routes/analysisRoutes';

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares globales
app.use(cors());
app.use(json());

// Rutas
app.use('/api/analyze', analysisRoutes);

// Manejo de errores básicos
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Inicio del servidor
app.listen(PORT, () => {
  console.log(`Servidor APA Detector backend corriendo en puerto ${PORT}`);
});