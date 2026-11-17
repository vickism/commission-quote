#!/usr/bin/env pwsh
param(
    [Parameter(Position = 0)]
    [string]$SourceWorktree
)

$ErrorActionPreference = 'Stop'

$Target = git rev-parse --show-toplevel
if ($LASTEXITCODE -ne 0) {
    throw 'Run this script from inside the target Git worktree.'
}
$Target = (Resolve-Path -LiteralPath $Target).Path

if (-not $SourceWorktree) {
    $Worktrees = @(git -c core.quotePath=false worktree list --porcelain)
    if ($LASTEXITCODE -ne 0 -or $Worktrees.Count -eq 0) {
        throw 'Unable to find the main worktree. Pass a source worktree path explicitly.'
    }
    $SourceWorktree = $Worktrees[0] -replace '^worktree ', ''
}
$Source = (Resolve-Path -LiteralPath $SourceWorktree).Path

if ($Source -eq $Target) {
    throw 'Source and target are the same. Run this script from a new worktree.'
}
if (-not (Test-Path -LiteralPath (Join-Path $Source 'package.json') -PathType Leaf)) {
    throw 'The source must be a Commission Quote worktree root.'
}
Get-Command npm -ErrorAction Stop | Out-Null

Write-Host "Source worktree: $Source"
Write-Host "Target worktree: $Target"

$CopyFiles = @('.env', '.env.local', '.env.development.local', '.env.test.local', '.env.production.local')
foreach ($File in $CopyFiles) {
    $SourcePath = Join-Path $Source $File
    $TargetPath = Join-Path $Target $File
    if (Test-Path -LiteralPath $TargetPath) {
        Write-Host "Skipped $File (already exists in target)"
    }
    elseif (Test-Path -LiteralPath $SourcePath -PathType Leaf) {
        Copy-Item -LiteralPath $SourcePath -Destination $TargetPath
        Write-Host "Copied $File"
    }
    else {
        Write-Host "Skipped $File (not found in source)"
    }
}

Push-Location -LiteralPath $Target
try {
    Write-Host 'Installing dependencies with npm ci...'
    npm ci
    if ($LASTEXITCODE -ne 0) {
        throw "npm ci failed with exit code $LASTEXITCODE."
    }
}
finally {
    Pop-Location
}

Write-Host 'Done. Worktree is ready.'
