-- 01-init.sql
-- Este script se ejecuta automáticamente cuando PostgreSQL se inicia por primera vez

-- Crear bases de datos si no existen
SELECT 'CREATE DATABASE users_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'users_db')\gexec
SELECT 'CREATE DATABASE projects_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'projects_db')\gexec

-- Conectar a users_db
\c users_db;

-- Crear tabla users si no existe
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar usuarios de prueba solo si la tabla está vacía
INSERT INTO users (email, username, hashed_password, role)
SELECT 'admin@example.com', 'admin', '$2b$12$LQv3c6Yxq5Zx5Zx5Zx5ZuO5Zx5Zx5Zx5Zx5Zx5Zx5Zx5Zx5Zx5', 'ADMIN'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@example.com');

INSERT INTO users (email, username, hashed_password, role)
SELECT 'user@example.com', 'user', '$2b$12$LQv3c6Yxq5Zx5Zx5Zx5ZuO5Zx5Zx5Zx5Zx5Zx5Zx5Zx5Zx5Zx5', 'USER'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'user@example.com');

INSERT INTO users (email, username, hashed_password, role)
SELECT 'test@example.com', 'testuser', '$2b$12$LQv3c6Yxq5Zx5Zx5Zx5ZuO5Zx5Zx5Zx5Zx5Zx5Zx5Zx5Zx5Zx5', 'USER'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'test@example.com');

-- Conectar a projects_db
\c projects_db;

-- Crear tabla projects si no existe
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla tasks si no existe
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'TODO',
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    assigned_to INTEGER,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);