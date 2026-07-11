param(
  [int]$Port = 8642,
  [string]$Root = $PSScriptRoot
)

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Serving $Root at http://localhost:$Port/"

$mime = @{
  ".html"="text/html"; ".css"="text/css"; ".js"="application/javascript";
  ".svg"="image/svg+xml"; ".json"="application/json";
}

try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $req = $ctx.Request
    $res = $ctx.Response
    $relPath = [Uri]::UnescapeDataString($req.Url.AbsolutePath.TrimStart('/'))
    if ([string]::IsNullOrWhiteSpace($relPath)) { $relPath = "index.html" }
    $fullPath = Join-Path $Root $relPath

    if (Test-Path $fullPath -PathType Leaf) {
      $ext = [System.IO.Path]::GetExtension($fullPath)
      $ct = $mime[$ext]
      if (-not $ct) { $ct = "application/octet-stream" }
      $bytes = [System.IO.File]::ReadAllBytes($fullPath)
      $res.ContentType = $ct
      $res.ContentLength64 = $bytes.Length
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $res.StatusCode = 404
      $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $relPath")
      $res.OutputStream.Write($msg, 0, $msg.Length)
    }
    $res.OutputStream.Close()
  }
} finally {
  $listener.Stop()
}
