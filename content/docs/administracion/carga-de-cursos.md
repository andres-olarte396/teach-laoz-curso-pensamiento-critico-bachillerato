# Guía de Carga de Cursos

Esta guía detalla el proceso para subir nuevos contenidos a la plataforma Teach LAOZ. El sistema carga los cursos dinámicamente desde el sistema de archivos.

## Estructura de Directorios

Cada curso debe residir en su propia carpeta dentro de `content/courses/`. El nombre de la carpeta se convertirá en el `id` técnico del curso.

```bash
content/courses/
└── mi-nuevo-curso/
    ├── README.md (Recomendado)
    ├── INDICE.md (Opcional, para metadatos)
    ├── course.json (Opcional, estructura de módulos)
    └── modulos/
        ├── 01_introduccion/
        └── ...
```

## Archivos de Metadatos

El sistema busca metadatos (título, autor, categoría) en los archivos `README.md`, `index.md` o `INDICE.md`. Estos deben incluir un bloque **Frontmatter YAML** al inicio:

```yaml
---
title: "Título del Curso"
summary: "Breve descripción de lo que el alumno aprenderá."
category: "Tecnología & Software"
level: "Básico"
author: "Tu Nombre"
tags: ["web", "react", "tutorial"]
---
```

## Proceso de Carga

1. **Crear Carpeta**: Genera una carpeta con un nombre representativo (ej. `teach-laoz-curso-python`).
2. **Agregar Contenido**: Incluye al menos un `README.md` con el frontmatter básico.
3. **Validación**: Asegúrate de que el bloque YAML esté correctamente cerrado con `---`.
4. **Sincronización**: Si el LMS corre en Docker, el sistema detectará el cambio automáticamente al reiniciar el servicio o reconstruir el volumen.

> [!NOTE]
> El sistema prioriza `INDICE.md` sobre `README.md` para la lectura de metadatos si ambos existen.
