# PowerShell script to initialize and seed the Labour Connect MongoDB database
param(
    [string]$MongoUri = "mongodb://127.0.0.1:27017/labour_connect"
)

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " Labour Connect MongoDB Initializer      " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

Write-Host "Connecting to MongoDB at: $MongoUri" -ForegroundColor Yellow

$backendDir = Join-Path $PSScriptRoot "..\backend"
if (Test-Path $backendDir) {
    Push-Location $backendDir
    Write-Host "Running database seed runner..." -ForegroundColor Cyan
    npm run seed
    Pop-Location
    Write-Host "MongoDB database 'labour_connect' initialized and seeded successfully!" -ForegroundColor Green
} else {
    Write-Error "Backend directory not found at $backendDir"
    exit 1
}

