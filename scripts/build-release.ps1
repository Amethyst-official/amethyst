param(
    [switch] $Install,
    [switch] $Fetch,
    [switch] $SkipWeb,
    [switch] $ProductionDesktop,
    [string] $BaseVersion = "0.1",
    [string] $Platform = "win-x64"
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$buildName = & (Join-Path $PSScriptRoot "version.ps1") -BaseVersion $BaseVersion -Platform $Platform -Quiet
$releaseRoot = Join-Path $repoRoot "releases"
$desktopOutput = Join-Path $repoRoot "desktop\dist\win-unpacked"
$zipPath = Join-Path $releaseRoot "$buildName-portable.zip"

if (-not $SkipWeb) {
    & (Join-Path $PSScriptRoot "build-web.ps1") -Install:$Install
}

& (Join-Path $PSScriptRoot "build-desktop.ps1") -Install:$Install -Fetch:$Fetch -Production:$ProductionDesktop

if (-not (Test-Path (Join-Path $desktopOutput "Amethyst.exe"))) {
    throw "Desktop build output was not found at $desktopOutput"
}

New-Item -ItemType Directory -Force -Path $releaseRoot | Out-Null

if (Test-Path $zipPath) {
    Remove-Item -LiteralPath $zipPath -Force
}

Compress-Archive -Path (Join-Path $desktopOutput "*") -DestinationPath $zipPath -CompressionLevel Optimal

Write-Host ""
Write-Host "Release build created:"
Write-Host $zipPath
