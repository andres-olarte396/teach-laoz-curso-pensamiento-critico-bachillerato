# Script to package Teach Laoz LMS for Raspberry Pi Deployment

param(
    [string]$TargetIP,
    [string]$TargetUser = "pi",
    [switch]$AutoDeploy,
    [switch]$ExcludeContent
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = "$scriptDir\.."

Write-Host "Starting Teach Laoz LMS Packager..." -ForegroundColor Cyan

# 1. Sync Courses
# 1. Sync Courses
if ($ExcludeContent) {
    Write-Host "Skipping course sync as requested..." -ForegroundColor Yellow
}
else {
    Write-Host "Syncing courses..." -ForegroundColor Yellow
    Set-Location $projectRoot
    # Ensure scripts/sync_courses.js exists
    if (-not (Test-Path "scripts\sync_courses.js")) {
        Write-Error "scripts\sync_courses.js not found!"
    }

    # Run the sync script (requires Node.js)
    node scripts/sync_courses.js
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Course sync encountered errors. Continuing with available content..."
    }
}

# 2. Cleanup old artifacts
$deployDir = "$projectRoot\deploy_artifacts"
if (Test-Path $deployDir) {
    Remove-Item $deployDir -Recurse -Force
}
New-Item -ItemType Directory -Path $deployDir | Out-Null

# 3. Copy files to temporary staging area
$stagingDir = "$deployDir\teach-laoz-lms"
New-Item -ItemType Directory -Path $stagingDir | Out-Null

Write-Host "Copying project files..." -ForegroundColor Yellow
$exclude = @("node_modules", ".git", "deploy_artifacts", "dist", "coverage", ".vscode", "tmp", "lms.db", "uploads")
if ($ExcludeContent) { $exclude += "content" }
Get-ChildItem -Path $projectRoot -Exclude $exclude | Copy-Item -Destination $stagingDir -Recurse

# CLEANUP: Remove nested node_modules that might have been copied
Write-Host "Cleaning up extraneous node_modules..." -ForegroundColor Yellow
Get-ChildItem -Path $stagingDir -Include "node_modules" -Recurse -Directory | Remove-Item -Recurse -Force

# Create Empty directories for DB and Uploads to ensure volume mounts work
New-Item -ItemType Directory -Path "$stagingDir\backend\uploads" -Force | Out-Null
New-Item -ItemType File -Path "$stagingDir\backend\lms.db" -Force | Out-Null # Empty file for mapping, though sqlite creates it
if ($ExcludeContent) {
    New-Item -ItemType Directory -Path "$stagingDir\content" -Force | Out-Null
}

# 4. Create install script for Pi
$installScript = @"
#!/bin/bash
set -e

echo "Installing Teach Laoz LMS..."

# Check for Docker
if ! command -v docker &> /dev/null; then
    echo "Docker not found. Installing..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    sudo usermod -aG docker \$USER
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
"@

$installScriptPath = "$stagingDir\install_on_pi.sh"
Set-Content -Path $installScriptPath -Value $installScript -NoNewline
# Convert to UNIX line endings (LF) just in case
(Get-Content $installScriptPath -Raw) -replace "`r`n", "`n" | Set-Content $installScriptPath -NoNewline

# 5. Compress
Write-Host "Compressing payload..." -ForegroundColor Yellow
$archiveName = "teach-laoz-lms_deploy.tar.gz"
$archivePath = "$deployDir\$archiveName"

# Use tar if available (standard in Win 10+), otherwise Compress-Archive (zip)
# Tar is better for preserving permissions if user unpacks on Linux, but standard tar on Windows might be tricky.
# We'll use tar command assuming it exists (Git bash or System32)
try {
    tar -czf $archivePath -C $deployDir teach-laoz-lms
}
catch {
    Write-Warning "Tar command failed using Compress-Archive (zip) instead."
    Compress-Archive -Path $stagingDir -DestinationPath "$deployDir\teach-laoz-lms_deploy.zip"
    $archiveName = "teach-laoz-lms_deploy.zip"
}

Write-Host "------------------------------------------------" -ForegroundColor Green
Write-Host "Package created: $deployDir\$archiveName" -ForegroundColor Green

# 6. Remote Deployment
Write-Host "`n--- Remote Deployment ---" -ForegroundColor Cyan
$runDeploy = $false
if ($AutoDeploy -or -not [string]::IsNullOrWhiteSpace($TargetIP)) {
    $runDeploy = $true
}
else {
    $Deploy = Read-Host "Do you want to deploy to a Raspberry Pi now? (y/n)"
    if ($Deploy -eq 'y') { $runDeploy = $true }
}

if ($runDeploy) {
    if ([string]::IsNullOrWhiteSpace($TargetIP)) {
        $TargetIP = Read-Host "Enter Raspberry Pi IP Address"
    }
    if ([string]::IsNullOrWhiteSpace($TargetUser) -or $TargetUser -eq "pi") {
        $userInput = Read-Host "Enter Raspberry Pi Username (default: $TargetUser) [Press Enter for default]"
        if (-not [string]::IsNullOrWhiteSpace($userInput)) { $TargetUser = $userInput }
    }

    
    Write-Host "`nYou will be prompted for the password for $TargetUser@$TargetIP multiple times (scp and ssh)." -ForegroundColor Gray
    
    # Validation: Check if archive exists
    if (-not (Test-Path $archivePath)) {
        Write-Error "Deployment artifact not found at: $archivePath"
        exit 1
    }

    Write-Host "Uploading package..." -ForegroundColor Yellow
    
    # Upload
    scp -O $archivePath "$TargetUser@$TargetIP`:~/"
    if ($LASTEXITCODE -ne 0) { throw "SCP Upload failed" }
    
    Write-Host "Installing on remote device..." -ForegroundColor Yellow
    # Execute Remote Commands
    # 1. Unpack
    # 2. Enter directory
    # 3. Run install script
    # 4. Cleanup tar header issues if any
    $remoteCommand = "tar -xzf $archiveName && cd teach-laoz-lms && bash install_on_pi.sh"
    
    ssh -t "$TargetUser@$TargetIP" $remoteCommand
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`nSUCCESS! Deployment complete." -ForegroundColor Green
        Write-Host "Access your LMS at http://$TargetIP" -ForegroundColor Green
    }
    else {
        Write-Error "Remote installation reported an error."
    }
}
else {
    Write-Host "Instructions:" -ForegroundColor White
    Write-Host "1. Transfer '$archiveName' to your Raspberry Pi."
    Write-Host "   (e.g., scp $archiveName user@raspberrypi:~/)"
    Write-Host "2. SSH into the Pi."
    Write-Host "3. Extract the archive:"
    Write-Host "   tar -xzf $archiveName"
    Write-Host "4. Go to the directory: cd teach-laoz-lms"
    Write-Host "5. Run the installer: bash install_on_pi.sh"
}
Write-Host "------------------------------------------------"
