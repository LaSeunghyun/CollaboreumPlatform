// Node.js 18+ 내장 fetch 사용

async function testCommunityAPI() {
  try {
    console.log('🧪 커뮤니티 API 테스트 시작...\n');
    
    // 1. 게시글 목록 조회 테스트
    console.log('1️⃣ 게시글 목록 조회 테스트');
    const postsResponse = await fetch('http://localhost:5000/api/community/posts');
    const postsData = await postsResponse.json();
    
    console.log('응답 상태:', postsResponse.status);
    console.log('응답 데이터:', JSON.stringify(postsData, null, 2));
    
    if (postsData.success && postsData.posts) {
      console.log(`✅ 게시글 ${postsData.posts.length}개 조회 성공`);
      
      // 첫 번째 게시글 상세 조회 테스트
      if (postsData.posts.length > 0) {
        const firstPost = postsData.posts[0];
        console.log(`\n2️⃣ 게시글 상세 조회 테스트 (ID: ${firstPost.id || firstPost._id})`);
        
        const postDetailResponse = await fetch(`http://localhost:5000/api/community/posts/${firstPost.id || firstPost._id}`);
        const postDetailData = await postDetailResponse.json();
        
        console.log('상세 조회 응답 상태:', postDetailResponse.status);
        console.log('상세 조회 응답 데이터:', JSON.stringify(postDetailData, null, 2));
        
        if (postDetailData.success) {
          console.log('✅ 게시글 상세 조회 성공');
        } else {
          console.log('❌ 게시글 상세 조회 실패');
        }
      }
    } else {
      console.log('❌ 게시글 목록 조회 실패');
    }
    
    // 3. 카테고리 목록 조회 테스트
    console.log('\n3️⃣ 카테고리 목록 조회 테스트');
    const categoriesResponse = await fetch('http://localhost:5000/api/community/categories');
    const categoriesData = await categoriesResponse.json();
    
    console.log('카테고리 응답 상태:', categoriesResponse.status);
    console.log('카테고리 응답 데이터:', JSON.stringify(categoriesData, null, 2));
    
    if (categoriesData.success) {
      console.log('✅ 카테고리 목록 조회 성공');
    } else {
      console.log('❌ 카테고리 목록 조회 실패');
    }
    
  } catch (error) {
    console.error('❌ API 테스트 중 오류 발생:', error.message);
  }
}

// 5초 후 테스트 실행 (서버 시작 대기)
setTimeout(testCommunityAPI, 5000);
