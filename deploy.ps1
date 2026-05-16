# One-command local deploy
Set-Location $PSScriptRoot
Write-Host "Starting CareRoute stack (Neo4j, MongoDB, API, Web)..." -ForegroundColor Cyan
docker compose up --build -d
Write-Host ""
Write-Host "  Web UI:  http://localhost:3000" -ForegroundColor Green
Write-Host "  API:     http://localhost:8000/docs" -ForegroundColor Green
Write-Host "  Neo4j:   http://localhost:7474  (neo4j / healthcare123)" -ForegroundColor Green
Write-Host ""
Write-Host 'Test: "severe chest pain and shortness of breath" + Hypertension risk' -ForegroundColor Yellow
