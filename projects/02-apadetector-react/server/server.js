import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { errorHandler, notFound } from './src/middlewares/errorHandler.js';
import routes from './src/routes/index.js';

// Configuración de variables de entorno
config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/', routes);

// Manejo de errores
app.use(notFound);
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

export default app;