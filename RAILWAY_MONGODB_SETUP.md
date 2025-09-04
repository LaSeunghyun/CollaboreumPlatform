# Railway MongoDB 설정 가이드

## 문제 상황
현재 MongoDB 연결에서 인증 실패가 발생하고 있습니다:
```
❌ MongoDB connection failed: bad auth : authentication failed
```

## 해결 방법

### 1. Railway 대시보드에서 환경변수 설정

Railway 프로젝트 대시보드에서 다음 환경변수를 설정해야 합니다:

#### 필수 환경변수:
```
MONGODB_URI=mongodb+srv://username:password@collaboreum-cluster.tdwqiwn.mongodb.net/?retryWrites=true&w=majority&appName=collaboreum-cluster
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=production
```

### 2. MongoDB Atlas 설정 확인

1. **MongoDB Atlas 대시보드** 접속
2. **Database Access** 메뉴에서 사용자 확인:
   - 사용자명: `rmwl2356_db_user`
   - 비밀번호가 올바른지 확인
3. **Network Access** 메뉴에서 IP 주소 허용:
   - `0.0.0.0/0` (모든 IP 허용) 또는 Railway IP 범위 추가

### 3. 연결 문자열 형식
```
mongodb+srv://[username]:[password]@collaboreum-cluster.tdwqiwn.mongodb.net/?retryWrites=true&w=majority&appName=collaboreum-cluster
```

### 4. Railway에서 환경변수 설정 방법

1. Railway 프로젝트 대시보드 접속
2. **Variables** 탭 클릭
3. 다음 변수들 추가:
   - `MONGODB_URI`: 위의 연결 문자열 (실제 비밀번호 포함)
   - `JWT_SECRET`: 강력한 JWT 시크릿 키
   - `NODE_ENV`: `production`

### 5. 배포 재시작

환경변수 설정 후:
1. Railway에서 **Deploy** 버튼 클릭하여 재배포
2. 또는 자동 재배포가 시작될 때까지 대기

### 6. 로그 확인

Railway 대시보드의 **Deployments** 탭에서 로그를 확인하여 연결 성공 여부를 확인하세요.

## 주의사항

- 비밀번호에 특수문자가 포함된 경우 URL 인코딩이 필요할 수 있습니다
- MongoDB Atlas의 사용자 권한이 올바르게 설정되어 있는지 확인하세요
- 네트워크 접근 권한이 Railway의 IP 주소를 허용하는지 확인하세요
