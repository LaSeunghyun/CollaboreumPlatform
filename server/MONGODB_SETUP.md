# MongoDB 설정 및 연결 가이드

## 1. MongoDB 설치

### Windows에서 MongoDB 설치
1. [MongoDB Community Server](https://www.mongodb.com/try/download/community) 다운로드
2. 설치 프로그램 실행 및 기본 설정으로 설치
3. MongoDB 서비스가 자동으로 시작됩니다

### 또는 Docker 사용
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/collaboreum
MONGODB_URI_PROD=mongodb+srv://username:password@cluster.mongodb.net/collaboreum

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

## 3. 연결 테스트

### 데이터베이스 연결 테스트
```bash
cd server
npm run test-db
```

### 서버 시작
```bash
npm run dev
```

## 4. 연결 상태 확인

서버가 실행되면 다음 메시지가 표시됩니다:
```
✅ MongoDB Connected: localhost
Server running on port 5000
Environment: development
```

## 5. 문제 해결

### 연결 실패 시 확인사항:
1. **MongoDB 서비스 실행 확인**
   - Windows: 서비스 관리자에서 "MongoDB" 서비스 상태 확인
   - 또는 명령 프롬프트에서 `net start MongoDB` 실행

2. **포트 확인**
   - 기본 포트 27017이 사용 중인지 확인
   - 다른 포트를 사용하는 경우 .env 파일에서 URI 수정

3. **방화벽 설정**
   - Windows 방화벽에서 27017 포트 허용

4. **네트워크 연결**
   - localhost 대신 127.0.0.1 사용 시도

### MongoDB Compass 사용 (GUI 도구)
1. [MongoDB Compass](https://www.mongodb.com/try/download/compass) 다운로드
2. 연결 문자열: `mongodb://localhost:27017`
3. 데이터베이스 및 컬렉션을 시각적으로 관리

## 6. 프로덕션 환경

클라우드 MongoDB 사용 시:
- MongoDB Atlas 계정 생성
- 클러스터 생성 및 연결 문자열 복사
- .env 파일의 MONGODB_URI_PROD 사용
- 환경 변수 NODE_ENV=production 설정

## 7. 스크립트 명령어

```bash
# 데이터베이스 연결 테스트
npm run test-db

# 개발 서버 시작
npm run dev

# 프로덕션 서버 시작
npm start

# 데이터베이스 초기화 (기존 데이터 삭제)
npm run init-db

# 회원 데이터 시드 (샘플 데이터 추가)
npm run seed-users

# 강제로 회원 데이터 시드 (기존 데이터 유지)
npm run seed-users -- --force

# 빠른 사용자 추가
npm run add-user "홍길동" "hong@example.com" "password123" "artist" "음악가입니다"
```

## 8. 회원 데이터 관리

### 샘플 회원 데이터
- **아티스트**: 재즈, 힙합, 클래식, 일렉트로닉, 팝 음악가
- **팬**: 음악, 미술, 영상 애호가
- **관리자**: 시스템 관리자

### 로그인 정보
- 아티스트: `jazz@example.com` / `password123`
- 팬: `musicfan@example.com` / `password123`
- 관리자: `admin@collaboreum.com` / `admin123`
