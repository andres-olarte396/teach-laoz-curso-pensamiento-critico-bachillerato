#!/bin/bash
set -e

echo "Installing Teach Laoz LMS..."

# Check for Docker
if ! command -v docker &> /dev/null; then
    echo "Docker not found. Installing..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    sudo usermod -aG docker \
    echo "Docker installed. You may need to logout and login for group changes to take effect."
fi

# Check for Compose
if ! docker compose version &> /dev/null; then
     echo "Docker Compose plugin not found. Attempting to install..."
     sudo apt-get update && sudo apt-get install -y docker-compose-plugin
fi

echo "Building and starting services..."
# Build images for ARM64 (native on Pi)
sudo docker compose up -d --build

echo "Deployment Complete!"
echo "Access the LMS at http://<RASPBERRY_PI_IP>"