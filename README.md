# Collaboreum MVP Platform

아티스트와 팬을 연결하는 혁신적인 크리에이터 경제 플랫폼입니다.

## 🚀 주요 기능

### 1. 사용자 관리 시스템
- 회원가입/로그인 (아티스트/팬 역할 구분)
- 사용자 프로필 관리
- 권한 기반 접근 제어

### 2. 아티스트 섹션
- 아티스트 프로필 및 갤러리
- 작품 업로드 및 관리
- 아티스트 대시보드

### 3. 커뮤니티 시스템
- 커뮤니티 포스트 작성/조회
- 댓글 및 대댓글 시스템
- 좋아요 및 인기 게시물 관리

### 4. **펀딩 시스템 (NEW! 🎯)**
완전한 펀딩 플로우를 지원하는 시스템으로, 아티스트의 창작 활동을 후원하고 투명한 집행을 보장합니다.

#### 펀딩 플로우
```
아티스트 → 펀딩 프로젝트 등록 → 팬/후원자 → 프로젝트 탐색 → 후원 참여 → 결제 처리 → 펀딩 목표 달성 여부 확인 → [실패: 환불 처리] / [성공: 집행 → 비용 공개 → 수익 분배]
```

#### 주요 기능
- **펀딩 프로젝트 관리**: 프로젝트 생성, 수정, 상태 관리
- **후원 시스템**: 단계별 결제 프로세스, 리워드 선택, 익명/실명 후원
- **집행 관리**: 단계별 집행 계획, 진행률 추적, 예산 관리
- **비용 공개**: 투명한 비용 사용 내역, 영수증 업로드, 카테고리별 분석
- **수익 분배**: 후원자별 수익 배분, 실시간 분배 진행률, 분배 내역서 다운로드
- **자동화 시스템**: 펀딩 성공/실패 판정, 자동 환불, 상태 업데이트

### 5. 이벤트 및 라이브스트림
- 이벤트 등록 및 관리
- 라이브스트림 기능
- 실시간 상호작용

## 🏗️ 기술 스택

### Frontend
- **React 18** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** 컴포넌트
- **React Router** 네비게이션
- **React Testing Library** + **Jest** (TDD)

### Backend
- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose** ODM
- **JWT** 인증 시스템
- **Multer** 파일 업로드

### 개발 도구
- **ESLint** + **Prettier** 코드 품질
- **TypeScript** 정적 타입 검사
- **Git** 버전 관리

## 📁 프로젝트 구조

```
Collaboreum MVP Platform/
├── src/                          # Frontend 소스 코드
│   ├── components/               # React 컴포넌트
│   │   ├── FundingProjectDetail.tsx    # 펀딩 프로젝트 상세 페이지
│   │   ├── PaymentModal.tsx            # 후원 결제 모달
│   │   ├── ExecutionStatus.tsx         # 집행 현황 관리
│   │   ├── ExpenseRecords.tsx          # 비용 사용 내역
│   │   ├── RevenueDistribution.tsx     # 수익 분배 시스템
│   │   └── ...                         # 기타 컴포넌트
│   ├── contexts/                 # React Context
│   ├── services/                 # API 서비스
│   ├── types/                    # TypeScript 타입 정의
│   └── utils/                    # 유틸리티 함수
├── server/                       # Backend 서버 코드
│   ├── models/                   # MongoDB 모델
│   │   └── FundingProject.js     # 펀딩 프로젝트 모델
│   ├── routes/                   # API 라우트
│   │   └── funding.js            # 펀딩 관련 API
│   ├── middleware/               # 미들웨어
│   └── server.js                 # 메인 서버 파일
├── src/__tests__/                # 테스트 파일
│   └── FundingSystem.test.tsx    # 펀딩 시스템 통합 테스트
└── README.md                     # 프로젝트 문서
```

## 🧪 테스트 (TDD 방법론)

TDD(Test-Driven Development) 방법론을 적용하여 펀딩 시스템의 모든 기능에 대한 테스트를 작성했습니다.

### 테스트 범위
- **컴포넌트 테스트**: 각 React 컴포넌트의 렌더링 및 상호작용
- **통합 테스트**: 전체 펀딩 플로우의 연동 테스트
- **에러 처리 테스트**: API 오류 및 네트워크 오류 상황
- **접근성 테스트**: 키보드 네비게이션 및 스크린 리더 지원

### 테스트 실행
```bash
npm test                    # 전체 테스트 실행
npm test -- --watch        # 감시 모드로 테스트 실행
npm test -- --coverage     # 커버리지 리포트 생성
```

## 🚀 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/your-username/collaboreum-mvp-platform.git
cd collaboreum-mvp-platform
```

### 2. 의존성 설치
```bash
# Frontend 의존성
npm install

# Backend 의존성
cd server
npm install
cd ..
```

### 3. 환경 변수 설정
```bash
# server/.env 파일 생성
cp server/env.example server/.env

# 필요한 환경 변수 설정
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

### 4. 데이터베이스 설정
MongoDB 데이터베이스를 설정하고 연결 문자열을 환경 변수에 추가하세요.

### 5. 개발 서버 실행
```bash
# Backend 서버 실행
cd server
npm run dev

# Frontend 개발 서버 실행 (새 터미널)
npm start
```

## 📊 펀딩 시스템 상세 설명

### 아티스트 워크플로우
1. **프로젝트 등록**: 제목, 설명, 목표 금액, 기간, 리워드 설정
2. **집행 계획 수립**: 단계별 예산 계획 및 일정 설정
3. **프로젝트 진행**: 실시간 진행률 업데이트 및 상태 관리
4. **비용 관리**: 투명한 비용 사용 내역 공개 및 영수증 관리
5. **수익 분배**: 후원자들에게 수익 배분 및 지급 처리

### 후원자 워크플로우
1. **프로젝트 탐색**: 카테고리별, 상태별 프로젝트 검색
2. **후원 참여**: 금액 선택, 리워드 선택, 결제 정보 입력
3. **진행 상황 모니터링**: 실시간 진행률 및 집행 현황 확인
4. **투명성 확인**: 비용 사용 내역 및 영수증 검토
5. **수익 수령**: 프로젝트 성공 시 원금 + 수익 배분

### 시스템 특징
- **투명성**: 모든 비용 사용 내역과 영수증 공개
- **자동화**: 펀딩 성공/실패 자동 판정 및 환불 처리
- **보안**: SSL 암호화, JWT 인증, 권한 기반 접근 제어
- **확장성**: 모듈화된 구조로 새로운 기능 추가 용이
- **사용자 경험**: 직관적인 UI/UX 및 단계별 가이드

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 연락처

프로젝트에 대한 문의사항이 있으시면 이슈를 생성하거나 이메일로 연락해 주세요.

---

**Collaboreum MVP Platform** - 아티스트와 팬을 연결하는 혁신적인 크리에이터 경제의 미래를 만들어갑니다. 🎨✨
