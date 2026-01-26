# Resumen de definiciones del sistema

- Sistema backend en **Node.js** orientado a servir contenido educativo técnico.
- El contenido fuente está basado principalmente en **Markdown**, renderizado a **HTML** para navegador.
- El sistema permite **navegación tipo repositorio**, similar a GitHub, sobre la estructura de archivos.
- Los cursos son **colecciones estructuradas de archivos**, no entidades rígidas en base de datos.
- Los archivos pueden incluir **Markdown, PDFs, audio, video, imágenes y HTML estático**.
- El sistema soporta **Mermaid** embebido dentro de Markdown.
- El sistema soporta **fórmulas matemáticas en LaTeX** (inline y block) dentro de Markdown.
- Se permite **incrustación de PDFs, audios y videos** dentro del contenido.
- Los recursos asociados (imágenes, media, adjuntos) se resuelven mediante **rutas relativas**.
- El backend **no renderiza media**, solo la sirve correctamente al navegador.
- El contenido debe ser **navegable como árbol**, con generación dinámica de menús.
- La ubicación del contenido es **configurable vía `.env`**.
- El origen del contenido es **intercambiable**:

  - carpeta local
  - carpeta en red
  - almacenamiento cloud (Azure, Google, OneDrive, etc.)

- El acceso al contenido se abstrae mediante un **contrato de repositorio** (Clean Architecture).
- No existe acoplamiento directo entre dominio y proveedor de almacenamiento.
- El sistema debe poder **evolucionar sin reescribir el core**.
- Inicialmente **no requiere base de datos** para servir contenido.
- Se contempla a futuro:

  - usuarios
  - progreso por curso
  - evaluaciones
  - resultados
  - estadísticas

- El diseño debe permitir incorporar usuarios **sin romper el modelo actual**.
- El sistema está pensado como **base evolutiva hacia un LMS**, no como LMS completo desde el inicio.
- El enfoque es **B2B**, orientado a vender cursos técnicos a compañías.
- Se priorizan **estándares abiertos**, seguridad y mantenibilidad.
- Se excluye explícitamente:

  - ejecución de scripts arbitrarios
  - plugins dinámicos por curso
  - lógica de negocio en el contenido

- La arquitectura debe seguir principios de **Clean Architecture y Clean Code**.
- El sistema debe ser **configurable, portable y extensible**, pero controlado.

---
