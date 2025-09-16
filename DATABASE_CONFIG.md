# 데이터베이스 설정

## 🗄️ MongoDB URI

### 프로덕션 데이터베이스 (Railway)
```
mongodb+srv://rmwl2356_db_user:f8NaljAJhfZpTc7J@collaboreum-cluster.tdwqiwn.mongodb.net/?retryWrites=true&w=majority&appName=collaboreum-cluster
```

### 연결 정보
- **호스트**: Railway MongoDB Atlas 클러스터
- **데이터베이스명**: test
- **컬렉션 수**: 14개
- **상태**: ✅ 연결 성공

## 📊 현재 데이터 현황

### 컬렉션 목록
1. `events` - 이벤트 데이터
2. `livestreams` - 라이브 스트림 데이터
3. `users` - 사용자 데이터
4. `payments` - 결제 데이터
5. `artists` - 아티스트 프로필 데이터
6. `fundingprojects` - 펀딩 프로젝트 데이터
7. `artworks` - 작품 데이터
8. `communityposts` - 커뮤니티 게시글 데이터
9. `projects` - 일반 프로젝트 데이터
10. `creatorpayouts` - 크리에이터 지급 데이터
11. `revenuedistributions` - 수익 분배 데이터
12. `tracks` - 트랙 데이터
13. `notifications` - 알림 데이터
14. `categories` - 카테고리 데이터

### 데이터 통계
- **커뮤니티 게시글**: 3개
- **사용자**: 2명
- **아티스트**: 1명

## 🔧 연결 설정

### 환경 변수
```bash
MONGODB_URI=mongodb+srv://rmwl2356_db_user:f8NaljAJhfZpTc7J@collaboreum-cluster.tdwqiwn.mongodb.net/?retryWrites=true&w=majority&appName=collaboreum-cluster
```

### 연결 옵션
```javascript
const mongoose = require('mongoose');

await mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
```

## 📝 주의사항

1. **보안**: URI에 포함된 비밀번호는 절대 공개하지 마세요
2. **백업**: 정기적인 데이터 백업을 권장합니다
3. **모니터링**: Railway 대시보드에서 연결 상태를 모니터링하세요
4. **확장성**: 사용자 증가에 따라 클러스터 확장을 고려하세요

## 🚀 배포 시 고려사항

- 모든 CRUD 작업은 이 URI를 사용합니다
- 로컬 개발 시에도 이 데이터베이스를 사용할 수 있습니다
- 프로덕션 환경에서는 연결 풀링을 고려하세요

## 📞 문제 해결

연결 문제가 발생하면:
1. Railway 대시보드에서 클러스터 상태 확인
2. 네트워크 연결 확인
3. 인증 정보 확인
4. 방화벽 설정 확인
