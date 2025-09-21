# Railway 배포 가이드

## 🚀 Railway 배포 설정

### 1. 환경 변수 설정

Railway 대시보드에서 다음 환경 변수들을 설정해야 합니다:

#### 필수 환경 변수

```
MONGODB_URI=mongodb+srv://rmwl2356_db_user:실제비밀번호@collaboreum-cluster.tdwqiwn.mongodb.net/?retryWrites=true&w=majority&appName=collaboreum-cluster
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=production
```

#### 선택적 환경 변수

```
CLIENT_URL=https://your-frontend-domain.com
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### 2. MongoDB Atlas 설정

1. [MongoDB Atlas](https://www.mongodb.com/atlas)에서 클러스터 생성
2. 데이터베이스 사용자 생성
3. 네트워크 액세스에서 모든 IP 허용 (0.0.0.0/0)
4. 연결 문자열을 `MONGODB_URI`로 설정

### 3. Railway 프로젝트 설정

1. Railway 대시보드에서 새 프로젝트 생성
2. GitHub 저장소 연결
3. 환경 변수 설정
4. 배포 시작

### 4. 배포 확인

배포가 완료되면 다음 엔드포인트로 확인:

- Health Check: `https://your-app.railway.app/api/health`
- API Base URL: `https://your-app.railway.app/api/`

### 5. 문제 해결

#### 일반적인 문제들:

1. **환경 변수 누락**
   - Railway 대시보드에서 모든 필수 환경 변수가 설정되었는지 확인

2. **MongoDB 연결 실패**
   - MongoDB Atlas 클러스터가 실행 중인지 확인
   - 네트워크 액세스 설정 확인
   - 연결 문자열 형식 확인

3. **포트 문제**
   - Railway는 자동으로 PORT 환경 변수를 설정
   - 서버 코드에서 `process.env.PORT` 사용 확인

4. **빌드 실패**
   - package.json의 의존성 확인
   - Node.js 버전 호환성 확인

### 6. 로그 확인

Railway 대시보드의 "Deployments" 탭에서 배포 로그를 확인할 수 있습니다.

### 7. 자동 배포 설정

GitHub 저장소에 푸시할 때마다 자동으로 배포되도록 설정할 수 있습니다.
