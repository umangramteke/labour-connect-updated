# PowerShell script to restore the Labour Connect database (MongoDB or PostgreSQL)
param(
    [Parameter(Mandatory=$true)]
    [string]$BackupTarget,
    [ValidateSet("mongodb", "postgres")]
    [string]$DatabaseType = "mongodb",
    [string]$HostName = "localhost",
    [int]$Port = 5432,
    [string]$User = "postgres",
    [string]$Database = "labour_connect"
)

if ($DatabaseType -eq "mongodb") {
    $mongoRestore = Join-Path $PSScriptRoot "restore-mongodb.ps1"
    & $mongoRestore -BackupFolder $BackupTarget
    exit $LASTEXITCODE
}

if (-not (Test-Path $BackupTarget)) {
    Write-Error "Backup file '$BackupTarget' does not exist."
    exit 1
}

$psqlPath = "C:\Program Files\PostgreSQL\16\bin\psql.exe"

Write-Host "Restoring PostgreSQL database '$Database' from '$BackupTarget'..." -ForegroundColor Cyan
& $psqlPath -h $HostName -p $Port -U $User -d $Database -f $BackupTarget

if ($LASTEXITCODE -eq 0) {
    Write-Host "Restoration completed successfully!" -ForegroundColor Green
} else {
    Write-Error "Restoration failed with exit code $LASTEXITCODE."
}
