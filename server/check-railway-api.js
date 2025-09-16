// Railway 배포된 API를 통해 커뮤니티 게시글 조회

async function checkRailwayAPI() {
  try {
    console.log('🚀 Railway API를 통한 커뮤니티 게시글 조회...\n');
    
    // Railway 배포 URL (실제 배포된 URL로 변경 필요)
    const railwayBaseUrl = 'https://collaboreum-production.up.railway.app';
    
    console.log(`🔗 Railway API URL: ${railwayBaseUrl}\n`);
    
    // 1. Health Check
    console.log('1️⃣ Health Check...');
    try {
      const healthResponse = await fetch(`${railwayBaseUrl}/api/health`);
      const healthData = await healthResponse.json();
      console.log('✅ Health Check 성공:', healthData);
    } catch (error) {
      console.log('❌ Health Check 실패:', error.message);
    }
    
    // 2. 카테고리 목록 조회
    console.log('\n2️⃣ 카테고리 목록 조회...');
    try {
      const categoriesResponse = await fetch(`${railwayBaseUrl}/api/community/categories`);
      const categoriesData = await categoriesResponse.json();
      
      if (categoriesData.success) {
        console.log('✅ 카테고리 조회 성공:');
        categoriesData.data.forEach(category => {
          console.log(`   - ${category.label} (${category.value})`);
        });
      } else {
        console.log('❌ 카테고리 조회 실패:', categoriesData.message);
      }
    } catch (error) {
      console.log('❌ 카테고리 조회 오류:', error.message);
    }
    
    // 3. 게시글 목록 조회
    console.log('\n3️⃣ 게시글 목록 조회...');
    try {
      const postsResponse = await fetch(`${railwayBaseUrl}/api/community/posts?limit=10`);
      const postsData = await postsResponse.json();
      
      if (postsData.success && postsData.posts) {
        console.log(`✅ 게시글 조회 성공: ${postsData.posts.length}개`);
        
        postsData.posts.forEach((post, index) => {
          console.log(`\n📝 게시글 ${index + 1}:`);
          console.log(`   제목: ${post.title}`);
          console.log(`   ID: ${post._id || post.id}`);
          console.log(`   작성자: ${post.author?.name || post.authorName || 'Unknown'}`);
          console.log(`   카테고리: ${post.category}`);
          console.log(`   내용: ${post.content?.substring(0, 100)}${post.content?.length > 100 ? '...' : ''}`);
          console.log(`   조회수: ${post.viewCount || 0}`);
          console.log(`   좋아요: ${post.likes?.length || 0}`);
          console.log(`   댓글: ${post.comments?.length || 0}`);
          console.log(`   작성일: ${post.createdAt}`);
        });
        
        // 페이지네이션 정보
        if (postsData.pagination) {
          console.log('\n📊 페이지네이션 정보:');
          console.log(`   현재 페이지: ${postsData.pagination.page}`);
          console.log(`   페이지당 게시글: ${postsData.pagination.limit}`);
          console.log(`   총 게시글: ${postsData.pagination.total}`);
          console.log(`   총 페이지: ${postsData.pagination.pages}`);
        }
        
      } else {
        console.log('❌ 게시글 조회 실패:', postsData.message || '알 수 없는 오류');
      }
    } catch (error) {
      console.log('❌ 게시글 조회 오류:', error.message);
    }
    
    // 4. 인기 게시글 조회
    console.log('\n4️⃣ 인기 게시글 조회...');
    try {
      const popularResponse = await fetch(`${railwayBaseUrl}/api/community/posts/popular?limit=5`);
      const popularData = await popularResponse.json();
      
      if (popularData.success && popularData.data) {
        console.log('✅ 인기 게시글 조회 성공:');
        popularData.data.forEach((post, index) => {
          console.log(`   ${index + 1}. ${post.title} (좋아요: ${post.likes?.length || 0}, 조회: ${post.viewCount || 0})`);
        });
      } else {
        console.log('❌ 인기 게시글 조회 실패:', popularData.message);
      }
    } catch (error) {
      console.log('❌ 인기 게시글 조회 오류:', error.message);
    }
    
    // 5. 최신 게시글 조회
    console.log('\n5️⃣ 최신 게시글 조회...');
    try {
      const recentResponse = await fetch(`${railwayBaseUrl}/api/community/posts/recent?limit=5`);
      const recentData = await recentResponse.json();
      
      if (recentData.success && recentData.data) {
        console.log('✅ 최신 게시글 조회 성공:');
        recentData.data.forEach((post, index) => {
          console.log(`   ${index + 1}. ${post.title} (${post.createdAt})`);
        });
      } else {
        console.log('❌ 최신 게시글 조회 실패:', recentData.message);
      }
    } catch (error) {
      console.log('❌ 최신 게시글 조회 오류:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Railway API 조회 중 오류 발생:', error.message);
  }
}

// 스크립트 실행
checkRailwayAPI();
