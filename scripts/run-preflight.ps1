$ErrorActionPreference = "Stop"

Write-Host "Collaboreum Platform Preflight 검증 시작" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host "검증 항목: 환경변수, 타입체크, 린트, 포맷, 테스트, 접근성, 미사용코드, 색상, 빌드" -ForegroundColor White
Write-Host ""

$startTime = Get-Date
$totalSteps = 9
$currentStep = 0

function Step($name, $cmd, $description = "") {
    $currentStep++
    
    Write-Host ""
    Write-Host "[$currentStep/$totalSteps] $name" -ForegroundColor Yellow
    if ($description) {
        Write-Host "   $description" -ForegroundColor Gray
    }
    
    $stepStartTime = Get-Date
    
    try {
        $process = Start-Process -FilePath "npm" -ArgumentList "run", $cmd -NoNewWindow -PassThru -Wait
        
        if ($process.ExitCode -ne 0) {
            Write-Host "FAILED: $name 실패 (종료 코드: $($process.ExitCode))" -ForegroundColor Red
            throw "Step failed: $name"
        }
        
        $stepEndTime = Get-Date
        $stepDuration = $stepEndTime - $stepStartTime
        $durationText = if ($stepDuration.TotalSeconds -lt 1) { 
            "$([math]::Round($stepDuration.TotalMilliseconds))ms" 
        } else { 
            "$([math]::Round($stepDuration.TotalSeconds, 1))s" 
        }
        
        Write-Host "PASS: $name 통과 ($durationText)" -ForegroundColor Green
        
    } catch {
        Write-Host ""
        Write-Host "Preflight 검증 실패!" -ForegroundColor Red
        Write-Host "실패한 단계: $name" -ForegroundColor Red
        Write-Host "명령어: npm run $cmd" -ForegroundColor Gray
        Write-Host ""
        Write-Host "해결 방법:" -ForegroundColor Yellow
        Write-Host "  1. 오류 메시지를 확인하세요" -ForegroundColor White
        Write-Host "  2. npm run fix:lint 또는 npm run fix:format 실행" -ForegroundColor White
        Write-Host "  3. 다시 시도: powershell -ExecutionPolicy Bypass -File scripts/run-preflight.ps1" -ForegroundColor White
        exit 1
    }
}

# 환경변수 스키마 검증
Step "환경변수 스키마" "check:env" "Zod를 사용한 환경변수 유효성 검사"

# TypeScript 타입 체크
Step "타입체크" "check:types" "TypeScript 컴파일 오류 검사"

# ESLint 검사
Step "ESLint" "check:lint" "코드 품질 및 스타일 검사"

# Prettier 포맷 검사
Step "Prettier 확인" "check:format" "코드 포맷팅 일관성 검사"

# 유닛/통합 테스트
Step "유닛/통합 테스트" "check:test" "Jest를 사용한 테스트 실행"

# 접근성 테스트
Step "접근성 테스트" "check:accessibility" "jest-axe를 사용한 접근성 검사"

# 미사용 코드 검사
Step "미사용 코드 검사" "check:deadcode" "ts-prune을 사용한 미사용 코드 탐지"

# 의존성 및 구성 검사
Step "구성 점검" "check:deps" "knip을 사용한 미사용 의존성/파일 검사"

# 색상 하드코딩 검사
Step "색상 하드코딩 검사" "check:colors" "금지된 색상 사용 패턴 검사"

# 프로덕션 빌드
Step "프로덕션 빌드" "check:build" "React Scripts 빌드 테스트"

# 완료
$endTime = Get-Date
$totalDuration = $endTime - $startTime
$durationText = if ($totalDuration.TotalMinutes -lt 1) { 
    "$([math]::Round($totalDuration.TotalSeconds, 1))초" 
} else { 
    "$([math]::Round($totalDuration.TotalMinutes, 1))분" 
}

Write-Host ""
Write-Host ("=" * 60) -ForegroundColor Green
Write-Host "Preflight 검증 완료!" -ForegroundColor Green
Write-Host "총 소요시간: $durationText" -ForegroundColor Cyan
Write-Host "모든 검증 통과 - 이제 PR/배포를 진행하세요!" -ForegroundColor Green
Write-Host ""
Write-Host "다음 단계:" -ForegroundColor Yellow
Write-Host "  - git add . ; git commit -m 'feat: your changes'" -ForegroundColor White
Write-Host "  - git push origin your-branch" -ForegroundColor White
Write-Host "  - GitHub에서 PR 생성" -ForegroundColor White
Write-Host ""