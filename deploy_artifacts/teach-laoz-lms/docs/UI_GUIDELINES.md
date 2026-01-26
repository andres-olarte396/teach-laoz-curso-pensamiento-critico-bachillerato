# Guia de Estilos y Calidad de UI

Este documento define las especificaciones que el "Agente Evaluador" (humano o automatizado) debe verificar en la interfaz de usuario.

## 1. Accesibilidad y Contraste

### 1.1 Botones de Acción

- **Regla:** Todos los botones deben tener un contraste suficiente entre el fondo y el texto.
- **Específico (Botones Verdes/Emerald):**
  - Cuando se use `bg-emerald-500` o similar, el texto **debe ser blanco** (`text-white`) y forzado si es necesario (`!text-white`) para evitar que estilos globales lo sobrescriban.
  - **Nunca** usar texto gris o del color del tema principal sobre fondos saturados.

### 1.2 Feedback de Estado

- Los mensajes de éxito (verde), error (rojo) o advertencia (amarillo) deben usar iconos claros además del color.

## 2. Componentes de Evaluación (Quiz)

### 2.1 Navegación

- El botón "Siguiente Lección" al finalizar un quiz debe ser prominente.
- Verificar siempre que el texto dentro del botón sea legible en el modo oscuro ("Dark Mode").

## 3. Revisión de Cambios

Antes de aprobar un cambio de UI, verificar:

1. [ ] ¿El texto es legible en todos los botones?
2. [ ] ¿Los elementos interactivos tienen estados `hover` y `active`?
