-- Crear base de datos
CREATE DATABASE IF NOT EXISTS apadetector CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE apadetector;

-- Tabla de documentos subidos
CREATE TABLE IF NOT EXISTS documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,         -- Nombre del archivo en el servidor
    originalname VARCHAR(255) NOT NULL,     -- Nombre original al subir
    mimetype VARCHAR(100),                  -- Tipo MIME
    size INT,                               -- Tamaño en bytes
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de resultados de análisis
CREATE TABLE IF NOT EXISTS analysis_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document_id INT NOT NULL,
    type ENUM('success', 'error', 'warning', 'suggestion') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    suggestion TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

-- Índices para consultas rápidas
CREATE INDEX idx_document_uploaded_at ON documents(uploaded_at DESC);
CREATE INDEX idx_analysis_document_id ON analysis_results(document_id);

-- (Opcional) Tabla de logs de errores del sistema
CREATE TABLE IF NOT EXISTS error_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE analysis_results ADD COLUMN section VARCHAR(255) DEFAULT NULL;