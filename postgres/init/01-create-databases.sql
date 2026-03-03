-- Crear bases de datos
CREATE DATABASE users_db;
CREATE DATABASE projects_db;

-- Conectar a users_db
\c users_db;

-- Crear tabla users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'USER'
);

-- Insertar usuarios de prueba
INSERT INTO users (email, username, hashed_password, role) VALUES
('admin@example.com', 'admin', '$2b$12$LQv3c6Yxq5Zx5Zx5Zx5ZuO5Zx5Zx5Zx5Zx5Zx5Zx5Zx5Zx5Zx5', 'ADMIN'),
('user@example.com', 'user', '$2b$12$LQv3c6Yxq5Zx5Zx5Zx5ZuO5Zx5Zx5Zx5Zx5Zx5Zx5Zx5Zx5Zx5', 'USER'),
('test@example.com', 'testuser', '$2b$12$LQv3c6Yxq5Zx5Zx5Zx5ZuO5Zx5Zx5Zx5Zx5Zx5Zx5Zx5Zx5Zx5', 'USER')
ON CONFLICT (email) DO NOTHING;

-- Conectar a projects_db
\c projects_db;

-- Crear tabla projects
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla tasks
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