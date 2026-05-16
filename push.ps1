$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$log = Join-Path $root 'push-log.txt'
Set-Location $root

function Log($msg) {
  $line = "[$(Get-Date -Format 'HH:mm:ss')] $msg"
  Add-Content -Path $log -Value $line
  Write-Host $line
}

function Test-GitOk {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$GitArgs)
  $prev = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  & git @GitArgs 2>$null | Out-Null
  $ok = ($LASTEXITCODE -eq 0)
  $ErrorActionPreference = $prev
  return $ok
}

function Invoke-GitOutput {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$GitArgs)
  $prev = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  $out = & git @GitArgs 2>&1 | ForEach-Object { "$_" }
  $ErrorActionPreference = $prev
  return $out
}

function Get-GhExe {
  $cmd = Get-Command gh -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  $default = 'C:\Program Files\GitHub CLI\gh.exe'
  if (Test-Path $default) { return $default }
  return $null
}

Remove-Item $log -ErrorAction SilentlyContinue
Log "Starting push to GitHub..."

if (-not (Test-Path (Join-Path $root '.git'))) {
  Test-GitOk init -b main | Out-Null
  Log "Initialized git repo (main)"
}

Test-GitOk add -A | Out-Null
$status = Invoke-GitOutput status --short
Log "Staged:`n$($status -join "`n")"

$hasHead = Test-GitOk rev-parse --verify HEAD
$hasStaged = -not (Test-GitOk diff --cached --quiet)

if ($hasStaged -or -not $hasHead) {
  $commitMsg = @"
Add CareRoute v2 healthcare triage platform

Full-stack symptom checker: React UI, FastAPI, Neo4j graph, MongoDB handoff, Docker deploy.
"@
  $prev = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  git commit -m $commitMsg 2>&1 | ForEach-Object { Log $_ }
  if ($LASTEXITCODE -ne 0) {
    Log "ERROR: git commit failed (exit $LASTEXITCODE)"
    exit 1
  }
  $ErrorActionPreference = $prev
  Log "Committed"
} else {
  Log "No new changes to commit (already up to date)"
}

$ghExe = Get-GhExe
if (-not $ghExe) {
  Log "ERROR: GitHub CLI (gh) not found."
  Log "Install: winget install GitHub.cli"
  Log "Then add to PATH: C:\Program Files\GitHub CLI"
  Log "Or push manually with git only (see README)."
  exit 1
}

Log "Using gh: $ghExe"
$prev = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
& $ghExe auth status 2>&1 | ForEach-Object { Log $_ }
$ErrorActionPreference = $prev

$remote = $null
$ErrorActionPreference = 'Continue'
$remote = git remote get-url origin 2>$null
$ErrorActionPreference = 'Stop'

if (-not $remote) {
  Log "Creating repo Princekr801/healthcare-triage and pushing..."
  $prev = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  & $ghExe repo create healthcare-triage --public --source=. --remote=origin --push 2>&1 | ForEach-Object { Log $_ }
  if ($LASTEXITCODE -ne 0) {
    Log "gh repo create failed — trying git push to existing remote..."
    git remote add origin https://github.com/Princekr801/healthcare-triage.git 2>$null
    git push -u origin main 2>&1 | ForEach-Object { Log $_ }
  }
  $ErrorActionPreference = $prev
} else {
  Log "Remote: $remote"
  $prev = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  git push -u origin main 2>&1 | ForEach-Object { Log $_ }
  $ErrorActionPreference = $prev
}

$prev = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
$url = & $ghExe repo view --json url -q .url 2>$null
$ErrorActionPreference = $prev
Log "Done: $url"
Log (Invoke-GitOutput log -1 --oneline)
