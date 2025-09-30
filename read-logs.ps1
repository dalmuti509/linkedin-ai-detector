# LinkedIn AI Detector - Log Reader
# PowerShell script to read extension logs

Write-Host "🤖 LinkedIn AI Detector - Log Reader" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if log-viewer.html exists
if (Test-Path "log-viewer.html") {
    Write-Host "✅ Log viewer found!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 To view logs:" -ForegroundColor Yellow
    Write-Host "1. Open log-viewer.html in your browser" -ForegroundColor White
    Write-Host "2. Or check the browser console for real-time logs" -ForegroundColor White
    Write-Host ""
    Write-Host "🔍 The extension now logs to localStorage and can be viewed in:" -ForegroundColor Yellow
    Write-Host "- Browser Developer Tools > Application > Local Storage" -ForegroundColor White
    Write-Host "- Or use the log-viewer.html page" -ForegroundColor White
    Write-Host ""
    Write-Host "💾 Logs are automatically stored and can be downloaded as a text file." -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 To start logging:" -ForegroundColor Yellow
    Write-Host "1. Reload the extension in chrome://extensions/" -ForegroundColor White
    Write-Host "2. Navigate to LinkedIn or the test page" -ForegroundColor White
    Write-Host "3. Open log-viewer.html to see real-time logs" -ForegroundColor White
} else {
    Write-Host "❌ Log viewer not found. Make sure log-viewer.html exists." -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
