import { createPool } from 'mysql2/promise';

const pool = createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'apadetector',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;