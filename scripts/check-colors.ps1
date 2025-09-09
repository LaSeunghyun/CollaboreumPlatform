$ErrorActionPreference = "Stop"
Write-Host "🔍 색상 하드코딩 검사 중..." -ForegroundColor Yellow

$violations = @()
$totalFiles = 0
$checkedFiles = 0

# 검사할 파일 패턴
$filePatterns = @("*.tsx", "*.ts", "*.css", "*.scss", "*.sass")

# 제외할 디렉토리 패턴
$excludePatterns = @(
    "*\src\shared\ui\*",
    "*\src\shared\theme\*", 
    "*\src\styles\*",
    "*\node_modules\*",
    "*\build\*",
    "*\dist\*",
    "*\coverage\*",
    "*\__tests__\*",
    "*\*.test.*",
    "*\*.spec.*"
)

# 금지된 색상 패턴들
$patterns = @{
    "Raw Tailwind Colors" = "(bg|text|border|ring)-(red|blue|green|slate|gray|neutral|zinc|stone|emerald|indigo|violet|pink|yellow|orange|purple|cyan|teal|lime|amber|rose|sky|fuchsia|violet|indigo|blue|cyan|teal|emerald|green|lime|yellow|amber|orange|red|pink|rose)-"
    "Raw Tailwind Brackets" = "(bg|text|border|ring)-\["
    "Hex Colors" = "#[0-9a-fA-F]{3,6}(?![0-9a-fA-F])"
    "RGB Colors" = "rgb\s*\([^)]+\)"
    "RGBA Colors" = "rgba\s*\([^)]+\)"
    "HSL Colors" = "hsl\s*\([^)]+\)"
    "HSLA Colors" = "hsla\s*\([^)]+\)"
    "CSS Variables (forbidden)" = "var\(--[^)]*color[^)]*\)"
}

# 파일 검색
$files = Get-ChildItem -Path "src" -Recurse -Include $filePatterns | Where-Object {
    $file = $_
    $shouldExclude = $false
    foreach ($pattern in $excludePatterns) {
        if ($file.FullName -like $pattern) {
            $shouldExclude = $true
            break
        }
    }
    return -not $shouldExclude
}

$totalFiles = $files.Count
Write-Host "📁 검사할 파일 수: $totalFiles" -ForegroundColor Cyan

foreach ($file in $files) {
    $checkedFiles++
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    
    if (-not $content) {
        continue
    }
    
    foreach ($patternName in $patterns.Keys) {
        $pattern = $patterns[$patternName]
        $matches = [regex]::Matches($content, $pattern, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
        
        if ($matches.Count -gt 0) {
            foreach ($match in $matches) {
                $lineNumber = ($content.Substring(0, $match.Index) -split "`n").Count
                $line = ($content -split "`n")[$lineNumber - 1].Trim()
                $violations += "$($file.Name):$lineNumber`: $line"
            }
        }
    }
    
    if ($checkedFiles % 10 -eq 0) {
        Write-Progress -Activity "색상 검사 중" -Status "진행률: $checkedFiles/$totalFiles" -PercentComplete (($checkedFiles / $totalFiles) * 100)
    }
}

Write-Progress -Activity "색상 검사 중" -Completed

if ($violations.Count -gt 0) {
    Write-Host "`n❌ 금지된 색상 사용이 발견되었습니다:" -ForegroundColor Red
    Write-Host "=" * 60 -ForegroundColor Red
    
    $groupedViolations = $violations | Group-Object { ($_ -split ":")[0] }
    foreach ($group in $groupedViolations) {
        Write-Host "`n📄 $($group.Name):" -ForegroundColor Yellow
        foreach ($violation in $group.Group) {
            Write-Host "  $violation" -ForegroundColor Red
        }
    }
    
    Write-Host "`n💡 해결 방법:" -ForegroundColor Cyan
    Write-Host "  - CSS 변수 사용: var(--primary-600)" -ForegroundColor White
    Write-Host "  - Tailwind 색상 클래스: bg-primary-600" -ForegroundColor White
    Write-Host "  - @/shared/ui 컴포넌트 사용" -ForegroundColor White
    
    exit 1
} else {
    Write-Host "`n✅ 색상 하드코딩 검사 통과!" -ForegroundColor Green
    Write-Host "📊 검사 완료: $checkedFiles/$totalFiles 파일" -ForegroundColor Cyan
    exit 0
}
