#!/bin/bash
set -e

echo "Installing Teach Laoz LMS..."

# Check for Docker
if ! command -v docker &> /dev/null; then
    echo "Docker not found. Installing..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    TARGET_USER=${SUDO_USER:-$(whoami)}
    sudo usermod -aG docker $TARGET_USER
    echo "Docker installed. User $TARGET_USER added to docker group."
fi

# Check for Compose
if ! docker compose version &> /dev/null; then
     echo "Docker Compose plugin not found. Attempting to install..."
     sudo apt-get update && sudo apt-get install -y docker-compose-plugin
fi


# Repo Config
REPO_URL="https://github.com/andres-olarte396/teach-laoz-learning-management-system.git"
DEST_DIR="teach-laoz-lms"

echo "Checking for existing installation..."
if [ -d "$DEST_DIR" ]; then
    echo "Directory $DEST_DIR exists. Updating..."
    cd $DEST_DIR
    git pull
else
    echo "Cloning repository..."
    git clone -b blog-articulos-escritura $REPO_URL $DEST_DIR
    cd $DEST_DIR
fi

# Ensure we are on the latest commit of the branch
git fetch origin blog-articulos-escritura
git reset --hard origin/blog-articulos-escritura

echo "Building and starting services..."
# Build images for ARM64 (native on Pi)
sudo docker compose up -d --build

echo "Deployment Complete!"
echo "Access the LMS at http://$(hostname -I | awk '{print $1}')"