const logger = (req, res, next) => {
  const start = Date.now();
  
  // 요청 로깅
  console.log(`📥 [${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log(`👤 User: ${req.user?.email || 'Anonymous'}, Role: ${req.user?.role || 'None'}`);
  
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`📦 Request Body:`, JSON.stringify(req.body, null, 2));
  }
  
  if (req.query && Object.keys(req.query).length > 0) {
    console.log(`🔍 Query Params:`, JSON.stringify(req.query, null, 2));
  }

  // 응답 로깅을 위한 원본 send 함수 저장
  const originalSend = res.send;
  
  res.send = function(data) {
    const duration = Date.now() - start;
    
    // 응답 로깅
    console.log(`📤 [${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    
    if (res.statusCode >= 400) {
      console.error(`❌ Error Response:`, data);
    } else {
      console.log(`✅ Success Response:`, typeof data === 'string' ? data.substring(0, 200) + '...' : JSON.stringify(data, null, 2));
    }
    
    // 원본 send 함수 호출
    return originalSend.call(this, data);
  };

  next();
};

module.exports = logger;
