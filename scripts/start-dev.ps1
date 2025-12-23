$ProjectRoot = (Resolve-Path "$PSScriptRoot\..").Path

Write-Host "🚀 Starting Teach LAOZ LMS Environment..." -ForegroundColor Green
Write-Host "Project Root: $ProjectRoot" -ForegroundColor Gray

# Start Backend
Write-Host "Starting Backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ProjectRoot\backend'; npm run dev"

# Start Frontend
Write-Host "Starting Frontend..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ProjectRoot\frontend'; npm run dev"

Write-Host "✅ Environment started! Check the new windows." -ForegroundColor Green
