# Guía de Categorización

La categorización permite agrupar los cursos en la biblioteca y asignarles iconos visuales premium.

# Categorización de Contenidos

La categorización es fundamental para que los estudiantes encuentren tu curso fácilmente. El sistema utiliza etiquetas estandarizadas para filtrar el árbol de contenidos.

## Categorías Disponibles

| Categoría                   | Slug (En Frontmatter)   | Color UI    |
| :-------------------------- | :---------------------- | :---------- |
| **Tecnología & Software**   | `tecnologia-software`   | Emerald     |
| **Finanzas & Economía**     | `finanzas-economia`     | Blue        |
| **Educación & Soft Skills** | `educacion-soft-skills` | Amber       |
| **Datos & Analítica**       | `datos-analitica`       | Purple/Cyan |

## ¿Cómo se aplica?

En el frontmatter de tu archivo principal (`README.md` o `INDICE.md`), añade la propiedad `category`:

```yaml
---
category: "Tecnología & Software"
---
```

> [!IMPORTANT]
> Si una categoría no existe en el sistema, los cursos se agruparán bajo la categoría predeterminada **"General"**.
