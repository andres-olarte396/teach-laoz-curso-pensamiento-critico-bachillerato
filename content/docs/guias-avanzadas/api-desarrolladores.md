# API para Desarrolladores

Para aquellos usuarios que desean integrar sus progresos o contenidos con herramientas externas, ofrecemos una API técnica basada en REST.

## Autenticación

Todas las peticiones deben incluir un Bearer Token en el encabezado de autorización. Puedes generar tu API Key desde el panel de ajustes de desarrollador en tu perfil.

## Endpoints Principales

### Cursos

`GET /api/courses` - Lista todos los cursos disponibles.
`GET /api/courses/:id` - Obtiene detalles de un curso específico.

### Progreso del Usuario

`GET /api/user/progress` - Devuelve el porcentaje de avance de todos tus cursos inscritos.

## Formato de Respuesta

Utilizamos formato **JSON** como estándar de intercambio de datos.

```json
{
  "id": "curso-python",
  "title": "Python para Científicos de Datos",
  "status": "in_progress",
  "percent": 45
}
```

> [!WARNING]
> La API tiene un límite de 1000 peticiones por hora para asegurar la estabilidad de la plataforma para todos los usuarios.
