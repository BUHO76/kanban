 📊 Kanban clone app

Aplicación moderna de gestión de proyectos con arquitectura de microservicios, tablero Kanban y autenticación JWT.

## ✨ Características

### Backend (Microservicios)
- ✅ **User Service**: Registro, login con JWT, roles (ADMIN/USER)
- ✅ **Project Service**: CRUD de proyectos y tareas
- ✅ **Asignación de tareas** a usuarios
- ✅ **Cambio de estado** de tareas (TODO, IN_PROGRESS, DONE)
- ✅ **Base de datos PostgreSQL** con migraciones

### Frontend (React)
- ✅ **Login/Registro** con validación
- ✅ **Dashboard** con lista de proyectos
- ✅ **Tablero Kanban** con drag & drop
- ✅ **Crear/Editar tareas** con modal
- ✅ **Manejo de estado** con Zustand
- ✅ **Manejo de errores** y loading states
- ✅ **Diseño responsive** con Tailwind CSS

### Docker
- ✅ **Contenedores separados** por servicio
- ✅ **docker-compose** para orquestación
- ✅ **Volúmenes persistentes** para PostgreSQL

## 🛠️ Tecnologías

### Backend
- **FastAPI** - Framework web moderno y rápido
- **SQLAlchemy** - ORM para Python
- **JWT** - Autenticación segura
- **Pydantic** - Validación de datos

### Frontend
- **React 18** - Biblioteca UI
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **Zustand** - Manejo de estado
- **React Hook Form** - Formularios
- **DnD Kit** - Drag and drop
- **React Router** - Navegación

### Base de Datos
- **PostgreSQL 15** - Base de datos relacional

### DevOps
- **Docker** - Contenedores
- **Docker Compose** - Orquestación

## 📦 Requisitos Previos

- **Docker Desktop** 4.0+ ([Descargar](https://www.docker.com/products/docker-desktop/))
- **Git** ([Descargar](https://git-scm.com/downloads))
- **Node.js 18+** (opcional, para desarrollo)
- **Python 3.11+** (opcional, para desarrollo)
- **4GB RAM libre** mínimo
- **10GB espacio en disco**

## 🚀 Instalación Rápida

### 1. Clonar el repositorio

```bash
# Usando HTTPS
git clone https://github.com/BUHO76/kanban.git
# Entrar al directorio
cd kanban
# En Windows (PowerShell como Administrador)
docker-compose up --build
# En Linux/Mac
sudo docker-compose up --build
