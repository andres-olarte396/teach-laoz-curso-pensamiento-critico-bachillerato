# Guía de Despliegue en Docker Local

Sigue estos pasos para aplicar cambios en el código (frontend o backend) al entorno de Docker local.

## 1. Reconstruir y Reiniciar Contenedores

Este comando detiene los contenedores actuales, reconstruye las imágenes con los nuevos cambios de código y levanta los servicios nuevamente.

```bash
docker-compose up -d --build
```

- `-d`: Ejecuta los contenedores en segundo plano (detached mode).
- `--build`: Fuerza la reconstrucción de las imágenes (necesario si cambiaste `package.json` o código fuente que no está montado como volumen).

## 2. Verificar el Estado

Asegúrate de que los contenedores estén corriendo correctamente (STATUS debe ser "Up").

```bash
docker ps
```

Deberías ver `laoz-lms-backend` y `laoz-lms-frontend`.

## 3. Ver Logs (Opcional)

Si necesitas ver qué está pasando o detectar errores durante el arranque:

```bash
docker-compose logs -f --tail=50
```

- `-f`: Sigue la salida de los logs en tiempo real (Ctrl+C para salir).
- `--tail=50`: Muestra solo las últimas 50 líneas.

## Notas Adicionales

- **Cambios en Contenido (`/content`)**: No requieren reconstrucción, ya que la carpeta está montada como volumen. Solo recarga la página o reinicia el backend si es necesario recachear.
- **Cambios en Base de Datos**: El archivo `lms.db` también está montado, por lo que los datos persisten entre reinicios.
