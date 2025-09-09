#!/usr/bin/env powershell
$ErrorActionPreference = "Stop"

Write-Host "🚀 Collaboreum Platform Preflight 설정 시작" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

# 1. 의존성 설치
Write-Host "`n📦 의존성 설치 중..." -ForegroundColor Yellow
npm install

# 2. Husky 초기화
Write-Host "`n🔧 Husky Git 훅 설정 중..." -ForegroundColor Yellow
npx husky init

# 3. 권한 설정 (Windows)
Write-Host "`n🔐 PowerShell 실행 정책 설정 중..." -ForegroundColor Yellow
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

# 4. Preflight 테스트 실행
Write-Host "`n🧪 Preflight 테스트 실행 중..." -ForegroundColor Yellow
powershell -ExecutionPolicy Bypass -File scripts/run-preflight.ps1

Write-Host "`n✅ Preflight 설정 완료!" -ForegroundColor Green
Write-Host "`n📝 사용 방법:" -ForegroundColor Cyan
Write-Host "  • 로컬 검증: powershell -ExecutionPolicy Bypass -File scripts/run-preflight.ps1" -ForegroundColor White
Write-Host "  • 자동 검증: git push (pre-push 훅에서 자동 실행)" -ForegroundColor White
Write-Host "  • 개별 검증: npm run check:all" -ForegroundColor White
Write-Host ""
