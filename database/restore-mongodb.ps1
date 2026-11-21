# PowerShell script to restore Labour Connect MongoDB database from backup folder
param(
    [Parameter(Mandatory=$true)]
    [string]$BackupFolder,
    [string]$MongoUri = "mongodb://127.0.0.1:27017/labour_connect"
)

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " Labour Connect MongoDB Restore          " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$scriptPath = Join-Path $PSScriptRoot "import-mongo.js"
node $scriptPath $BackupFolder

