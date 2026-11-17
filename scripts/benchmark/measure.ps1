<#
.SYNOPSIS
  명령 하나를 여러 번 실행해 걸린 시간과 최대 메모리를 기록한다. (Windows PowerShell 5.1 / PowerShell 7)

.EXAMPLE
  # Ghidra 헤드리스 자동 분석 시간
  .\measure.ps1 -Tool ghidra -Sample zlib-dll -Metric auto_analysis_s `
    -FilePath "C:\ghidra\support\analyzeHeadless.bat" `
    -Arguments 'C:\bench\proj', 'bench', '-import', 'C:\bench\samples\zlib1.dll', '-overwrite', '-deleteProject'

  # GUI만 있는 도구는 -Manual: 사람이 스톱워치처럼 Enter로 시작·끝을 찍는다
  .\measure.ps1 -Tool ida-free -Sample zlib-dll -Metric auto_analysis_s -Manual
#>
param(
  [Parameter(Mandatory)] [string] $Tool,
  [string] $Sample = "",
  [Parameter(Mandatory)]
  [ValidateSet("cold_start_s", "auto_analysis_s", "decompile_s")]
  [string] $Metric,
  [string] $FilePath,
  [string[]] $Arguments = @(),
  [int] $Runs = 3,
  [switch] $Manual,
  [string] $Out = (Join-Path $PSScriptRoot "results.jsonl")
)

$ErrorActionPreference = "Stop"
$times = @()
$peaks = @()

for ($i = 1; $i -le $Runs; $i++) {
  if ($Manual) {
    Read-Host "[$i/$Runs] 준비되면 Enter (시작)"
    $sw = [Diagnostics.Stopwatch]::StartNew()
    Read-Host "끝나면 Enter (종료)"
    $sw.Stop()
    $times += $sw.Elapsed.TotalSeconds
    continue
  }

  $sw = [Diagnostics.Stopwatch]::StartNew()
  $p = Start-Process -FilePath $FilePath -ArgumentList $Arguments -PassThru -WindowStyle Hidden
  $peak = 0
  while (-not $p.HasExited) {
    try {
      $p.Refresh()
      if ($p.PeakWorkingSet64 -gt $peak) { $peak = $p.PeakWorkingSet64 }
    } catch {}
    Start-Sleep -Milliseconds 100
  }
  $sw.Stop()
  if ($p.ExitCode -ne 0) { throw "실행 실패 (exit $($p.ExitCode))" }
  $times += $sw.Elapsed.TotalSeconds
  $peaks += [math]::Round($peak / 1MB, 1)
  Write-Host ("[{0}/{1}] {2:N2}s, peak {3} MB" -f $i, $Runs, $sw.Elapsed.TotalSeconds, $peaks[-1])
}

$today = (Get-Date).ToString("yyyy-MM-dd")
$sampleValue = if ($Sample) { $Sample } else { $null }
$rows = @(@{ tool = $Tool; sample = $sampleValue; metric = $Metric; values = $times; measuredAt = $today })
if ($peaks.Count -gt 0) {
  $rows += @{ tool = $Tool; sample = $sampleValue; metric = "peak_memory_mb"; values = $peaks; measuredAt = $today }
}
foreach ($r in $rows) { ($r | ConvertTo-Json -Compress) | Add-Content -Path $Out -Encoding utf8 }
Write-Host "기록: $Out"
