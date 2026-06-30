#!/usr/bin/env pwsh

Set-Location "E:\wesleyzilva\portfolio"

# Build
Write-Host "Building project..."
npm run build 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!"
    exit 1
}

Write-Host "Build successful!"

# Commit
Write-Host "Committing changes..."
git add src/
git commit -m "feat: collapse all panels by default and optimize mobile header spacing

- Initialize expandedPanel state as null to keep all panels collapsed on page load
- Recruiter can see 4 steps immediately without scrolling
- Reduced header gap, padding, and font sizes for mobile
- Photo and dots are smaller on mobile for better spacing
- Panels expand on click with smooth interaction"

# Push
Write-Host "Pushing to GitHub..."
git push origin main

Write-Host "Deployment triggered!"
