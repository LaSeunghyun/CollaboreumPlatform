# Collaboreum MVP Platform - Backend Server

## 🚀 개요

Collaboreum MVP Platform의 백엔드 서버입니다. 아티스트와 팬들을 연결하는 협업 플랫폼을 위한 RESTful API를 제공합니다.

## ✨ 주요 기능

- **아티스트 관리**: 프로필, 작품, 팔로워 관리
- **사용자 인증**: JWT 기반 보안 인증
- **프로젝트 관리**: 아티스트 프로젝트 생성 및 관리
- **커뮤니티**: 포럼, 이벤트, 라이브스트림
- **펀딩**: 아티스트 프로젝트 투자 및 후원
- **갤러리**: 작품 전시 및 관리

## 🛠️ 기술 스택

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT + bcrypt
- **Validation**: express-validator
- **File Upload**: Multer + Cloudinary
- **Security**: Helmet, CORS

## 📋 요구사항

- Node.js 18+
- MongoDB 6+
- npm 또는 yarn

## 🚀 빠른 시작

### 1. 의존성 설치

```bash
cd server
npm install
```

### 2. 환경 설정

`.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/collaboreum

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Client Configuration
CLIENT_URL=http://localhost:3000
```

### 3. MongoDB 설정

#### 로컬 MongoDB 사용

```bash
# MongoDB Community Edition 설치
# https://www.mongodb.com/try/download/community

# MongoDB 서비스 시작
mongod
```

#### Docker 사용

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. 데이터베이스 초기화

```bash
# 샘플 데이터로 데이터베이스 초기화
npm run init-db

# 카테고리 데이터 초기화
npm run init-categories
```

### 5. 서버 실행

```bash
# 개발 모드 (nodemon)
npm run dev

# 프로덕션 모드
npm start

# MongoDB 연결 확인 후 서버 시작
npm run start:check
```

## 📚 API 문서

### 기본 엔드포인트

- `GET /api/health` - 서버 상태 확인
- `GET /api/artists` - 아티스트 목록 조회
- `GET /api/artists/:id` - 특정 아티스트 조회
- `POST /api/artists/:id/follow` - 아티스트 팔로우/언팔로우

### 카테고리 API

- `GET /api/categories` - 모든 카테고리 조회
- `GET /api/categories/:id` - 특정 카테고리 조회
- `POST /api/categories` - 카테고리 생성 (관리자용)
- `PUT /api/categories/:id` - 카테고리 수정 (관리자용)
- `DELETE /api/categories/:id` - 카테고리 삭제 (관리자용)

### 갤러리 API

- `GET /api/gallery/categories` - 갤러리 카테고리 조회
- `GET /api/gallery/artworks` - 모든 작품 조회 (필터링/정렬 포함)
- `GET /api/gallery/artworks/:id` - 특정 작품 조회
- `POST /api/gallery/artworks` - 작품 업로드
- `PUT /api/gallery/artworks/:id` - 작품 수정
- `DELETE /api/gallery/artworks/:id` - 작품 삭제

### 인증이 필요한 엔드포인트

- `GET /api/users/:id/profile` - 사용자 프로필 조회
- `PUT /api/users/:id/profile` - 사용자 프로필 업데이트
- `POST /api/projects` - 프로젝트 생성

## 🗄️ 데이터베이스 스키마

### User 모델

- 기본 정보 (이름, 이메일, 비밀번호)
- 역할 (artist, fan, admin)
- 프로필 정보 (아바타, 바이오)

### Category 모델

- 카테고리 ID, 라벨, 아이콘
- 활성화 상태, 정렬 순서
- 생성/수정 시간

### Artist 모델

- 카테고리, 위치, 평점
- 팔로워 수, 프로젝트 통계
- 소셜 링크, 성과
- 인증 상태, 추천 여부

### Project 모델

- 프로젝트 정보 (제목, 설명, 목표)
- 펀딩 정보 (목표 금액, 현재 금액)
- 진행 상태, 마감일

## 🔧 개발 도구

### 스크립트

```bash
npm run dev          # 개발 모드 (nodemon)
npm run start        # 프로덕션 모드
npm run start:check  # MongoDB 연결 확인 후 시작
npm run init-db      # 데이터베이스 초기화
npm run init-categories # 카테고리 데이터 초기화
npm run test         # 테스트 실행
npm run setup        # 설정 가이드 표시
```

### 디버깅

```bash
# 환경 변수 확인
NODE_ENV=development npm run dev

# 로그 레벨 설정
DEBUG=* npm run dev
```

## 🚨 문제 해결

### MongoDB 연결 실패

1. MongoDB 서비스가 실행 중인지 확인
2. `.env` 파일의 `MONGODB_URI` 확인
3. 방화벽 설정 확인

### 포트 충돌

1. 다른 프로세스가 5000번 포트를 사용 중인지 확인
2. `.env` 파일에서 `PORT` 변경

### 권한 문제

1. MongoDB 사용자 권한 확인
2. 데이터베이스 접근 권한 확인

## 📝 라이센스

MIT License

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 지원

문제가 발생하거나 질문이 있으시면 이슈를 생성해 주세요.
