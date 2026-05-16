# Push to existing repo: https://github.com/Princekr801/healthcare-triage
Set-Location $PSScriptRoot

Write-Host "Committing all files..." -ForegroundColor Cyan
git add -A
git commit -m "Add CareRoute v2 healthcare triage platform"
if ($LASTEXITCODE -ne 0) {
  Write-Host "Note: commit may have failed if already committed — continuing..." -ForegroundColor Yellow
}

Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
git remote remove origin 2>$null
git remote add origin https://github.com/Princekr801/healthcare-triage.git
git branch -M main
git push -u origin main

if ($LASTEXITCODE -eq 0) {
  Write-Host ""
  Write-Host "SUCCESS: https://github.com/Princekr801/healthcare-triage" -ForegroundColor Green
} else {
  Write-Host "Push failed — sign in when Git prompts, or run: gh auth login" -ForegroundColor Red
}
