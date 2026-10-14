$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot

function Resolve-ExistingCommand($name, $candidates) {
  $found = Get-Command $name -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($found) { return $found.Source }
  foreach ($candidate in $candidates) {
    if (Test-Path -LiteralPath $candidate -PathType Leaf) { return $candidate }
  }
  return $null
}

$node = Resolve-ExistingCommand 'node.exe' @(
  (Join-Path $env:ProgramFiles 'nodejs\node.exe'),
  (Join-Path $env:LOCALAPPDATA 'Programs\nodejs\node.exe'),
  (Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe')
)
if (-not $node) {
  Write-Host 'Node.js is not installed or could not be found. Ask Codex to restore the existing local runtime.'
  exit 1
}

$pnpm = Resolve-ExistingCommand 'pnpm.cmd' @(
  (Join-Path $env:APPDATA 'npm\pnpm.cmd'),
  (Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd')
)
if (-not $pnpm) {
  Write-Host 'pnpm is not installed or could not be found. Ask Codex to restore the existing local runtime.'
  exit 1
}

$docker = Resolve-ExistingCommand 'docker.exe' @(
  (Join-Path $env:LOCALAPPDATA 'Programs\DockerDesktop\resources\bin\docker.exe'),
  (Join-Path $env:ProgramFiles 'Docker\Docker\resources\bin\docker.exe')
)
if (-not $docker) {
  Write-Host 'Docker Desktop is not installed or its command could not be found.'
  exit 1
}

$env:PATH = (@((Split-Path -Parent $node), (Split-Path -Parent $pnpm), (Split-Path -Parent $docker)) + @($env:PATH)) -join [IO.Path]::PathSeparator

& $node (Join-Path $PSScriptRoot 'local-start.mjs') --pnpm $pnpm --docker $docker
exit $LASTEXITCODE
