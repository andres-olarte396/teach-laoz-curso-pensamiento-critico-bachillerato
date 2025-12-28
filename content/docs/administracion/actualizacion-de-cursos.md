# Guía de Actualización de Cursos

Mantener el contenido al día es fundamental. Aquí se explica cómo realizar cambios de forma segura.

## Modificación de Textos y Metadatos

1. Localiza el archivo `README.md` o `INDICE.md` del curso en `content/courses/[id-curso]/`.
2. Realiza los cambios necesarios en el texto o en el bloque Frontmatter YAML.
3. Guarda el archivo.

## Actualización de Estructura (Módulos)

Si añades nuevos archivos markdown para lecciones:

- Asegúrate de que el nombre sea descriptivo (ej. `01_conceptos_basicos.md`).
- Si utilizas un archivo `course.json`, recuerda actualizar la lista de lecciones para que el nuevo archivo aparezca en el menú lateral del curso.

## Refrecar Cambios en el LMS

El backend escanea el sistema de archivos al iniciar. Si realizas cambios masivos:

1. Asegúrate de que el contenedor de Docker tenga acceso a la carpeta de contenido actualizada.
2. Si los cambios no se ven reflejados, puedes usar el comando:

   ```bash
   docker-compose restart backend
   ```

## Resolución de Problemas

- **El curso no aparece**: Verifica que el `README.md` tenga el formato correcto y que no haya errores de sintaxis en el YAML.
- **La categoría es incorrecta**: Comprueba que el nombre de la categoría coincida exactamente con la lista oficial (ver Guía de Categorización).
