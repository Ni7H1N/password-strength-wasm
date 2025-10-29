# ===============================
# 🔍 Personal Data Scanner for PowerShell
# ===============================

Write-Host "`n🚀 Scanning your project for personal data or secrets..." -ForegroundColor Cyan

# Directories to skip
$excluded = @("node_modules", "dist", "target", ".git")

# Get all files except the excluded ones
$files = Get-ChildItem -Recurse -File | Where-Object {
  ($excluded | ForEach-Object { $_not = $_; if ($_.FullName -like "*$_not*") { return $false } }) -ne $false
}

if (-not $files) {
  Write-Host "No files found to scan." -ForegroundColor Yellow
  exit
}

# 1️⃣ Look for emails, usernames, or names
$emailMatches = $files | Select-String -Pattern "gmail|hotmail|yahoo|outlook|nithin|user|email|name"

# 2️⃣ Look for secrets or tokens
$secretMatches = $files | Select-String -Pattern "password|passwd|secret|api[_-]?key|token|auth|bearer"

# 3️⃣ Look for URLs or IP addresses
$urlMatches = $files | Select-String -Pattern "https?://|([0-9]{1,3}\.){3}[0-9]{1,3}"

# ===============================
# 🧾 Display results
# ===============================

if ($emailMatches) {
  Write-Host "`n📧 Potential personal identifiers found:" -ForegroundColor Yellow
  $emailMatches | ForEach-Object { Write-Host $_.Path ":" $_.Line.Trim() }
}

if ($secretMatches) {
  Write-Host "`n🔑 Potential secrets or tokens found:" -ForegroundColor Red
  $secretMatches | ForEach-Object { Write-Host $_.Path ":" $_.Line.Trim() }
}

if ($urlMatches) {
  Write-Host "`n🌐 URLs or IPs found:" -ForegroundColor Magenta
  $urlMatches | ForEach-Object { Write-Host $_.Path ":" $_.Line.Trim() }
}

if (-not $emailMatches -and -not $secretMatches -and -not $urlMatches) {
  Write-Host "`n✅ No personal data or secrets detected. You're clean!" -ForegroundColor Green
}

Write-Host "`nScan complete.`n" -ForegroundColor Cyan
