# PM2 Monitor - Remote Daemon Setup Script (Windows PowerShell)

param (
    [Parameter(Mandatory=$true)]
    [string]$DbUri,
    
    [Parameter(Mandatory=$true)]
    [string]$ServerName
)

Write-Host "--- Starting PM2 Monitor Daemon Setup ---" -ForegroundColor Cyan

# 1. Check for PM2
if (!(Get-Command pm2 -ErrorAction SilentlyContinue)) {
    Write-Host "Installing PM2 globally..." -ForegroundColor Yellow
    npm install -g pm2
}

# 2. Setup directory
$TargetDir = "C:\pm2-monitor-daemon"
if (!(Test-Path $TargetDir)) {
    New-Item -ItemType Directory -Path $TargetDir
}
Set-Location $TargetDir

# 3. Clone only the backend part (Sparse clone)
Write-Host "Downloading monitor code..." -ForegroundColor Cyan
git clone --depth 1 --filter=blob:none --sparse https://github.com/oxdev03/pm2.web.git .
git sparse-checkout set apps/backend packages/mongoose-models packages/typescript-config packages/eslint-config

# 4. Install dependencies
Write-Host "Installing dependencies... (This may take a minute)" -ForegroundColor Cyan
npm install

# 5. Create .env
$EnvDir = Join-Path $TargetDir "apps/backend"
Set-Content -Path (Join-Path $EnvDir ".env") -Value "DB_URI=$DbUri`nSERVER_NAME=$ServerName"

# 6. Start with PM2
Set-Location $EnvDir
pm2 start index.ts --name "pm2-daemon" --interpreter npx -- ts-node
pm2 save

Write-Host "--- Setup Completed! ---" -ForegroundColor Green
Write-Host "Server '$ServerName' is now connecting to your dashboard."
