import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();

// Ejemplo de ruta GET
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT NOW() as now');
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
});

export default router;