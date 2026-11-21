# PowerShell script to create a logical backup of Labour Connect MongoDB database
param(
    [string]$MongoUri = "mongodb://127.0.0.1:27017/labour_connect"
)

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " Labour Connect MongoDB Backup           " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$scriptPath = Join-Path $PSScriptRoot "export-mongo.js"
node $scriptPath

