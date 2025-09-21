# API 계약 문서

## 📋 개요

이 문서는 Collaboreum MVP Platform의 API 계약을 정의합니다.

## 🔧 기본 규칙

- **서버 API 규약에 맞추어 개발하고, 서버 API가 없을 경우 생성한다**
- 모든 API 호출은 React Query 훅을 사용한다
- 직접 fetch/axios 사용을 금지한다

## 📚 API 엔드포인트 목록

### 1. 인증 API (`/api/auth`)

- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `GET /api/auth/verify` - 토큰 검증
- `POST /api/auth/refresh` - 토큰 갱신
- `POST /api/auth/check-email` - 이메일 중복 검사

### 2. 사용자 API (`/api/users`)

- `GET /api/users/profile` - 사용자 프로필 조회
- `PUT /api/users/profile` - 사용자 프로필 업데이트
- `GET /api/users/notifications` - 알림 목록 조회
- `PUT /api/users/notifications/:id/read` - 알림 읽음 처리

### 3. 아티스트 API (`/api/artists`)

- `GET /api/artists` - 아티스트 목록 조회
- `GET /api/artists/:id` - 특정 아티스트 조회
- `GET /api/artists/featured/popular` - 인기 아티스트 조회
- `GET /api/artists/new` - 새로 가입한 아티스트 조회
- `POST /api/artists/:id/follow` - 아티스트 팔로우/언팔로우
- `PUT /api/artists/:id` - 아티스트 프로필 업데이트
- `GET /api/artists/:id/dashboard` - 아티스트 대시보드 조회

### 4. 커뮤니티 API (`/api/community`)

- `GET /api/community/posts` - 게시글 목록 조회
- `GET /api/community/posts/:id` - 특정 게시글 조회
- `POST /api/community/posts` - 게시글 작성
- `PUT /api/community/posts/:id` - 게시글 수정
- `DELETE /api/community/posts/:id` - 게시글 삭제
- `POST /api/community/posts/:id/reactions` - 게시글 반응 (좋아요/싫어요/취소)
- `POST /api/community/posts/:id/views` - 조회수 증가
- `POST /api/community/posts/:id/comments` - 댓글 작성
- `DELETE /api/community/posts/:id/comments/:commentId` - 댓글 삭제
- `POST /api/community/posts/:id/comments/:commentId/reactions` - 댓글 반응
- `GET /api/community/categories` - 카테고리 목록 조회

### 5. 펀딩 프로젝트 API (`/api/funding`)

- `GET /api/funding/projects` - 프로젝트 목록 조회
- `GET /api/funding/projects/:id` - 특정 프로젝트 조회
- `POST /api/funding/projects` - 프로젝트 생성
- `PUT /api/funding/projects/:id` - 프로젝트 수정
- `POST /api/funding/projects/:id/back` - 프로젝트 후원
- `POST /api/funding/projects/:id/refund` - 환불 처리
- `POST /api/funding/projects/:id/like` - 프로젝트 좋아요
- `POST /api/funding/projects/:id/bookmark` - 프로젝트 북마크

### 6. 이벤트 API (`/api/events`)

- `GET /api/events` - 이벤트 목록 조회
- `GET /api/events/:id` - 특정 이벤트 조회
- `POST /api/events` - 이벤트 생성
- `PUT /api/events/:id` - 이벤트 수정
- `DELETE /api/events/:id` - 이벤트 삭제
- `POST /api/events/:id/register` - 이벤트 등록

### 7. 검색 API (`/api/search`) - ✅ 새로 생성됨

- `GET /api/search` - 통합 검색
- `GET /api/search/popular` - 인기 검색어 조회
- `GET /api/search/suggestions` - 검색 제안 (자동완성)

### 8. 통계 API (`/api/stats`)

- `GET /api/stats/platform` - 플랫폼 전체 통계
- `GET /api/stats/artists` - 아티스트 통계
- `GET /api/stats/projects` - 프로젝트 통계

### 9. 결제 API (`/api/payments`)

- `POST /api/payments` - 결제 요청 생성
- `POST /api/payments/:id/confirm` - 결제 확인
- `POST /api/payments/:id/cancel` - 결제 취소

### 10. 수익 분배 API (`/api/revenue`)

- `POST /api/revenue/calculate/:projectId` - 수익 분배 계산
- `POST /api/revenue/distribute/:projectId` - 수익 분배 실행

## 🔄 React Query 훅 매핑

### 커뮤니티 관련 훅

- `useCommunityPosts` - 게시글 목록 조회
- `useCommunityPost` - 특정 게시글 조회
- `useCreateCommunityPost` - 게시글 작성
- `useUpdateCommunityPost` - 게시글 수정
- `useDeleteCommunityPost` - 게시글 삭제
- `usePostReaction` - 게시글 반응
- `useIncrementPostViews` - 조회수 증가
- `useCreateComment` - 댓글 작성
- `useDeleteComment` - 댓글 삭제
- `useCreateReply` - 대댓글 작성

### 아티스트 관련 훅

- `useArtists` - 아티스트 목록 조회
- `useArtist` - 특정 아티스트 조회
- `usePopularArtists` - 인기 아티스트 조회
- `useNewArtists` - 새 아티스트 조회
- `useFollowArtist` - 아티스트 팔로우

### 펀딩 관련 훅

- `useFundingProjects` - 프로젝트 목록 조회
- `useFundingProject` - 특정 프로젝트 조회
- `useCreateFundingProject` - 프로젝트 생성
- `useBackProject` - 프로젝트 후원

## 📊 응답 형식 표준

### 성공 응답

```json
{
  "success": true,
  "data": { ... },
  "message": "성공 메시지",
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

### 에러 응답

```json
{
  "success": false,
  "message": "에러 메시지",
  "error": "상세 에러 정보 (개발 환경에서만)"
}
```

## 🔐 인증 헤더

모든 인증이 필요한 API는 다음 헤더를 포함해야 합니다:

```
Authorization: Bearer <JWT_TOKEN>
```

## 📝 주의사항

1. 모든 API 호출은 React Query 훅을 사용해야 합니다
2. 직접 fetch나 axios 사용을 금지합니다
3. 에러 처리는 React Query의 onError 콜백을 사용합니다
4. 로딩 상태는 React Query의 isPending을 사용합니다
5. 캐시 무효화는 적절한 시점에 수행합니다

## 🚀 배포 상태

- ✅ 프론트엔드: React Query 훅으로 전환 완료
- ✅ 백엔드: 모든 API 엔드포인트 구현 완료
- ✅ 검색 API: 새로 생성 및 등록 완료
- 🔄 Railway 배포: 진행 중
