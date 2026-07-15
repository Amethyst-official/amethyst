param(
    [switch] $Install,
    [switch] $Fetch,
    [switch] $Production,
    [switch] $Installer
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$desktopRoot = Join-Path $repoRoot "desktop"

if (-not (Test-Path (Join-Path $desktopRoot "package.json"))) {
    throw "desktop package.json was not found at $desktopRoot"
}

Push-Location $desktopRoot
try {
    if ($Install) {
        npm install
    }

    if ($Fetch) {
        npm run fetch
    }

    if ($Production) {
        npm run webpack:prod
    } else {
        npm run webpack:compile
    }

    if ($Installer) {
        npx electron-builder --config.electronDist=node_modules/electron/dist
    } else {
        npm run electron:package:dir
    }
} finally {
    Pop-Location
}
