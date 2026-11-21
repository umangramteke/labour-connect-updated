# PowerShell script to back up the Labour Connect database (MongoDB default, PostgreSQL fallback)
param(
    [ValidateSet("mongodb", "postgres")]
    [string]$DatabaseType = "mongodb",
    [string]$HostName = "localhost",
    [int]$Port = 5432,
    [string]$User = "postgres",
    [string]$Database = "labour_connect",
    [string]$BackupDir = "$PSScriptRoot\backups"
)

if ($DatabaseType -eq "mongodb") {
    $mongoBackup = Join-Path $PSScriptRoot "backup-mongodb.ps1"
    & $mongoBackup
    exit $LASTEXITCODE
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

$backupFile = "$BackupDir\labour_connect_$timestamp.sql"
$pgDumpPath = "C:\Program Files\PostgreSQL\16\bin\pg_dump.exe"

Write-Host "Backing up PostgreSQL database '$Database' to '$backupFile'..." -ForegroundColor Cyan
& $pgDumpPath -h $HostName -p $Port -U $User -F p -b -v -f $backupFile $Database

if ($LASTEXITCODE -eq 0) {
    Write-Host "Backup completed successfully: $backupFile" -ForegroundColor Green
} else {
    Write-Error "Backup failed with exit code $LASTEXITCODE."
}
