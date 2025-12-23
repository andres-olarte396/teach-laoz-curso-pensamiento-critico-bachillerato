# Documento de Requerimientos

## 1. Contexto y propósito

### 1.1 Contexto

Este proyecto nace de la necesidad de crear una **plataforma técnica para la creación, distribución y comercialización de cursos especializados en tecnología**, orientados principalmente a **empresas (B2B)**.

A diferencia de un LMS tradicional, el foco inicial no está en la gestión académica compleja, sino en:

* Contenido técnico de alta calidad
* Material versionable y mantenible
* Independencia del contenido frente a la plataforma
* Escalabilidad hacia un LMS completo sin reescrituras

El contenido base de los cursos se construye en **Markdown**, acompañado de recursos técnicos como diagramas, fórmulas, código, PDFs, audio y video.

---

### 1.2 Propósito

El propósito principal del sistema es:

* Exponer cursos técnicos escritos en Markdown como **contenido HTML navegable**
* Permitir una experiencia de navegación similar a un repositorio técnico (ej. GitHub)
* Servir como base para un **LMS técnico B2B**, orientado a la venta de cursos a compañías

El sistema debe permitir que, en fases posteriores:

* Se incorporen usuarios
* Se mida progreso y resultados
* Se gestionen evaluaciones
* Se generen métricas y estadísticas

Todo esto **sin acoplar estas funcionalidades al contenido**.

---

### 1.3 Principios rectores

Desde el diseño inicial, el sistema se rige por los siguientes principios:

1. **Separación de responsabilidades**
   El contenido, los usuarios y la analítica pertenecen a contextos distintos.

2. **Contenido independiente de usuarios**
   Los cursos existen y pueden ser consumidos sin noción de progreso o identidad.

3. **Cursos como colecciones estructuradas**
   Los cursos son colecciones estructuradas de archivos, no entidades rígidas en base de datos.

4. **Arquitectura evolutiva**
   El sistema debe crecer por capas, no por parches.

5. **Orientación a largo plazo**
   Las decisiones priorizan mantenibilidad y extensibilidad sobre rapidez inicial.

---

### 1.4 Alcance del documento

Este documento define:

* Requerimientos funcionales y no funcionales
* Modelo conceptual del sistema
* Decisiones arquitectónicas clave
* Límites claros del sistema

No define:

* Detalles de implementación
* Tecnologías específicas de frontend
* Esquemas físicos de base de datos

Estos elementos se abordarán en fases posteriores del proyecto.

---

## 2. Alcance funcional

### 2.1 Alcance general

El sistema debe funcionar como un **motor de entrega y navegación de contenido técnico**, capaz de exponer cursos escritos en Markdown como contenido HTML navegable desde un navegador web.

El alcance funcional inicial se centra en:

* Lectura de contenido desde una fuente configurable
* Renderizado de Markdown a HTML
* Navegación estructurada de cursos y lecciones
* Exposición de recursos técnicos asociados

El sistema **no es inicialmente un LMS completo**, pero está diseñado para evolucionar hacia uno sin reestructuración del núcleo.

---

### 2.2 Funcionalidades incluidas

El sistema debe proveer, como mínimo, las siguientes funcionalidades:

#### 2.2.1 Gestión de contenido

* Lectura de cursos y lecciones desde:

  * Sistema de archivos local
  * Carpetas en red
  * Proveedores de almacenamiento externos (en fases futuras)

* Organización del contenido mediante:

  * Carpetas (estructura de directorios)
  * Archivos Markdown (contenido principal)
  * Recursos asociados (PDFs, imágenes, audio, video, HTML estático)

* Tipos de archivos soportados:

  * **Markdown** (.md) - contenido principal renderizado a HTML
  * **PDF** - visualización e incrustación
  * **Audio** - reproducción mediante HTML5 (mp3, wav, ogg)
  * **Video** - reproducción mediante HTML5 (mp4, webm, ogg)
  * **Imágenes** - jpg, png, svg, gif, webp
  * **HTML estático** - archivos HTML complementarios

---

#### 2.2.2 Renderizado de Markdown

* Conversión server-side de Markdown a HTML
* Soporte para:

  * Markdown estándar
  * Código con resaltado
  * Tablas y listas
  * Enlaces relativos
  * Imágenes embebidas
  * Mermaid
  * Fórmulas LaTeX
  * HTML embebido (modo controlado)

---

#### 2.2.3 Navegación del contenido

* Navegación tipo repositorio técnico:

  * Listado de carpetas
  * Listado de archivos
  * Acceso directo a lecciones

* Resolución correcta de rutas relativas entre archivos

* Generación de estructuras navegables (menú dinámico)

---

#### 2.2.4 Soporte de recursos

El sistema debe permitir visualizar o descargar:

* PDFs (visualización e incrustación)
* Imágenes (JPG, PNG, SVG, etc.)
* Audio (HTML5)
* Video (HTML5)
* Archivos HTML estáticos

**Principio de entrega de media:**

* El backend **no renderiza media**, solo la sirve correctamente al navegador
* El navegador es responsable de la reproducción y visualización
* Los recursos se resuelven mediante rutas relativas

---

### 2.3 Funcionalidades excluidas (fase inicial)

De forma explícita, **no están dentro del alcance inicial**:

* Gestión de usuarios
* Autenticación y autorización
* Seguimiento de progreso
* Evaluaciones
* Estadísticas y reportes
* Comercialización y pagos

Estas capacidades se consideran **evolutivas** y se abordarán en fases posteriores.

---

### 2.3.1 Exclusiones permanentes por diseño

El sistema **nunca debe incluir**:

* Ejecución de scripts arbitrarios desde el contenido
* Plugins dinámicos por curso
* Lógica de negocio embebida en el contenido Markdown
* Inyección de código no controlado

Estas restricciones garantizan seguridad, control y mantenibilidad del sistema.

---

### 2.4 Límites funcionales

El sistema:

* No permite edición de contenido desde el navegador
* No actúa como CMS visual
* No impone una metodología pedagógica
* No ejecuta scripts arbitrarios del contenido
* No renderiza media (solo la sirve al navegador)
* No incluye lógica de negocio en los archivos de contenido

Su responsabilidad termina en la **entrega estructurada del contenido técnico**.

El contenido debe ser **navegable como árbol**, permitiendo:

* Generación dinámica de menús
* Navegación similar a un repositorio técnico (ej. GitHub)
* Acceso directo mediante rutas

---

### 2.5 Criterio de evolución

Toda funcionalidad futura debe cumplir:

* No romper el Content Context
* No acoplar usuarios al contenido
* No introducir dependencias rígidas

Si una funcionalidad viola estos criterios, **no debe incorporarse**.

---

## 3. Soporte de formatos y contenido Configuración y portabilidad

### 3.1 Configuración por `.env`

El sistema debe permitir definir mediante variables de entorno:

* Fuente de archivos:

  * `LOCAL_FS`
  * `NETWORK_FS`
  * `CLOUD_STORAGE`

* Ruta base del contenido

* Modo de ejecución (dev / prod)

Ejemplo conceptual:

* `CONTENT_PROVIDER=local`
* `CONTENT_BASE_PATH=/data/cursos`

---

### 3.2 Abstracción de la fuente de archivos

La lectura de archivos **no debe depender directamente del sistema de archivos local**.

Se debe definir una capa de abstracción (ej. `ContentRepository`) que permita:

* Local filesystem
* Carpeta en red
* Azure Blob Storage
* Google Cloud Storage
* OneDrive / repositorio remoto

El cambio de proveedor **no debe afectar la lógica de negocio**.

---

### 3.3 Principios de portabilidad

El contenido debe ser **intercambiable** y **portable**:

* El origen del contenido es intercambiable (local, red, cloud)
* No existe acoplamiento directo entre dominio y proveedor de almacenamiento
* El acceso al contenido se abstrae mediante un contrato de repositorio
* La ubicación del contenido es configurable vía `.env`
* El sistema debe poder evolucionar sin reescribir el core

---

## 4. Arquitectura

### 4.1 Enfoque arquitectónico

Se requiere una arquitectura basada en principios de **Clean Architecture**:

* Separación clara de responsabilidades
* Dependencias apuntando hacia el dominio
* Infraestructura desacoplada

Capas sugeridas:

1. **Domain**

   * Entidades (Curso, Archivo, Directorio)
   * Interfaces (repositorios, servicios)

2. **Application**

   * Casos de uso (listar contenido, renderizar markdown, generar menú)

3. **Infrastructure**

   * Implementaciones concretas:

     * FileSystem local
     * Cloud storage
     * Markdown renderer

4. **Interface / API**

   * Express / Fastify
   * Controladores HTTP

---

### 4.2 Consideraciones de código

El sistema debe seguir principios de **Clean Architecture y Clean Code**:

* Código legible y explícito
* Nada de lógica compleja en controladores
* Validaciones claras
* Manejo consistente de errores
* Separación de responsabilidades
* Dependencias apuntando hacia el dominio

---

### 4.3 Principios de diseño

Se priorizan:

* **Estándares abiertos** (Markdown, HTML, HTTP)
* **Seguridad** (prevención de inyección, sanitización)
* **Mantenibilidad** (código claro, arquitectura limpia)
* **Configurabilidad** (sin hardcodear rutas o proveedores)
* **Portabilidad** (independencia de infraestructura)
* **Extensibilidad controlada** (sin plugins dinámicos)

---

## 5. Contrato del ContentRepository

### 5.1 Propósito

El **ContentRepository** define el contrato único mediante el cual el sistema accede al contenido de cursos, independientemente de dónde esté almacenado.

Esta interfaz es crítica: **toda la arquitectura depende de que sea estable, pequeña y explícita**. Ninguna capa superior debe conocer detalles del filesystem, cloud storage o red.

---

### 5.2 Responsabilidades del ContentRepository

El repositorio debe ser responsable únicamente de:

* Listar directorios y archivos
* Obtener contenido de archivos
* Exponer metadata básica

No debe:

* Renderizar Markdown
* Tomar decisiones de navegación
* Aplicar lógica de negocio

---

### 5.3 Entidades base

#### ContentNode

Representa cualquier elemento del árbol de contenido.

Campos conceptuales:

* `path`: ruta relativa normalizada
* `name`: nombre del archivo o carpeta
* `type`: `directory | markdown | binary`
* `extension`: opcional
* `size`: opcional
* `lastModified`: opcional

---

### 5.4 Contrato de la interfaz

Métodos mínimos esperados:

* `list(path: string): Promise<ContentNode[]>`

  * Lista el contenido de un directorio

* `getFile(path: string): Promise<Buffer | string>`

  * Obtiene el contenido bruto del archivo

* `exists(path: string): Promise<boolean>`

  * Valida existencia

* `isDirectory(path: string): Promise<boolean>`

  * Determina si es carpeta

---

### 5.5 Implementaciones previstas

Cada implementación debe cumplir estrictamente el contrato:

* `LocalFileSystemRepository`
* `NetworkFileSystemRepository`
* `AzureBlobRepository`
* `GoogleCloudStorageRepository`
* `OneDriveRepository`

La selección de implementación se realiza **por configuración**, nunca por código condicional disperso.

---

### 5.6 Reglas técnicas obligatorias

* Todas las rutas deben ser relativas al `CONTENT_BASE_PATH`
* Se debe prevenir directory traversal (`..`)
* El repositorio nunca devuelve rutas absolutas al exterior

---

## 6. API / Endpoints

### 5.1 Navegación de contenido

* `GET /content`

  * Lista carpetas y archivos raíz

* `GET /content/:path`

  * Si es carpeta: lista su contenido
  * Si es Markdown: devuelve HTML
  * Si es binario: lo sirve como archivo

---

### 5.2 Generación de menú dinámico

* `GET /menu`

El endpoint debe:

* Analizar la estructura de carpetas
* Generar un árbol navegable
* Permitir usarlo como menú de curso

Salida esperada:

* JSON estructurado (árbol)
* Orden configurable (por nombre, índice, metadata futura)

---

## 6. Usuarios, evaluaciones y analítica (diseño futuro)

### 6.1 Principio de diseño

Sí, **esto debe tenerse en cuenta desde ahora**, pero **no implementarse todavía**.

La decisión correcta es:

* Diseñar los límites
* Definir responsabilidades
* Evitar acoplamientos tempranos

El error común es mezclar desde ya contenido, usuarios y progreso. Este diseño lo evita.

---

### 6.2 Separación de contextos (Bounded Contexts)

Desde el diseño, el sistema debe contemplar **tres contextos claramente separados**:

1. **Content Context**

   * Cursos
   * Archivos
   * Markdown
   * Navegación

2. **Learning Context (futuro)**

   * Usuarios
   * Progreso
   * Evaluaciones
   * Resultados

3. **Analytics Context (futuro)**

   * Métricas
   * Estadísticas
   * Reportes

El Content Context **no debe depender** de usuarios.

---

### 6.3 Implicaciones arquitectónicas

Desde hoy, el diseño debe garantizar:

* El contenido es **estático y reusable**
* El progreso es **dinámico y por usuario**
* Las evaluaciones son **referencias al contenido**, no parte del contenido

Esto implica:

* IDs estables para cursos y lecciones
* Rutas de contenido predecibles
* Metadata en Markdown (frontmatter) para identificación

---

### 6.4 Base de datos (criterio evolutivo)

#### Estado actual

* No se usa base de datos
* El sistema funciona solo con archivos

#### Estado futuro (previsto)

Se incorporará una base de datos para:

* Usuarios
* Progreso por curso
* Resultados de evaluaciones
* Eventos de aprendizaje

La base de datos:

* **No almacena contenido**
* Solo almacena referencias

---

### 6.5 Tipos de datos previstos

Ejemplos conceptuales:

* User
* CourseProgress
* LessonProgress
* Evaluation
* EvaluationResult

Estas entidades **no existen aún**, pero el diseño debe permitir agregarlas sin romper el sistema.

---

## 7. Modelo conceptual del LMS técnico

### 7.1 Principio rector

El modelo conceptual **define el lenguaje del sistema**, no su implementación.

Regla clave:

* El **contenido existe sin usuarios**
* El **aprendizaje existe solo cuando hay usuarios**

Este modelo separa claramente ambos mundos.

---

## 7.2 Entidades del Content Context

### Course

Representa una unidad comercial y académica vendible.

Atributos conceptuales:

* `courseId` (estable, lógico)
* `title`
* `description`
* `level`
* `technologyTags`
* `version`
* `structure` (orden lógico de lecciones)

Notas:

* Un curso **mapea a una carpeta raíz**
* No conoce usuarios ni progreso

---

### Lesson

Representa una unidad mínima de aprendizaje.

Atributos conceptuales:

* `lessonId`
* `courseId`
* `title`
* `contentPath` (Markdown)
* `order`
* `estimatedTime`

Notas:

* Usualmente corresponde a un archivo Markdown
* Puede incluir recursos asociados

---

### Resource

Archivo asociado a una lección.

Atributos:

* `resourceId`
* `lessonId`
* `type` (pdf, video, audio, image)
* `path`

---

## 7.3 Entidades del Learning Context (futuro)

### User

Representa a un estudiante.

Atributos:

* `userId`
* `organizationId`
* `role`

---

### Enrollment

Vincula usuarios con cursos.

Atributos:

* `userId`
* `courseId`
* `status`
* `enrolledAt`

---

### LessonProgress

Estado de avance por lección.

Atributos:

* `userId`
* `lessonId`
* `status` (not_started, viewed, completed)
* `lastAccess`

---

## 7.4 Evaluaciones

### 7.4.1 Principios de diseño

Las evaluaciones forman parte del **Learning Context**, no del contenido estático.

Principios clave:

* El contenido enseña, la evaluación mide
* Las evaluaciones **referencian** cursos y lecciones
* El formato debe poder cambiar sin afectar al contenido

Esto evita acoplar lógica pedagógica al Markdown.

---

### 7.4.2 Evaluation

Define una evaluación asociada a un curso o subconjunto de lecciones.

Atributos conceptuales:

* `evaluationId` (identificador estable)
* `courseId`
* `lessonIds[]` (opcional)
* `type` (quiz | práctica | examen)
* `passingScore`
* `attemptsAllowed`
* `timeLimit` (opcional)
* `version`

Notas:

* Una evaluación puede evolucionar por versiones
* No contiene contenido formativo, solo reglas y estructura

---

### 7.4.3 EvaluationResult

Representa el resultado de una evaluación para un usuario.

Atributos:

* `evaluationId`
* `userId`
* `organizationId`
* `score`
* `passed`
* `attempt`
* `submittedAt`

Notas:

* El histórico de intentos es crítico en entornos corporativos

---

## 7.5 Analytics Context (futuro)

### 7.5.1 Principio

La analítica se construye a partir de **eventos inmutables**.

No se calculan métricas directamente desde estados; los estados se derivan de eventos.

---

### 7.5.2 LearningEvent

Evento generado por una acción relevante del usuario.

Tipos de eventos previstos:

* `course_started`
* `lesson_viewed`
* `lesson_completed`
* `evaluation_started`
* `evaluation_submitted`

Atributos:

* `eventId`
* `userId`
* `organizationId`
* `courseId`
* `lessonId` (opcional)
* `evaluationId` (opcional)
* `type`
* `timestamp`

Notas:

* En fases iniciales los eventos pueden solo emitirse (log)
* En fases avanzadas se persisten para analítica

---

## 8. API / Endpoints (visión evolutiva)

### 8.1 Content API (actual)

Endpoints disponibles en la primera versión:

* `GET /content`

  * Lista contenido raíz

* `GET /content/:path`

  * Navega carpetas o renderiza archivos

* `GET /menu`

  * Devuelve estructura navegable del curso

---

### 8.2 Learning API (futuro)

Endpoints previstos para LMS:

* `POST /auth/login`
* `GET /courses`
* `POST /courses/:id/enroll`
* `GET /progress/:courseId`

---

### 8.3 Evaluation API (futuro)

* `GET /evaluations/:courseId`
* `POST /evaluations/:evaluationId/submit`

---

## 9. Seguridad

### 9.1 Principios mínimos

* Aislamiento lógico por organización (B2B)
* Control de acceso basado en roles
* Prevención de path traversal
* Sanitización estricta de Markdown y HTML

---

## 10. Roadmap técnico

### Fase 1 – Motor de contenido

* ContentRepository
* MarkdownRenderingService
* Navegación y menú dinámico

### Fase 2 – Modelo educativo

* Frontmatter estandarizado
* Identidad estable de cursos y lecciones

### Fase 3 – LMS básico

* Usuarios
* Progreso
* Evaluaciones simples

### Fase 4 – Analítica y escalado

* Persistencia de eventos
* Estadísticas
* Multi-tenant completo

---

## 11. Cierre

Este diseño establece una base **sólida, extensible y comercialmente viable** para un LMS técnico B2B.

La clave no será agregar funcionalidades rápido, sino **mantener las separaciones definidas**.

Si estas fronteras se respetan, el sistema podrá evolucionar sin reescrituras mayores.
