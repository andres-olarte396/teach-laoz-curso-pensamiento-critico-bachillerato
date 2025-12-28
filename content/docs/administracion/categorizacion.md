# Guía de Categorización

La categorización permite agrupar los cursos en la biblioteca y asignarles iconos visuales premium.

## Categorías Unificadas

Para asegurar la consistencia, utiliza exactamente uno de los siguientes nombres en el campo `category` del frontmatter:

- **Tecnología & Software**: Cursos de programación, arquitectura, devops y bases de datos.
- **Finanzas & Economía**: Inversiones, trading, economía personal y finanzas corporativas.
- **Educación & Soft Skills**: Comunicación, pedagogía, liderazgo y habilidades blandas.
- **Datos & Analítica**: Power BI, Excel avanzado, Data Science y estadística.

## Ejemplo de Configuración

```yaml
---
category: "Tecnología & Software"
---
```

## Slugs y Sidebar

El Sidebar utiliza "Slugs" para filtrar los cursos. La plataforma normaliza automáticamente los nombres, pero es vital mantener los nombres exactos listados arriba para que los iconos SVG se carguen correctamente.

- **Tecnología & Software** -> Icono: Engranajes / Código.
- **Finanzas & Economía** -> Icono: Gráfico / Análisis.
- **Educación & Soft Skills** -> Icono: Rayo / Libro.
- **Datos & Analítica** -> Icono: Red / Nodos.

> [!IMPORTANT]
> Si una categoría no existe en el sistema, los cursos se agruparán bajo la categoría predeterminada **"General"**.
