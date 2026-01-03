---
title: "Escribe como un Ingeniero Senior: 3 'Bugs' de Escritura que Probablemente Estás Cometiendo"
date: "2026-01-01"
author: Andres Olarte
excerpt: "Depura tu documentación técnica y aprende a escribir como un ingeniero senior evitando los 3 bugs más comunes de la escritura profesional."
tags:
  - Escritura técnica
  - Productividad
  - Ingeniería
published: true
---

## Introducción: El Código que Nadie Entiende

Imagina que estás depurando código y te encuentras una función llamada procesar_datos(). No toma argumentos. No devuelve nada. Simplemente... existe. Es frustrante, ¿verdad? No sabes qué entra, quién la llama, ni qué estado modifica. Su comportamiento es una caja negra.

Esa misma frustración es la que siente un colega cuando lee documentación técnica escrita de forma pasiva y poco clara. Frases como "Los datos fueron procesados" son el equivalente gramatical de esa función misteriosa. Ocultan al actor, diluyen la responsabilidad y obligan al lector a gastar ciclos mentales valiosos para descifrar qué está pasando realmente.

En este artículo, vamos a depurar tu escritura. Te mostraré tres "bugs" comunes que se cuelan en la documentación técnica y te daré algoritmos claros para "refactorizarlos". El objetivo es transformar tu comunicación de un código confuso a uno preciso, eficiente y fácil de ejecutar.

## 1. El Bug de la Ambigüedad: Tratas la Voz Pasiva como una Característica, no como un Defecto

En la documentación técnica, la ambigüedad es un defecto crítico (bug). La principal fuente de esta ambigüedad es la voz pasiva. Cuando escribes "Los datos fueron procesados", ocultas información vital: ¿Quién o qué procesó los datos? ¿El usuario? ¿El backend? ¿Un proceso en segundo plano? Esta omisión aumenta la "carga cognitiva" del lector, obligándolo a buscar el contexto que tú deberías haberle proporcionado.

La diferencia en eficiencia es tan grande que podemos usar una analogía de complejidad algorítmica:

- Voz Activa es una operación de complejidad constante, O(1). El cerebro conecta directamente "Sujeto > Acción". Es un acceso directo.
- Voz Pasiva es una operación más costosa, similar a O(n²). El cerebro tiene que esperar hasta el final de la frase para identificar al actor y luego reconstruir la relación, buscando en el contexto quién realizó la acción.

Pensemos en la gramática como si fuera código. La voz pasiva es como una función vaga: process_stuff(). ¿Qué entra? ¿Qué contexto usa? El comportamiento es opaco. La voz activa, en cambio, es como una llamada a una función bien tipada: User.click(Button). La estructura es clara, predecible y no deja lugar a dudas sobre quién hace qué. Además, las oraciones activas son, en promedio, un 20-30% más cortas. Ganas precisión y concisión al mismo tiempo.

Imagine que un desarrollador lee lo siguiente en un archivo README: "La configuración debe ser actualizada antes del despliegue." El desarrollador se detiene y pregunta: "¿Por quién? ¿Debo hacerlo yo manualmente? ¿Lo hace el pipeline de CI/CD automáticamente?". Esta duda detiene el flujo de trabajo y puede provocar errores en producción.

### El Algoritmo de Refactorización: Tu "Linter" Gramatical

Para corregir frases pasivas, sigue este procedimiento:

1. Detectar: Busca construcciones del tipo "ser + participio" (ej. fue enviado, es hecho).
2. Identificar Agente: Pregúntate "¿Quién realiza la acción?".
3. Reubicar: Mueve a ese Agente al inicio de la oración.
4. Eliminar Auxiliares: Borra los verbos auxiliares "ser" o "estar".

#### Ejemplo de Refactorización: Del Sistema a la Acción

- Pasiva: "Una excepción es lanzada por el servidor si el token es inválido."
- Activa: "El servidor lanza una excepción si el token es inválido."

Finalmente, ten cuidado con la "Pasiva Zombie", un anti-patrón común que se usa para evadir responsabilidad. Frases como "Se cometieron errores en la migración" ocultan deliberadamente al actor. Una versión activa y honesta sería: "El equipo subestimó la carga en la migración".

## 2. El Bug del Misterio: Estructuras tu Texto como una Novela, no como un Reporte de Incidente

La estructura de ensayo que aprendimos en la escuela —Introducción > Desarrollo > Clímax > Conclusión— funciona para contar historias. Para la documentación técnica, es un desastre. Un ingeniero que depura un incidente a las 3 de la mañana no quiere suspenso; quiere la solución, y la quiere ya.

La solución es la Pirámide Invertida, una técnica periodística centenaria. Imagina que eres un corresponsal en 1920 enviando una noticia por telégrafo. La línea puede cortarse en cualquier momento, así que debes transmitir la información más crítica primero.

- "El Titanic se hundió." (Lead)
- "Murieron 1500 personas." (Detalles clave)
- "La orquesta tocó hasta el final." (Contexto)

Si la comunicación se corta después de la primera frase, el mensaje vital ha llegado. Tu documentación debe funcionar igual.

### La Estructura de la Pirámide: De Arriba Hacia Abajo

1. El Lead (La Cima): La conclusión o la acción requerida. ¿Qué pasó? ¿Qué debo hacer?
2. El Cuerpo (El Medio): Evidencia, argumentos, pasos detallados.
3. El Contexto (La Punta): Antecedentes, enlaces, información secundaria.

#### Ejemplo: Reporte de Estatus

- Mal (Cronológico): "Ayer revisamos los logs y vimos errores. Luego reiniciamos el servidor. Pareció funcionar, pero luego falló de nuevo. Investigamos la DB y vimos bloqueos. Al final, liberamos los bloqueos y el sistema subió."
- Bien (Pirámide Invertida): "El sistema está estable ahora. Causa raíz: Bloqueos en la base de datos que liberamos manualmente. Cronología: Detectamos errores ayer, reiniciamos (fallido), encontramos bloqueos y resolvimos."

Recuerda que los usuarios no leen, escanean, a menudo en un patrón en forma de F. Si la información clave no está en las primeras palabras de la primera línea, es efectivamente invisible. Por eso, aplica siempre esta Regla de Oro: Si el usuario deja de leer después de la primera frase, ¿se llevó la información vital? Sé un periodista de tu propio código. Informa rápido.

## 3. El Bug del Ego: Escribes para Ti Mismo, no para tu Lector

El error número uno en la documentación técnica no es la gramática ni la estructura, sino una Falta de Empatía Técnica. Ocurre cuando escribes sin considerar el modelo mental, los objetivos y el contexto de tu lector.

La distinción más importante que debes hacer es entre un Usuario y un Mantenedor. Piensa en un coche:

- El Manual del Conductor (Usuario) explica cómo arrancar el coche, usar el aire acondicionado y qué gasolina ponerle. Trata el coche como una Caja Negra.
- El Manual de Taller (Mantenedor) explica el torque de los tornillos, muestra el diagrama eléctrico y detalla cómo reparar el motor. Trata el coche como una Caja Blanca.

Esta distinción es la misma que hacemos en programación orientada a objetos entre interfaces public y private. La documentación del usuario es el contrato de la API public: describe qué hace el sistema, no cómo lo hace. La documentación del mantenedor expone los detalles de la implementación private: explica la lógica interna para que otros puedan modificarla. Mezclar estos dos manuales es una receta para el fracaso.

Para evitarlo, utiliza esta matriz para segmentar a tu audiencia antes de escribir una sola palabra:

Dimensión USUARIO (Consumidor) MANTENEDOR (Colaborador)
Objetivo Resolver un problema rápido. Entender/Modificar el sistema.
Perspectiva Caja Negra (Black Box). Caja Blanca (White Box).
Pregunta clave "¿Cómo hago X?" "¿Por qué X funciona así?"
Artefacto README, Guías, API Reference. CONTRIBUTING, Architecture Docs.

Ten cuidado con el error común de la "fuga de detalles de implementación" (Leaking Internals) en la documentación para usuarios.

- Mal: "Para guardar el archivo, instanciamos un FileStream con un buffer de 4kb..."
- Bien: "Para guardar el archivo, llame a save()."

Al usuario no le importa la implementación, solo el contrato de la interfaz pública.

## Conclusión: De Código Confuso a Comunicación Clara

Hemos identificado tres "bugs" que degradan la calidad de la documentación técnica: la voz pasiva que crea ambigüedad, la estructura cronológica que oculta la información vital y la falta de empatía que lleva a escribir para la audiencia equivocada.

La solución es adoptar la mentalidad de un ingeniero de software: prioriza la precisión con la voz activa (como una función bien tipada), la eficiencia con la pirámide invertida (como un buen TL;DR), y la experiencia de usuario aplicando la empatía técnica para no mezclar el manual del conductor con el del mecánico. Un texto claro es el resultado de un pensamiento claro.

Ahora que puedes detectar estos "bugs" en la escritura, ¿qué otros "code smells" se esconden en tu documentación?
