# EVALUACIÓN: SINTAXIS XML

## CUESTIONARIO

### Pregunta 1: Case Sensitivity

¿Cuál de las siguientes etiquetas renderizará un círculo válido en SVG?

- a) `<CIRCLE cx="10" ... />`
- b) `<circle cx="10" ... />` (Correcta)
- c) `<Circle cx="10" ... />`

### Pregunta 2: Cierre de Etiquetas

¿Qué sintaxis es correcta para un elemento sin contenido interno (como una línea)?

- a) `<line x1="0" y1="0" ... >` (sin cerrar)
- b) `<line x1="0" y1="0" ... />` (autocierre) (Correcta)
- c) `<line x1="0" y1="0" ... > <end>`

### Pregunta 3: Atributos

¿Qué atributo está mal escrito según las reglas XML?

- a) `fill="red"`
- b) `width='100'` (comillas simples)
- c) `height=100` (sin comillas) (Correcta)

---

## SOLUCIONARIO

### Pregunta 1: Solución

**Respuesta**: b) `<circle ... />`.
**Explicación**: SVG es completamente minúsculas para nombres de etiquetas (camelCase solo en atributos).

### Pregunta 2: Solución

**Respuesta**: b) Autocierre `/>`.
**Explicación**: En XML, si no hay etiqueta de cierre explícita `</line>`, debes usar la barra al final de la etiqueta de apertura.

### Pregunta 3: Solución

**Respuesta**: c) `height=100`.
**Explicación**: XML exige comillas (simples o dobles) alrededor de todo valor.
