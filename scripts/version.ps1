param(
    [string] $Name = "Amethyst",
    [string] $BaseVersion = "0.1",
    [string] $Platform = "win-x64",
    [switch] $Quiet
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$commitCount = (& git -C $repoRoot rev-list --count HEAD).Trim()

if (-not $commitCount -or $commitCount -notmatch '^\d+$') {
    throw "Could not read Git commit count. Make sure this is a full Git checkout."
}

$version = "$BaseVersion.$commitCount"
$buildName = "$Name-$version-$Platform"

if ($Quiet) {
    Write-Output $buildName
    exit 0
}

[PSCustomObject]@{
    Name = $Name
    BaseVersion = $BaseVersion
    CommitCount = [int]$commitCount
    Version = $version
    Platform = $Platform
    BuildName = $buildName
}
