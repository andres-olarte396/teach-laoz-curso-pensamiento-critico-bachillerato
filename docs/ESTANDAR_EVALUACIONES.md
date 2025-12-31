# Estándar para Creación de Evaluaciones en Markdown

Este documento define el formato estándar para que el sistema (LMS) procese correctamente los cuestionarios y exámenes.

## Estructura General

El archivo debe tener la siguiente estructura básica:

```markdown
# Título de la Evaluación

## FICHA TÉCNICA

- **Tiempo**: 30 min
- **Dificultad**: Intermedio

## CUESTIONARIO

### Pregunta 1: Enunciado de la pregunta...

- a) Opción incorrecta
- b) Opción correcta (Correcta)
- c) Otra opción incorrecta

### Pregunta 2: ¿Cuál es el valor de X?

- a) 10
- b) **20**
- c) 30
```

## Reglas de Formato

### 1. Título

Debe ser el primer encabezado del archivo (`# Título`).

### 2. Preguntas

**IMPORTANTE:** El sistema busca preguntas usando encabezados de nivel 3 (`###`) que comiencen con la palabra "Pregunta" (o "Question").

- ✅ **Correcto:** `### Pregunta 1: ¿Qué es HTML?`
- ✅ **Correcto:** `### Question 2: Define CSS.`
- ❌ **Incorrecto:** `1. ¿Qué es HTML?` (Falta el encabezado `### Pregunta`)

### 3. Opciones de Respuesta

Se pueden usar listas con letras (`a)`, `b)`) o números (`1.`, `2.`).

- Formato: `- a) Texto de la opción`

### 4. Definir la Respuesta Correcta

Existen dos métodos soportados para marcar la respuesta correcta:

**Método A: Etiqueta (Recomendado)**
Agregar el texto `(Correcta)` o `(Correcto)` al final de la opción. El sistema ocultará esta etiqueta al usuario.

```markdown
- a) Esta es incorrecta
- b) Esta es la correcta (Correcta)
```

**Método B: Negrita**
Poner todo el texto de la opción entre asteriscos dobles.

```markdown
- a) Opción incorrecta
- b) **Opción correcta y resaltada**
```

### 5. Retroalimentación (Feedback)

Puedes agregar una sección de "Solucionario" al final para dar feedback detallado (Opcional).

```markdown
## SOLUCIONARIO

### Respuesta 1: b)

> **Justificación**: La opción b es correcta porque HTML es un lenguaje de marcado...
```
