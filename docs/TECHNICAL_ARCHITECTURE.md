- **Fastify** 4.x
  - Alto rendimiento
  - TypeScript-first
  - Schema validation incorporada
  - Plugin system limpio

**Alternativa considerada:** Express (más popular pero menos performante)

### 2.3 Renderizado de Markdown

#### Motor principal

- **Unified** ecosystem:
  - `remark` - parser Markdown
  - `remark-parse` - parsing
  - `remark-rehype` - conversión Markdown → HTML
  - `rehype-stringify` - serialización HTML

#### Plugins esenciales

- `remark-gfm` - GitHub Flavored Markdown
- `rehype-highlight` - resaltado de código
- `rehype-slug` - IDs en headings
- `rehype-autolink-headings` - enlaces automáticos

#### Extensiones especiales

- **Mermaid**: `remark-mermaidjs`
- **LaTeX**: `remark-math` + `rehype-katex`
- **Sanitización**: `rehype-sanitize`

### 2.4 Gestión de configuración

- **dotenv** - variables de entorno
- **joi** o **zod** - validación de configuración

### 2.5 Testing

- **Vitest** - test runner moderno y rápido
- **Supertest** - testing de endpoints HTTP
- **msw** - mocking de servicios externos (futuro)

### 2.6 Calidad de código

- **ESLint** - linting
- **Prettier** - formateo
- **Husky** - git hooks
- **lint-staged** - lint solo en archivos modificados

### 2.7 Logging

- **Pino** - logging estructurado de alto rendimiento

---

## 3. Estructura de carpetas

```
teach-laoz-learning-management-system/
├── src/
│   ├── domain/                    # Capa de dominio (núcleo)
│   │   ├── entities/
│   │   │   ├── ContentNode.ts    # Entidad: nodo de contenido
│   │   │   ├── Course.ts         # Entidad: curso (conceptual)
│   │   │   └── index.ts
│   │   ├── repositories/
│   │   │   └── IContentRepository.ts  # Contrato del repositorio
│   │   ├── services/
│   │   │   └── IMarkdownRenderer.ts   # Contrato del renderizador
│   │   └── value-objects/
│   │       ├── ContentPath.ts    # Ruta normalizada
│   │       └── ContentType.ts    # Tipo de contenido
│   │
│   ├── application/               # Capa de aplicación (casos de uso)
│   │   ├── use-cases/
│   │   │   ├── ListContent.ts
│   │   │   ├── GetContent.ts
│   │   │   ├── RenderMarkdown.ts
│   │   │   └── GenerateMenu.ts
│   │   ├── dtos/                 # Data Transfer Objects
│   │   │   ├── ContentListDto.ts
│   │   │   ├── ContentDto.ts
│   │   │   └── MenuDto.ts
│   │   └── errors/               # Errores de aplicación
│   │       ├── ContentNotFoundError.ts
│   │       └── InvalidPathError.ts
│   │
│   ├── infrastructure/            # Capa de infraestructura
│   │   ├── repositories/
│   │   │   ├── LocalFileSystemRepository.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── UnifiedMarkdownRenderer.ts
│   │   │   └── index.ts
│   │   ├── config/
│   │   │   ├── environment.ts    # Carga y validación de .env
│   │   │   └── markdown.config.ts
│   │   └── http/
│   │       ├── server.ts         # Setup de Fastify
│   │       └── plugins/
│   │           ├── cors.ts
│   │           └── helmet.ts
│   │
│   ├── interface/                 # Capa de interfaz (API)
│   │   ├── http/
│   │   │   ├── routes/
│   │   │   │   ├── content.routes.ts
│   │   │   │   └── menu.routes.ts
│   │   │   ├── controllers/
│   │   │   │   ├── ContentController.ts
│   │   │   │   └── MenuController.ts
│   │   │   ├── schemas/          # JSON schemas para validación
│   │   │   │   └── content.schema.ts
│   │   │   └── middleware/
│   │   │       ├── errorHandler.ts
│   │   │       └── pathValidator.ts
│   │   └── mappers/              # Mapeo entidades → DTOs
│   │       └── ContentMapper.ts
│   │
│   ├── shared/                    # Código compartido
│   │   ├── utils/
│   │   │   ├── path-normalizer.ts
│   │   │   └── mime-type.ts
│   │   └── logger/
│   │       └── logger.ts
│   │
│   └── index.ts                   # Entry point
│
├── tests/
│   ├── unit/
│   │   ├── domain/
│   │   ├── application/
│   │   └── infrastructure/
│   ├── integration/
│   │   └── http/
│   └── fixtures/                  # Datos de prueba
│       └── sample-content/
│
├── content/                       # Contenido de ejemplo (local)
│   └── courses/
│       └── example-course/
│           ├── README.md
│           └── lesson-01.md
│
├── docs/                          # Documentación adicional
│   ├── API.md
│   └── CONTRIBUTING.md
│
├── .env.example
├── .eslintrc.js
├── .gitignore
├── .prettierrc
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── REQUERIMENT.md
├── SYSTEM_DEFINITIONS.md
├── TECHNICAL_ARCHITECTURE.md
└── README.md
```

---

## 4. Flujo de dependencias (Clean Architecture)

```
┌─────────────────────────────────────────────────┐
│              INTERFACE LAYER                     │
│  (HTTP Controllers, Routes, Schemas)            │
│                     ↓                            │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│            APPLICATION LAYER                     │
│  (Use Cases, DTOs, Application Errors)          │
│                     ↓                            │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│              DOMAIN LAYER                        │
│  (Entities, Interfaces, Value Objects)          │
│             ↑ (depends on)                       │
└─────────────────────────────────────────────────┘
                      ↑
┌─────────────────────────────────────────────────┐
│          INFRASTRUCTURE LAYER                    │
│  (Repositories, Services, Config, HTTP)         │
└─────────────────────────────────────────────────┘
```

**Reglas:**

- Domain **nunca** importa de otras capas
- Application solo importa de Domain
- Infrastructure implementa interfaces de Domain
- Interface orquesta Application e Infrastructure

---

## 5. Contratos clave (interfaces)

### 5.1 IContentRepository

```typescript
export interface IContentRepository {
  list(path: string): Promise<ContentNode[]>;
  getFile(path: string): Promise<Buffer | string>;
  exists(path: string): Promise<boolean>;
  isDirectory(path: string): Promise<boolean>;
  getMetadata(path: string): Promise<ContentMetadata>;
}
```

### 5.2 IMarkdownRenderer

```typescript
export interface IMarkdownRenderer {
  render(markdown: string, options?: RenderOptions): Promise<string>;
  renderWithMeta(markdown: string): Promise<{
    html: string;
    frontmatter: Record<string, any>;
    toc: TocItem[];
  }>;
}
```

### 5.3 ContentNode (entidad)

```typescript
export class ContentNode {
  constructor(
    public readonly path: ContentPath,
    public readonly name: string,
    public readonly type: ContentType,
    public readonly extension?: string,
    public readonly size?: number,
    public readonly lastModified?: Date
  ) {}

  isDirectory(): boolean {
    return this.type === ContentType.DIRECTORY;
  }

  isMarkdown(): boolean {
    return this.type === ContentType.MARKDOWN;
  }

  isBinary(): boolean {
    return this.type === ContentType.BINARY;
  }
}
```

---

## 6. Configuración (.env)

### Variables de entorno requeridas

```bash
# Entorno
NODE_ENV=development

# Servidor
PORT=3000
HOST=0.0.0.0

# Contenido
CONTENT_PROVIDER=local
CONTENT_BASE_PATH=./content/courses

# Seguridad
CORS_ORIGIN=http://localhost:5173
ALLOWED_FILE_EXTENSIONS=.md,.pdf,.jpg,.jpeg,.png,.svg,.gif,.webp,.mp3,.mp4,.wav,.ogg,.webm

# Logging
LOG_LEVEL=info
LOG_PRETTY=true

# Markdown
MARKDOWN_SANITIZE=true
MARKDOWN_ALLOW_HTML=false
```

---

## 7. Seguridad

### 7.1 Path Traversal Prevention

```typescript
export class ContentPath {
  private constructor(private readonly value: string) {
    this.validate();
  }

  private validate(): void {
    if (this.value.includes("..")) {
      throw new InvalidPathError("Path traversal detected");
    }
    // Normalizar y validar
  }

  static create(path: string): ContentPath {
    const normalized = path.replace(/\\/g, "/").replace(/^\/+/, "");
    return new ContentPath(normalized);
  }
}
```

### 7.2 Sanitización de HTML

- Usar `rehype-sanitize` con configuración estricta
- Whitelist de tags HTML permitidos
- Remover scripts y event handlers

### 7.3 CORS y Headers de seguridad

```typescript
// Fastify plugins
await fastify.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Para Mermaid
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
});

await fastify.register(cors, {
  origin: process.env.CORS_ORIGIN,
  credentials: true,
});
```

---

## 8. Manejo de errores

### Jerarquía de errores

```typescript
// Base
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

// Específicos
export class ContentNotFoundError extends DomainError {}
export class InvalidPathError extends DomainError {}
export class RenderError extends DomainError {}
```

### Error handler global

```typescript
fastify.setErrorHandler((error, request, reply) => {
  if (error instanceof DomainError) {
    return reply.status(400).send({
      error: error.name,
      message: error.message,
    });
  }

  fastify.log.error(error);
  return reply.status(500).send({
    error: "InternalServerError",
    message: "An unexpected error occurred",
  });
});
```

---

## 9. API Endpoints

### 9.1 GET /api/content

Lista el contenido raíz.

**Response:**

```json
{
  "items": [
    {
      "path": "course-01",
      "name": "course-01",
      "type": "directory",
      "lastModified": "2025-12-23T10:00:00Z"
    }
  ]
}
```

### 9.2 GET /api/content/:path

Obtiene contenido de una ruta específica.

**Carpeta:**

```json
{
  "type": "directory",
  "path": "course-01",
  "items": [...]
}
```

**Markdown:**

```json
{
  "type": "markdown",
  "path": "course-01/lesson-01.md",
  "html": "<h1>Lesson 1</h1>...",
  "frontmatter": {
    "title": "Lesson 1",
    "order": 1
  }
}
```

**Binario:**

- Content-Type apropiado
- Stream del archivo

### 9.3 GET /api/menu

Genera menú dinámico.

```json
{
  "courses": [
    {
      "id": "course-01",
      "title": "Course 01",
      "path": "course-01",
      "lessons": [
        {
          "id": "lesson-01",
          "title": "Lesson 1",
          "path": "course-01/lesson-01.md",
          "order": 1
        }
      ]
    }
  ]
}
```

---

## 10. Testing strategy

### 10.1 Unit tests

- Entidades de dominio
- Value objects
- Casos de uso (con mocks)

### 10.2 Integration tests

- Repositorio con filesystem real
- Renderizado de Markdown completo
- Endpoints HTTP

### 10.3 Coverage target

- Mínimo: 70%
- Domain & Application: 90%+

---

## 11. Scripts de npm

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "format": "prettier --write \"src/**/*.ts\"",
    "type-check": "tsc --noEmit"
  }
}
```

---

## 12. Roadmap de implementación

### Fase 1.1 - Setup inicial (1-2 días)

- [x] Estructura de carpetas
- [ ] Configuración TypeScript
- [ ] ESLint + Prettier
- [ ] Vitest
- [ ] Entidades básicas

### Fase 1.2 - Domain & Application (3-4 días)

- [ ] ContentNode, ContentPath, ContentType
- [ ] IContentRepository interface
- [ ] IMarkdownRenderer interface
- [ ] Casos de uso básicos

### Fase 1.3 - Infrastructure (4-5 días)

- [ ] LocalFileSystemRepository
- [ ] UnifiedMarkdownRenderer (con Mermaid y LaTeX)
- [ ] Configuration management

### Fase 1.4 - Interface Layer (3-4 días)

- [ ] Fastify setup
- [ ] Routes y controllers
- [ ] Error handling
- [ ] Validación de schemas

### Fase 1.5 - Testing & Polish (2-3 días)

- [ ] Unit tests
- [ ] Integration tests
- [ ] Documentación API
- [ ] Content de ejemplo

### Fase 1.6 - Features avanzadas (3-5 días)

- [ ] Generación de menú dinámico
- [ ] Soporte completo de frontmatter
- [ ] Cache de renderizado
- [ ] Mejoras de performance

**Total estimado:** 16-23 días de desarrollo

---

## 13. Decisiones técnicas pendientes

### Para revisar en Fase 2

- Sistema de cache (Redis vs in-memory)
- Versionado de contenido (Git integration)
- Búsqueda full-text (Elastic vs local)
- CDN para assets estáticos

### Para Fase 3 (LMS)

- Base de datos (PostgreSQL recomendado)
- ORM (Prisma vs TypeORM)
- Autenticación (JWT vs sessions)
- WebSockets para progreso real-time

---

## 14. Referencias

- [Fastify Documentation](https://www.fastify.io/)
- [Unified Ecosystem](https://unifiedjs.com/)
- [Clean Architecture (Uncle Bob)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
