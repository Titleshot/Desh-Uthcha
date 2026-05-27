# Re-encodes Bhimsen series thumbnails (PNG -> WebP) and videos (H.264, smaller files).
# Requires ffmpeg on PATH. Run from repo root: npm run optimize:series-media
# Source folder: Compressed Videos (or Compressed Video) — same as Vite `series-media`.

$ErrorActionPreference = 'Stop'

function Resolve-MediaDir {
  $repoRoot = Split-Path $PSScriptRoot -Parent
  $preferred = Join-Path $repoRoot 'Compressed Video'
  $legacy = Join-Path $repoRoot 'Compressed Videos'
  if (Test-Path $preferred) { return (Resolve-Path $preferred).Path }
  if (Test-Path $legacy) { return (Resolve-Path $legacy).Path }
  throw "Neither Compressed Video nor Compressed Videos found under $repoRoot"
}

$mediaDir = Resolve-MediaDir
Write-Host "Media directory: $mediaDir"

# --- PNG -> WebP (max width 560px, quality 84); skipped if no PNGs (re-runs) ---
$pngs = @(Get-ChildItem -LiteralPath $mediaDir -Filter '*.png' -File -ErrorAction SilentlyContinue)
foreach ($f in $pngs) {
  $webp = [System.IO.Path]::ChangeExtension($f.FullName, '.webp')
  Write-Host "WEBP $($f.Name)"
  & ffmpeg -y -hide_banner -loglevel error -i $f.FullName -vf "scale='min(560,iw)':-1" -c:v libwebp -quality 84 $webp
  if ($LASTEXITCODE -ne 0) { throw "ffmpeg webp failed: $($f.Name)" }
  Remove-Item -LiteralPath $f.FullName -Force
}
if ($pngs.Count -eq 0) { Write-Host 'No PNG files to convert (already WebP or missing).' }

# --- MP4: portrait -> max width 720; landscape -> same dimensions, CRF only ---
Get-ChildItem -LiteralPath $mediaDir -Filter '*.mp4' -File | ForEach-Object {
  $in = $_.FullName
  $tmp = $in -replace '\.mp4$', '.reenc-temp.mp4'
  $probe = & ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 $in
  if (-not $probe) { throw "ffprobe failed: $($_.Name)" }
  $parts = $probe -split ','
  $w = [int]$parts[0]
  $h = [int]$parts[1]
  Write-Host "MP4 $($_.Name) (${w}x${h})"

  if ($h -gt $w) {
    & ffmpeg -y -hide_banner -loglevel error -i $in -c:v libx264 -crf 28 -preset faster -vf 'scale=720:-2' -c:a aac -b:a 96k -movflags +faststart $tmp
  } else {
    & ffmpeg -y -hide_banner -loglevel error -i $in -c:v libx264 -crf 28 -preset faster -c:a aac -b:a 96k -movflags +faststart $tmp
  }
  if ($LASTEXITCODE -ne 0) { throw "ffmpeg mp4 failed: $($_.Name)" }
  Remove-Item -LiteralPath $in -Force
  Move-Item -LiteralPath $tmp -Destination $in
}

Write-Host 'Done. Ensure src/data/bhimsenSeriesEpisodes.ts uses thumbnailFile *.webp (not PNG).'
