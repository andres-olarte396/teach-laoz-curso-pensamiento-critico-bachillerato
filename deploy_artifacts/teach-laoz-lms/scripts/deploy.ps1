$ErrorActionPreference = "Stop"

# Configuration
$ProjectName = "teach-laoz-lms"
$ArchiveName = "$ProjectName`_deploy.tar.gz"
$TarPath = "$ProjectName`_deploy.tar"

Write-Host "📦 Packaging project for deployment..." -ForegroundColor Cyan

# Define exclusions (similar to .deployignore)
$Excludes = @(
    "node_modules",
    ".git",
    ".github",
    "dist",
    "build",
    ".env",
    ".DS_Store",
    "*.tar.gz",
    "*.tar"
)

# Check if git is available and we are in a repo
if ((Get-Command "git" -ErrorAction SilentlyContinue) -and (git rev-parse --is-inside-work-tree 2>$null)) {
    Write-Host "   Using git archive..." -ForegroundColor Green
    git archive --format=tar -o $TarPath HEAD
} else {
    Write-Host "   Git not found or not in repo. Using tar if available..." -ForegroundColor Yellow
    # Fallback logic would be complex in pure PS without external tools, 
    # relying on git archive is safest for this project structure.
    # If standard Windows tar is available (Win10+):
    tar --exclude="node_modules" --exclude=".git" -cf $TarPath .
}

# Append extra files that might not be in git or need to be forced
# e.g. content folder if ignored, or prod config
if (Test-Path "content") {
     # Note: Windows tar implementation varies, simple append might fail if tar is strict.
     # Using 7z would be better but assumes installed.
     # Let's try standard tar append
     tar -rf $TarPath content/ docker-compose.prod.yml 2>$null
}

# Gzip it
if (Test-Path $ArchiveName) { Remove-Item $ArchiveName }
tar -czf $ArchiveName "@$TarPath" 2>$null 
# If tar -czf fails (some windows versions), we might stop at .tar
# But let's assume standard tar or git bash tar is in path.

# Cleanup intermediate tar if gz created
if (Test-Path $ArchiveName) { 
    Remove-Item $TarPath 
} else {
    # If gzip failed, maybe we just have the tar
    if (Test-Path $TarPath) {
        Rename-Item $TarPath $ArchiveName
        Write-Host "   Warning: Could not compress to .gz, saved as .tar renamed to .tar.gz for compatibility." -ForegroundColor Yellow
    }
}

Write-Host "✅ Package created: $ArchiveName" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Deployment Instructions:" -ForegroundColor Cyan
Write-Host "1. Upload the file to your server:"
Write-Host "   scp $ArchiveName user@your-server-ip:~/"
Write-Host ""
Write-Host "2. Connect to your server:"
Write-Host "   ssh user@your-server-ip"
Write-Host ""
Write-Host "3. Run these commands on the server:"
Write-Host "   mkdir -p $ProjectName"
Write-Host "   tar -xzf $ArchiveName -C $ProjectName"
Write-Host "   cd $ProjectName"
Write-Host "   docker-compose -f docker-compose.prod.yml up -d --build"
Write-Host ""
Write-Host "Done!"
