# Teach LAOZ - Learning Management System

Sistema técnico de gestión de aprendizaje para contenido educativo B2B.

## 📋 Descripción

Plataforma para crear, distribuir y comercializar cursos técnicos especializados, construidos sobre contenido en Markdown con soporte para recursos multimedia, diagramas y fórmulas matemáticas.

## 🎯 Características principales


## 🏗️ Arquitectura

Este proyecto sigue principios de **Clean Architecture**:


Ver [TECHNICAL_ARCHITECTURE.md](./docs/TECHNICAL_ARCHITECTURE.md) para más detalles.

## 🚀 Quick Start

### Prerequisitos


### Instalación

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Iniciar en modo desarrollo
npm run dev
```

### Scripts disponibles

```bash
npm run dev           # Desarrollo con hot-reload
npm run build         # Compilar TypeScript
npm start             # Ejecutar versión compilada
npm test              # Ejecutar tests
npm run test:coverage # Tests con coverage
npm run lint          # Linting
npm run format        # Formateo de código
```

## 🛠️ Scripts de Automatización

El proyecto incluye scripts en la carpeta `scripts/` para facilitar tareas comunes:

### 1. Iniciar Entorno de Desarrollo

```powershell
.\scripts\start-dev.ps1
```

Abre automáticamente terminales para Backend y Frontend.

### 2. Cargar Datos Iniciales (Seed)

```bash
# Desde la raíz backend
npm run seed --prefix backend
```

Crea un usuario administrador por defecto (`admin@teachlaoz.com` / `admin`).

### 3. Descargar Cursos (Interactivo)

El sistema permite descargar y actualizar cursos de forma masiva desde repositorios Git externos.

```bash
# Ejecutar el script interactivo
npx tsx scripts/download-courses.ts
```

Este script lee la lista de repositorios desde `COURSE_REPOSITORIES.md` y permite seleccionar qué cursos descargar o actualizar mediante un menú interactivo.

## 🐳 Docker Deployment

Puedes ejecutar todo el stack (Frontend + Backend + Base de Datos) usando Docker Compose:

```bash
docker-compose up --build
```

El sistema estará disponible en:

- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:3000

## 📁 Estructura de carpetas

```
src/
├── domain/           # Núcleo del negocio
├── application/      # Casos de uso
├── infrastructure/   # Implementaciones
├── interface/        # API HTTP
└── shared/           # Utilidades compartidas
```

## 📚 Documentación

Ver [docs/README.md](./docs/README.md) para el índice completo de documentación.

### Documentos principales:

- [STATUS_REPORT.md](./docs/STATUS_REPORT.md) - 🆕 Reporte de estado del proyecto
- [REQUERIMENT.md](./docs/REQUERIMENT.md) - Documento de requerimientos completo
- [SYSTEM_DEFINITIONS.md](./docs/SYSTEM_DEFINITIONS.md) - Definiciones del sistema
- [TECHNICAL_ARCHITECTURE.md](./docs/TECHNICAL_ARCHITECTURE.md) - Arquitectura técnica detallada
- [SETUP.md](./docs/SETUP.md) - Guía de instalación y configuración

## 🔧 Stack tecnológico

- **Runtime**: Node.js 20+
- **Lenguaje**: TypeScript 5.x
- **Framework**: Fastify 4.x
- **Markdown**: Unified ecosystem (remark/rehype)
- **Testing**: Vitest
- **Linting**: ESLint + Prettier

## 📝 Roadmap

### Fase 1 - Motor de contenido (actual)

- [ ] ContentRepository
- [ ] MarkdownRenderingService
- [ ] Navegación y menú dinámico
- [ ] Soporte para simulaciones HTML interactivas e incrustación

### Fase 2 - Modelo educativo

- [ ] Frontmatter estandarizado
- [ ] Identidad estable de cursos

### Fase 3 - LMS básico

- [ ] Usuarios y autenticación
- [ ] Progreso por curso
- [ ] Evaluaciones

### Fase 4 - Analítica

- [ ] Eventos de aprendizaje
- [ ] Estadísticas
- [ ] Multi-tenant

## 🤝 Contribuir

Este proyecto sigue principios de Clean Code y Clean Architecture. Por favor lee la documentación técnica antes de contribuir.

## 📄 Licencia

MIT

## 👥 Autores

LAOZ Development Team
