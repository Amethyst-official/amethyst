param(
    [switch] $Install
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$guiRoot = Join-Path $repoRoot "scratch-gui"

if (-not (Test-Path (Join-Path $guiRoot "package.json"))) {
    throw "scratch-gui package.json was not found at $guiRoot"
}

Push-Location $guiRoot
try {
    if ($Install) {
        npm install
    }

    npm run build
} finally {
    Pop-Location
}
