<#
.SYNOPSIS
  설치 폴더 크기(MB)를 기록한다. 필요한 별도 런타임(Java 등)은 docs/BENCHMARK.md 표에 따로 적는다.
.EXAMPLE
  .\install-size.ps1 -Tool ghidra -Path "C:\ghidra_11.4.3_PUBLIC"
#>
param(
  [Parameter(Mandatory)] [string] $Tool,
  [Parameter(Mandatory)] [string] $Path,
  [string] $Out = (Join-Path $PSScriptRoot "results.jsonl")
)
$ErrorActionPreference = "Stop"
$bytes = (Get-ChildItem -LiteralPath $Path -Recurse -File -Force | Measure-Object -Property Length -Sum).Sum
$mb = [math]::Round($bytes / 1MB, 1)
$row = @{ tool = $Tool; sample = $null; metric = "install_size_mb"; values = @($mb); measuredAt = (Get-Date).ToString("yyyy-MM-dd") }
($row | ConvertTo-Json -Compress) | Add-Content -Path $Out -Encoding utf8
Write-Host "$Tool : $mb MB → $Out"
