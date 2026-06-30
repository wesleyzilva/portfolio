#!/usr/bin/env pwsh

Set-Location 'E:\wesleyzilva\portfolio'

Write-Host '=== Starting forced deploy script ==='

# Ensure we have a clean working directory or at least staged changes
git status --short

# Add all local changes
git add -A

# Commit changes even if empty or if no staged changes (force a commit when needed)
git commit -m 'fix: mobile header emphasis and text distribution' --allow-empty

# Push source changes to main
git push origin main

# Build the site
Write-Host 'Building project...'
npm run build

# Deploy dist to gh-pages
Write-Host 'Deploying to gh-pages...'
npx gh-pages -d dist -b gh-pages --silent

Write-Host '=== Deploy script completed ==='
