#Requires -Version 5.1
<#
.SYNOPSIS
    Gerenciador Git interativo para o repositorio portfolio.

.DESCRIPTION
    Menu completo organizado por fluxo de trabalho.
#>

param(
    [string]$RepoPath = (Split-Path $PSScriptRoot -Parent)
)

Set-StrictMode -Off
$ErrorActionPreference = 'Continue'

$WorkspaceRoot = Split-Path $RepoPath -Parent
$WorkspaceFile = Join-Path $WorkspaceRoot 'repositorios.code-workspace'

$COMMIT_MESSAGES = @(
    'chore: ajustes gerais de manutencao',
    'chore: limpeza de codigo e formatacao',
    'fix: correcao de comportamento inesperado',
    'feat: melhoria de experiencia do usuario',
    'refactor: simplificacao de modulo',
    'docs: atualizacao de documentacao interna',
    'build: atualizacao de dependencias'
)

function Write-Header { param([string]$Text) ... }
function Write-OK { param([string]$M); Write-Host "  [OK] $M" -ForegroundColor Green }
function Write-Warn { param([string]$M); Write-Host "  [!!] $M" -ForegroundColor Yellow }
function Write-Err { param([string]$M); Write-Host "  [XX] $M" -ForegroundColor Red }
function Write-Info { param([string]$M); Write-Host "  [..] $M" -ForegroundColor Cyan }
function Write-Bold { param([string]$M); Write-Host "  $M" -ForegroundColor White }

function Assert-Repo {
    if (-not (Test-Path (Join-Path $RepoPath '.git'))) {
        Write-Err "A pasta '$RepoPath' nao e um repositorio Git."
        exit 1
    }
    Set-Location $RepoPath
}

function Get-RepoInfo {
    $branch = (git rev-parse --abbrev-ref HEAD 2>&1) | Select-Object -First 1
    $remote = (git remote get-url origin 2>&1) | Select-Object -First 1

    $ahead = 0
    $behind = 0
    try {
        $aheadRaw = (git rev-list --count "origin/$branch..HEAD" 2>&1) | Select-Object -First 1
        $behindRaw = (git rev-list --count "HEAD..origin/$branch" 2>&1) | Select-Object -First 1
        if ($aheadRaw -match '^\d+$') { $ahead = [int]$aheadRaw }
        if ($behindRaw -match '^\d+$') { $behind = [int]$behindRaw }
    }
    catch {}

    $statusLines = @(git status --porcelain 2>&1 | Where-Object { $_ -ne '' })

    return [PSCustomObject]@{
        Branch         = $branch
        Remote         = $remote
        LocalPath      = $RepoPath
        CommitsAhead   = $ahead
        CommitsBehind  = $behind
        HasUncommitted = ($statusLines.Count -gt 0)
        Uncommitted    = $statusLines
    }
}

function Show-Menu {
    $info = Get-RepoInfo
    $syncStatus = if (($info.CommitsAhead -eq 0) -and ($info.CommitsBehind -eq 0)) { '[OK] Sincronizado' } elseif ($info.CommitsAhead -gt 0) { "[!] Local +$($info.CommitsAhead) a frente" } else { "[!] Remoto +$($info.CommitsBehind) a frente" }
    $syncColor = if (($info.CommitsAhead -eq 0) -and ($info.CommitsBehind -eq 0)) { 'Green' } else { 'Yellow' }

    Write-Header "GIT MANAGER | branch: $($info.Branch)"
    Write-Host "  Repo  : $($info.LocalPath)" -ForegroundColor Gray
    Write-Host "  Remote: $($info.Remote)" -ForegroundColor Gray
    Write-Host "  Branch: $($info.Branch)" -ForegroundColor Cyan
    Write-Host "  Sync  : $syncStatus" -ForegroundColor $syncColor

    Write-Host ''
    Write-Host '  [1] Comparar local vs remoto' -ForegroundColor Cyan
    Write-Host '  [2] Informacoes do repositorio' -ForegroundColor Cyan
    Write-Host '  [3] Listar branches' -ForegroundColor Cyan
    Write-Host '  [4] Trocar de branch' -ForegroundColor White
    Write-Host '  [5] Baixar do remoto (pull)' -ForegroundColor White
    Write-Host '  [6] Commitar com mensagem aleatoria' -ForegroundColor Yellow
    Write-Host '  [7] Subir para o remoto (push)' -ForegroundColor Green
    Write-Host '  [8] Sincronizar (pull --rebase + push)' -ForegroundColor Yellow
    Write-Host '  [0] Sair' -ForegroundColor DarkGray
}

function Show-CompareStatus {
    Write-Header 'COMPARAR LOCAL vs REMOTO'
    git fetch --quiet 2>&1 | Out-Null
    $info = Get-RepoInfo
    if (($info.CommitsAhead -eq 0) -and ($info.CommitsBehind -eq 0)) {
        Write-OK 'Local e remoto estao sincronizados.'
    } elseif ($info.CommitsAhead -gt 0) {
        Write-Warn "Local esta $($info.CommitsAhead) commit(s) a frente do remoto."
    } else {
        Write-Warn "Local esta $($info.CommitsBehind) commit(s) atras do remoto."
    }
}

function Show-RepoInfo {
    Write-Header 'INFORMACOES DO REPOSITORIO'
    git fetch --quiet 2>&1 | Out-Null
    $info = Get-RepoInfo
    Write-Bold "Caminho local     : $($info.LocalPath)"
    Write-Bold "Branch atual      : $($info.Branch)"
    Write-Bold "Remoto (origin)   : $($info.Remote)"
    if ($info.HasUncommitted) {
        Write-Warn 'Ha alteracoes nao commitadas:'
        $info.Uncommitted | ForEach-Object { Write-Host "    $_" -ForegroundColor DarkYellow }
    } else {
        Write-OK 'Working tree limpa.'
    }
}

function Show-Branches {
    Write-Header 'BRANCHES'
    git fetch --quiet 2>&1 | Out-Null
    git branch --format '%(refname:short)' | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
}

function Switch-Branch {
    Write-Header 'TROCAR DE BRANCH'
    git fetch --quiet 2>&1 | Out-Null
    $branches = @(git branch --format '%(refname:short)')
    for ($i = 0; $i -lt $branches.Count; $i++) {
        Write-Host "  [$($i + 1)] $($branches[$i])" -ForegroundColor White
    }
    $choice = Read-Host '  Numero da branch'
    if ($choice -match '^\d+$') {
        $index = [int]$choice - 1
        if ($index -ge 0 -and $index -lt $branches.Count) {
            git checkout $branches[$index] | Out-Null
            Write-OK "Branch trocada para $($branches[$index])."
        } else {
            Write-Err 'Opcao invalida.'
        }
    }
}

function Invoke-Pull {
    Write-Header 'BAIXAR DO REMOTO (pull)'
    $info = Get-RepoInfo
    if ($info.HasUncommitted) {
        Write-Warn 'Ha alteracoes nao commitadas. O pull pode gerar conflito.'
    }
    git pull origin $info.Branch 2>&1 | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
}

function Invoke-Push {
    Write-Header 'SUBIR PARA O REMOTO (push)'
    $info = Get-RepoInfo
    if ($info.CommitsAhead -eq 0) {
        Write-OK 'Nenhum commit local novo para enviar.'
        return
    }
    git push origin $info.Branch 2>&1 | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
}

function Invoke-RandomCommit {
    Write-Header 'COMMIT COM MENSAGEM ALEATORIA'
    $statusLines = @(git status --porcelain 2>&1 | Where-Object { $_ -ne '' })
    if ($statusLines.Count -eq 0) {
        Write-OK 'Nada para commitar.'
        return
    }

    $msg = $COMMIT_MESSAGES | Get-Random
    Write-Host "  Mensagem sorteada: $msg" -ForegroundColor Cyan
    $custom = Read-Host '  Pressione Enter para usar essa mensagem, ou digite outra'
    if (-not [string]::IsNullOrWhiteSpace($custom)) { $msg = $custom.Trim() }

    git add -A 2>&1 | Out-Null
    git commit -m $msg 2>&1 | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
}

Assert-Repo

Write-Info 'Buscando estado do repositorio...'
git fetch --quiet 2>&1 | Out-Null

while ($true) {
    Clear-Host
    Show-Menu
    $opcao = Read-Host '  Escolha uma opcao'
    Write-Host ''

    switch ($opcao.Trim()) {
        '1' { Show-CompareStatus }
        '2' { Show-RepoInfo }
        '3' { Show-Branches }
        '4' { Switch-Branch }
        '5' { Invoke-Pull }
        '6' { Invoke-RandomCommit }
        '7' { Invoke-Push }
        '8' { Invoke-Pull; Invoke-Push }
        '0' { Write-Host "`n  Ate logo!`n" -ForegroundColor Cyan; exit 0 }
        default { Write-Warn 'Opcao invalida.' }
    }

    Write-Host ''
    Read-Host '  Pressione Enter para voltar ao menu'
}
