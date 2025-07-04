import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
app.use(cors({
  origin: "http://localhost:5173", // Cambia al puerto de tu frontend si es diferente
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const ACCESS_SECRET = process.env.ACCESS_SECRET || "secreto";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "refresh_secreto";
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "bookboxmarket"
};

// Ruta de registro
app.post("/api/registro", async (req, res) => {
  const {
    nombre,
    apellido,
    email,
    password,
    telefono,
    direccion,
    ciudad,
    pais,
    codigo_postal,
    fecha_nto,
    preferencias_literarias
  } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length > 0) {
      await conn.end();
      return res.status(400).json({ error: "Usuario ya existe" });
    }
    await conn.execute(
      `INSERT INTO users 
        (nombre, apellido, email, password, telefono, direccion, ciudad, pais, codigo_postal, fecha_nto, preferencias_literarias)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre,
        apellido,
        email,
        hashed,
        telefono,
        direccion,
        ciudad,
        pais,
        codigo_postal,
        fecha_nto,
        preferencias_literarias
      ]
    );
    // Obtén el id del usuario recién insertado
    const [userRows] = await conn.execute("SELECT id_usuario, nombre, email FROM users WHERE email = ?", [email]);
    await conn.end();
    res.json({ user: userRows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error de servidor" });
  }
});

// Ruta de login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute("SELECT * FROM users WHERE email = ?", [email]);
    await conn.end();
    if (rows.length === 0) return res.status(401).json({ error: "Usuario no encontrado" });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Contraseña incorrecta" });

    const token = jwt.sign(
      { id_usuario: user.id_usuario, email: user.email },
      ACCESS_SECRET,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      { id_usuario: user.id_usuario, email: user.email },
      REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // Envía el refresh token en una cookie httpOnly
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // true en producción con HTTPS
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ user: { email: user.email, nombre: user.nombre }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error de servidor" });
  }
});

// Endpoint de refresco de token
app.post("/api/refresh", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ error: "Refresh token requerido" });

  try {
    const user = jwt.verify(refreshToken, REFRESH_SECRET);
    // Busca el usuario en la base de datos para obtener el nombre
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute("SELECT id_usuario, nombre, email FROM users WHERE id_usuario = ?", [user.id_usuario]);
    await conn.end();
    if (rows.length === 0) return res.status(401).json({ error: "Usuario no encontrado" });

    const newToken = jwt.sign({ id_usuario: user.id_usuario, email: user.email }, ACCESS_SECRET, { expiresIn: "15m" });
    res.json({ token: newToken, user: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: "Refresh token inválido" });
  }
});

// Middleware para verificar JWT
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });
  const token = authHeader.split(" ")[1];
  try {
    const user = jwt.verify(token, ACCESS_SECRET);
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
}

// Ejemplo de uso en donaciones:
app.post("/api/donaciones", authMiddleware, async (req, res) => {
  const { libro_id, estado_donacion } = req.body;
  const usuario_id = req.user.id_usuario;
  const usuario = req.user;
  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute(
      "INSERT INTO donaciones (usuario_id, libro_id, fecha_donacion, estado_donacion) VALUES (?, ?, CURDATE(), ?)",
      [usuario_id, libro_id, estado_donacion]
    );

    // Actualizar puntos del usuario
    await conn.execute(
      "UPDATE puntos_usuario SET puntos = puntos + 10 WHERE id_usuario = ?",
      [usuario_id]
    );
    // Si no existe aún, crea el registro:
    await conn.execute(
      "INSERT IGNORE INTO puntos_usuario (id_usuario, puntos) VALUES (?, 10)",
      [usuario_id]
    );

    // Verificar si es la primera donación
    const [donaciones] = await conn.execute(
      "SELECT COUNT(*) as total FROM donaciones WHERE usuario_id = ?",
      [usuario_id]
    );
    
    // Si es la primera donación, asignar insignia
    if (donaciones[0].total === 1) {
      await conn.execute(
        "INSERT INTO insignias_usuario (id_usuario, id_insignia) VALUES (?, ?)",
        [usuario_id, 1] // 1 es el ID de la insignia "Primer libro donado"
      );
    }

    // Verificar si es la quinta donación
    if (donaciones[0].total === 5) {
      await conn.execute(
        "INSERT INTO insignias_usuario (id_usuario, id_insignia) VALUES (?, ?)",
        [usuario_id, 2] // 2 es el ID de la insignia "Donador frecuente"
      );
    }

    await conn.end();

    //Enviar email de confirmación
    try {
      await enviarEmail(
        usuario.email,
        "¡Gracias por tu donación!",
        `<h1>¡Hola ${usuario.nombre}!</h1><p>Tu donación fue exitosa...</p>`
      )
    } catch (err) {
      console.error("Error al enviar email de donación:", err);
    }

    res.json({ success: true, message: "¡Donación registrada!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al registrar la donación" });
  }
});

// Aplica el middleware a la ruta de compra
app.post("/api/compra", authMiddleware, async (req, res) => {
  const { fecha_compra, metodo_pago } = req.body;
  const usuario_id = req.user.id_usuario; // o req.user.id según tu payload
  const usuario = req.user;
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [result] = await conn.execute(
      "INSERT INTO compra (usuario_id, fecha_compra, metodo_pago) VALUES (?, ?, ?)",
      [usuario_id, fecha_compra, metodo_pago]
    );
    const id_compra = result.insertId;
    await conn.end();

    //Enviar email de confirmación
    try {
      await enviarEmail(
        usuario.email,
        "¡Gracias por tu compra!",
        `<h1>¡Hola ${usuario.nombre}!</h1><p>Tu compra fue exitosa...</p>`
      )
    } catch (err) {
      console.error("Error al enviar email de compra:", err);
    }

    res.json({ success: true, id_compra: result.insertId, message: "¡Compra registrada!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al registrar la compra" });
  }
});

//Ruta de detalle de la compra
app.post("/api/d_compra", async (req, res) => {
  // productos: [{ id_caja, linia }]
  const { id_compra, productos } = req.body;
  try {
    const conn = await mysql.createConnection(dbConfig);
    for (const prod of productos) {
      if (
        typeof id_compra === "undefined" ||
        typeof prod.id_caja === "undefined" ||
        typeof prod.linia === "undefined"
      ) {
        return res.status(400).json({ error: "Datos de producto incompletos" });
      }
      await conn.execute(
        "INSERT INTO d_compra (id_compra, id_caja, linia) VALUES (?, ?, ?)",
        [id_compra, prod.id_caja, prod.linia]
      );
    }
    await conn.end();
    res.json({ success: true, message: "¡Detalle de compra registrado!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al registrar el detalle de compra" });
  }
});

app.post("/api/compra/detalle", async (req, res) => {
  const conn = await mysql.createConnection(dbConfig);
  const { id_compra, productos } = req.body;
  if (!id_compra || !Array.isArray(productos)) {
    await conn.end();
    return res.status(400).json({ error: "Datos incompletos" });
  }

  try {
    // Inserta cada producto en la tabla d_compra
    for (const producto of productos) {
      await conn.execute(
        "INSERT INTO d_compra (id_compra, id_caja, linia) VALUES (?, ?, ?)",
        [id_compra, producto.id_caja, producto.linia]
      );
    }
    await conn.end();
    res.json({ success: true, message: "Detalle de compra registrado" });
  } catch (err) {
    console.error("Error al registrar detalle de compra:", err);
    await conn.end();
    res.status(500).json({ error: "Error al registrar el detalle de la compra" });
  }
});

// Ejemplo de ruta privada
app.get("/api/private", authMiddleware, (req, res) => {
  res.json({ message: `Hola ${req.user.email}, accediste a una ruta protegida.` });
});

app.post("/api/libros", async (req, res) => {
  const { titulo, autor, genero, estado } = req.body;
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [result] = await conn.execute(
      "INSERT INTO libros (titulo, autor, genero, estado) VALUES (?, ?, ?, ?)",
      [titulo, autor, genero, estado]
    );
    await conn.end();
    res.json({ id_libro: result.insertId });
  } catch (err) {
    res.status(500).json({ error: "Error al registrar el libro" });
  }
});

// Ruta protegida
app.get("/api/usuario/compras", authMiddleware, async (req, res) => {
  const usuario_id = req.user.id_usuario;
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [compras] = await conn.execute(
      "SELECT * FROM compra WHERE usuario_id = ? ORDER BY fecha_compra DESC",
      [usuario_id]
    );
    await conn.end();
    res.json({ compras });
  } catch (err) {
    res.status(500).json({ error: "Error al obtener el historial de compras" });
  }
});

// Ruta protegida
app.get("/api/usuario/donaciones", authMiddleware, async (req, res) => {
  const usuario_id = req.user.id_usuario;
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [donaciones] = await conn.execute(
      `SELECT d.*, l.titulo 
       FROM donaciones d 
       JOIN libros l ON d.libro_id = l.id_libro 
       WHERE d.usuario_id = ? 
       ORDER BY d.fecha_donacion DESC`,
      [usuario_id]
    );
    await conn.end();
    res.json({ donaciones });
  } catch (err) {
    res.status(500).json({ error: "Error al obtener el historial de donaciones" });
  }
});

// Ruta protegida para actualizar perfil
app.put("/api/usuario/perfil", authMiddleware, async (req, res) => {
  const usuario_id = req.user.id_usuario;
  const { nombre, direccion, preferencias_literarias } = req.body;
  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute(
      "UPDATE users SET nombre = ?, direccion = ?, preferencias_literarias = ? WHERE id_usuario = ?",
      [nombre, direccion, preferencias_literarias, usuario_id]
    );
    await conn.end();
    res.json({ success: true, message: "Perfil actualizado" });
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar el perfil" });
  }
});

// GET /api/inventario/stock
app.get("/api/inventario/stock", async (req, res) => {
  const conn = await mysql.createConnection(dbConfig);
  try {
    // Ajusta la consulta SQL según tu estructura de tabla
    const [rows] = await conn.execute(
      "SELECT id_caja, stock FROM inventario"
    );
    await conn.end();

    // Convierte el resultado a un objeto { id_caja: stock, ... }
    const stock = {};
    rows.forEach(row => {
      stock[row.id_caja] = row.stock;
    });

    res.json({ stock });
  } catch (err) {
    console.error("Error al obtener stock:", err);
    await conn.end();
    res.status(500).json({ error: "Error al obtener el stock" });
  }
});

// PUT /api/inventario/stock/:id
app.put("/api/inventario/stock/:id", async (req, res) => {
  const conn = await mysql.createConnection(dbConfig);
  const { stock } = req.body;
  const { id } = req.params;
  try {
    await conn.execute(
      "UPDATE inventario SET stock = ? WHERE id_caja = ?",
      [stock, id]
    );
    await conn.end();
    res.json({ success: true });
  } catch (err) {
    await conn.end();
    res.status(500).json({ error: "Error al actualizar el stock" });
  }
});

//Ruta suscriptores
app.post("/api/suscriptores", async (req, res) => {
  const { email, nombre } = req.body;
  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute(
      "INSERT IGNORE INTO suscriptores (email, nombre) VALUES (?, ?)",
      [email, nombre]
    );
    await conn.end();
    res.json({ success: true, message: "¡Suscripción registrada!" });
  } catch (err) {
    res.status(500).json({ error: "Error al registrar la suscripción" });
  }
});

// Ruta para ranking de puntos
app.get("/api/ranking", async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute(`
      SELECT u.id_usuario, u.nombre, u.apellido, p.puntos
      FROM puntos_usuario p
      JOIN users u ON p.id_usuario = u.id_usuario
      ORDER BY p.puntos DESC
      LIMIT 10
    `);
    await conn.end();
    res.json({ ranking: rows });
  } catch (err) {
    console.error("Error al obtener ranking:", err);
    res.status(500).json({ error: "Error al obtener el ranking" });
  }
});

// GET /api/insignias/:id_usuario - Insignias obtenidas por un usuario
app.get("/api/insignias/:id_usuario", async (req, res) => {
  const { id_usuario } = req.params;
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute(
      `SELECT i.id_insignia, i.nombre, i.descripcion, i.icono, iu.fecha
       FROM insignias_usuario iu
       JOIN insignias i ON iu.id_insignia = i.id_insignia
       WHERE iu.id_usuario = ?`,
      [id_usuario]
    );
    await conn.end();
    res.json({ insignias: rows });
  } catch (err) {
    console.error("Error al obtener insignias:", err);
    res.status(500).json({ error: "Error al obtener insignias del usuario" });
  }
});

// GET /api/insignias - Lista todas las insignias existentes
app.get("/api/insignias", async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute("SELECT * FROM insignias");
    await conn.end();
    res.json({ insignias: rows });
  } catch (err) {
    res.status(500).json({ error: "Error al obtener insignias" });
  }
});

//Enviar notificaciones por correo
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false // SOLO PARA DESARROLLO LOCAL
  }
});

export async function enviarEmail(destinatario, asunto, mensajeHtml) {
  await transporter.sendMail({
    from: '"BookBox Market" <miguel.fabra211294@gmail.com>',
    to: destinatario,
    subject: asunto,
    html: mensajeHtml,
  });
}

// Inicia el servidor
app.listen(3000, () => console.log("Backend corriendo en http://localhost:3000"));