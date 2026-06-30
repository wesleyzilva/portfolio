#!/usr/bin/env pwsh

Set-Location "E:\wesleyzilva\portfolio"

# Build
Write-Host "Building project..."
npm run build 2>&1

# Check if build succeeded
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!"
    exit 1
}

# Add dist changes
git add dist/
git commit -m "build: rebuild with updated title"

# Push
git push origin gh-pages

Write-Host "Deploy complete!"
