# Guía de Despliegue en Docker

Esta guía cubre tanto el despliegue local como el despliegue en un servidor remoto (como Raspberry Pi).

## Índice

- [Despliegue Local](#despliegue-local)
- [Despliegue en Raspberry Pi por SSH](#despliegue-en-raspberry-pi-por-ssh)

---

## Despliegue Local

Sigue estos pasos para aplicar cambios en el código (frontend o backend) al entorno de Docker local.

### 1. Reconstruir y Reiniciar Contenedores

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

### Notas Adicionales

- **Cambios en Contenido (`/content`)**: No requieren reconstrucción, ya que la carpeta está montada como volumen. Solo recarga la página o reinicia el backend si es necesario recachear.
- **Cambios en Base de Datos**: El archivo `lms.db` también está montado, por lo que los datos persisten entre reinicios.

---

## Despliegue en Raspberry Pi por SSH

Este proceso permite desplegar la aplicación en una Raspberry Pi u otro servidor remoto utilizando Docker.

### Opción 1: Transferir Imágenes Pre-construidas (Recomendada)

Esta opción construye las imágenes localmente para arquitectura ARM y las transfiere al servidor.

#### Paso 1: Construir las imágenes para ARM

```powershell
# En tu máquina local (Windows)
cd e:\MyRepos\education\teach-laoz-learning-management-system

# Construir para arquitectura ARM64 (Raspberry Pi 4/5)
docker buildx build --platform linux/arm64 -t laoz-lms-backend:latest ./backend
docker buildx build --platform linux/arm64 -t laoz-lms-frontend:latest ./frontend
```

**Nota**: Si usas una Raspberry Pi 3 o anterior, usa `linux/arm/v7` en lugar de `linux/arm64`.

#### Paso 2: Guardar las imágenes en archivos

**En Windows PowerShell:**

```powershell
# Guardar las imágenes (sin comprimir por ahora)
docker save laoz-lms-backend:latest -o laoz-backend.tar
docker save laoz-lms-frontend:latest -o laoz-frontend.tar

# Comprimir con PowerShell
Compress-Archive -Path laoz-backend.tar -DestinationPath laoz-backend.tar.zip -Force
Compress-Archive -Path laoz-frontend.tar -DestinationPath laoz-frontend.tar.zip -Force

# Limpiar archivos temporales
Remove-Item laoz-backend.tar
Remove-Item laoz-frontend.tar
```

**En Linux/Mac o Git Bash:**

```bash
docker save laoz-lms-backend:latest | gzip > laoz-backend.tar.gz
docker save laoz-lms-frontend:latest | gzip > laoz-frontend.tar.gz
```

Esto creará dos archivos comprimidos con las imágenes Docker.

#### Paso 3: Transferir las imágenes a la Raspberry Pi

**En Windows PowerShell:**

```powershell
# Reemplaza 'usuario' con tu usuario y 'ip-raspberry' con la IP de tu Raspberry Pi
scp laoz-backend.tar.zip usuario@ip-raspberry:~/
scp laoz-frontend.tar.zip usuario@ip-raspberry:~/
```

**En Linux/Mac:**

```bash
scp laoz-backend.tar.gz usuario@ip-raspberry:~/
scp laoz-frontend.tar.gz usuario@ip-raspberry:~/
```

**Descomprimir los archivos (si usaste .zip desde Windows)
unzip laoz-backend.tar.zip
unzip laoz-frontend.tar.zip

# Cargar las imágenes en Docker
docker load < laoz-backend.tar
docker load < laoz-frontend.tar

# Verificar que se cargaron correctamente
docker images

# Limpiar archivos temporales (opcional)
rm ~/laoz-backend.tar* ~/laoz-frontend.tar*
```

**Si transferiste archivos .tar.gz (desde Linux/Mac):**

```bash
# Cargar las imágenes directamente
docker load < ~/laoz-backend.tar.gz
docker load < ~/laoz-frontend.tar.gz

# Verificar y limpiar
docker images

#### Paso 4: Conectar por SSH y cargar las imágenes

```powershell
ssh usuario@ip-raspberry
```

Una vez conectado a la Raspberry Pi:

**En Windows PowerShell:**

```powershell
# Crear lista de archivos a incluir (más fácil en Windows)
$archivos = @(
    "docker-compose.prod.yml",
    "COURSE_REPOSITORIES.md",
    "content",
    "backend/uploads"
)

# Comprimir
Compress-Archive -Path $archivos -DestinationPath proyecto.zip -Force


# Descomprimir (ajusta según el formato que transferiste)
# Si usaste .zip desde Windows:
unzip ../proyecto.zip

# Si usaste .tar.gz desde Linux/Mac:
# # Transferir al servidor
scp proyecto.zip usuario@ip-raspberry:~/
```

**En Linux/Mac o Git Bash:**

```bash
# Cargar las imágenes en Docker
docker load < ~/laoz-backend.tar.gz
docker load < ~/laoz-frontend.tar.gz

# Verificar que se cargaron correctamente
docker images

# Limpiar archivos temporales (opcional)
rm ~/laoz-backend.tar.gz ~/laoz-frontend.tar.gz
```

#### Paso 5: Transferir archivos del proyecto

De vuelta en tu máquina local:

```powershell
# Comprimir el proyecto (excluyendo node_modules y archivos pesados)
tar -czf proyecto.tar.gz --exclude=node_modules --exclude=.git --exclude=backend/lms.db --exclude=frontend/dist --exclude=backend/dist docker-compose.prod.yml content/ backend/uploads COURSE_REPOSITORIES.md

# Transferir al servidor
scp proyecto.tar.gz usuario@ip-raspberry:~/
```

#### Paso 6: Descomprimir y ejecutar en la Raspberry Pi

```bash
# En la Raspberry Pi
mkdir -p ~/laoz-lms
cd ~/laoz-lms
tar -xzf ../proyecto.tar.gz

# Crear archivo .env para variables de entorno (IMPORTANTE)
nano .env
```

Agregar en el archivo `.env`:
```env
JWT_SECRET=tu_secreto_seguro_aqui_cambiar_en_produccion
NODE_ENV=production
```

Guardar con `Ctrl+X`, luego `Y` y `Enter`.

```bash
# Iniciar los contenedores en modo producción
docker compose -f docker-compose.prod.yml up -d

# Ver logs para verificar que todo está funcionando
docker compose -f docker-compose.prod.yml logs -f
```

Presiona `Ctrl+C` para salir de los logs.

#### Paso 7: Verificar el despliegue

```bash
# Ver estado de los contenedores
docker ps

# Acceder a la aplicación desde un navegador
# http://ip-raspberry (puerto 80)
# Backend API: http://ip-raspberry:3000
```

---

### Opción 2: Clonar y Construir Directamente en Raspberry Pi

Esta opción construye las imágenes directamente en la Raspberry Pi. Es más lenta pero no requiere construir localmente.

#### Paso 1: Conectar por SSH

```powershell
ssh usuario@ip-raspberry
```

#### Paso 2: Clonar o transferir el proyecto

**Si usas Git:**
```bash
git clone https://github.com/tu-usuario/teach-laoz-learning-management-system.git
cd teach-laoz-learning-management-system
```

**Si no usas Git**, desde tu máquina local:
```powershell
scp -r e:\MyRepos\education\teach-laoz-learning-management-system usuario@ip-raspberry:~/
```

#### Paso 3: Configurar variables de entorno

```bash
cd ~/teach-laoz-learning-management-system

# Crear archivo .env
nano .env
```

Agregar:
```env
JWT_SECRET=tu_secreto_seguro_aqui
NODE_ENV=production
```

#### Paso 4: Construir y ejecutar

```bash
# Construir las imágenes en la Raspberry Pi
docker compose -f docker-compose.prod.yml build

# Iniciar los servicios
docker compose -f docker-compose.prod.yml up -d

# Monitorear logs
docker compose -f docker-compose.prod.yml logs -f
```

---

### Comandos Útiles de Gestión

```bash
# Ver todos los contenedores en ejecución
docker ps

# Ver todos los contenedores (incluyendo detenidos)
docker ps -a

# Detener los contenedores
docker compose -f docker-compose.prod.yml down

# Reiniciar un servicio específico
docker compose -f docker-compose.prod.yml restart backend
docker compose -f docker-compose.prod.yml restart frontend

# Ver uso de recursos (CPU, memoria)
docker stats

# Ver logs de un contenedor específico
docker logs laoz-lms-backend-prod
docker logs laoz-lms-frontend-prod

# Ver logs en tiempo real de un servicio
docker compose -f docker-compose.prod.yml logs -f backend

# Ejecutar comandos dentro de un contenedor
docker exec -it laoz-lms-backend-prod sh

# Limpiar imágenes y contenedores no utilizados
docker system prune -a

# Hacer backup de la base de datos
docker cp laoz-lms-backend-prod:/app/lms.db ./lms.db.backup
```

### Actualizar la Aplicación

Cuando hagas cambios en el código y quieras actualizar el servidor:

**Usando Opción 1 (imágenes pre-construidas):**
1. Construye nuevas imágenes localmente
2. Transfiere las imágenes al servidor
3. Recarga las imágenes: `docker load < laoz-backend.tar.gz`
4. Reinicia los contenedores: `docker compose -f docker-compose.prod.yml up -d`

**Usando Opción 2 (construcción directa):**
```bash
# Actualizar código (si usas Git)
git pull

# Reconstruir y reiniciar
docker compose -f docker-compose.prod.yml up -d --build
```

---

### Requisitos del Servidor

#### Hardware Mínimo
- **Raspberry Pi 4/5**: 2GB RAM (recomendado 4GB+)
- **Raspberry Pi 3**: 1GB RAM (puede ser lento)
- **Almacenamiento**: Mínimo 8GB disponibles

#### Software
- Raspberry Pi OS (64-bit recomendado para Pi 4/5)
- Docker instalado y funcionando
- SSH habilitado

#### Instalación de Docker en Raspberry Pi

Si Docker no está instalado:

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER

# Reiniciar sesión o ejecutar
newgrp docker

# Verificar instalación
docker --version
docker compose version
```

---

### Consideraciones de Seguridad en Producción

1. **JWT_SECRET**: Siempre usa un valor fuerte y único en producción
   ```bash
   # Generar un secreto aleatorio
   openssl rand -base64 32
   ```

2. **Firewall**: Configura el firewall para permitir solo los puertos necesarios
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 3000/tcp
   sudo ufw allow 22/tcp
   sudo ufw enable
   ```

3. **HTTPS**: Considera usar un proxy inverso con certificados SSL (nginx, Caddy, Traefik)

4. **Backups**: Programa backups regulares de la base de datos
   ```bash
   # Crear script de backup
   nano ~/backup-lms.sh
   ```
   
   Contenido del script:
   ```bash
   #!/bin/bash
   DATE=$(date +%Y%m%d_%H%M%S)
   docker cp laoz-lms-backend-prod:/app/lms.db ~/backups/lms.db.$DATE
   # Mantener solo los últimos 7 backups
   ls -t ~/backups/lms.db.* | tail -n +8 | xargs rm -f
   ```

5. **Monitoreo**: Configura alertas para reiniciar contenedores si fallan
   ```yaml
   # En docker-compose.prod.yml, ya está configurado:
   restart: always
   ```

---

### Resolución de Problemas

#### Contenedor no inicia
```bash
# Ver logs detallados
docker compose -f docker-compose.prod.yml logs backend

# Ver último error
docker logs laoz-lms-backend-prod --tail 100
```

#### Sin suficiente memoria
```bash
# Ver uso de recursos
free -h
docker stats --no-stream

# Aumentar swap (Raspberry Pi)
sudo dphys-swapfile swapoff
sudo nano /etc/dphys-swapfile
# Cambiar CONF_SWAPSIZE=100 a CONF_SWAPSIZE=2048
sudo dphys-swapfile setup
sudo dphys-swapfile swapon
```

#### Puertos en uso
```bash
# Ver qué usa el puerto 80
sudo lsof -i :80

# Detener Apache/nginx si está corriendo
sudo systemctl stop apache2
sudo systemctl stop nginx
```

#### Problemas de permisos
```bash
# Dar permisos correctos a carpetas montadas
sudo chown -R $USER:$USER ~/laoz-lms
chmod -R 755 ~/laoz-lms/content
```
