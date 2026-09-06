param([string]$Source, [string]$OutputDirectory)
$ErrorActionPreference = 'Stop'
$sourcePath = (Resolve-Path -LiteralPath $Source).Path
$null = New-Item -ItemType Directory -Force -Path $OutputDirectory
$renderPath = (Resolve-Path -LiteralPath $OutputDirectory).Path
$pdfPath = Join-Path $renderPath 'coursework.pdf'
$word = $null
$document = $null
try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0
    $document = $word.Documents.Open($sourcePath, $false, $true, $false)
    $document.Repaginate()
    $document.ExportAsFixedFormat($pdfPath, 17)
    Write-Output ('Pages: ' + $document.ComputeStatistics(2))
} finally {
    if ($null -ne $document) { $document.Close(0); [void][Runtime.InteropServices.Marshal]::ReleaseComObject($document) }
    if ($null -ne $word) { $word.Quit(); [void][Runtime.InteropServices.Marshal]::ReleaseComObject($word) }
}
$poppler = 'C:/Users/Blinov/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/Library/bin/pdftoppm.exe'
& $poppler -png -r 120 $pdfPath (Join-Path $renderPath 'page')
if ($LASTEXITCODE -ne 0) { throw 'PDF rasterization failed' }
