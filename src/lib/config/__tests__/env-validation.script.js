// 간단한 검증 코드 - ensureApiPath 함수 직접 구현
function ensureApiPath(path) {
  if (!path) {
    return path;
  }

  // 루트 경로는 그대로 유지
  if (path === '/') {
    return path;
  }

  // 절대 경로와 상대 경로 모두에 대해 후행 슬래시 제거
  // /\/+$/ 정규식으로 하나 이상의 연속된 슬래시를 끝에서 제거
  return path.replace(/\/+$/, '');
}

console.log('🧪 ensureApiPath 함수 검증 시작...\n');

// 테스트 케이스들
const testCases = [
  // 절대 경로 테스트
  {
    input: 'https://example.com/api/',
    expected: 'https://example.com/api',
    description: '절대 경로 - 후행 슬래시 제거',
  },
  {
    input: 'http://localhost:5000/api/',
    expected: 'http://localhost:5000/api',
    description: '로컬 절대 경로 - 후행 슬래시 제거',
  },
  {
    input: 'https://example.com/api///',
    expected: 'https://example.com/api',
    description: '절대 경로 - 여러 후행 슬래시 제거',
  },
  {
    input: 'https://example.com/api',
    expected: 'https://example.com/api',
    description: '절대 경로 - 후행 슬래시 없음 (변경 없음)',
  },

  // 상대 경로 테스트
  {
    input: '/api/',
    expected: '/api',
    description: '상대 경로 - 후행 슬래시 제거',
  },
  {
    input: '/users/123/',
    expected: '/users/123',
    description: '상대 경로 - 중간 경로 후행 슬래시 제거',
  },
  {
    input: '/api///',
    expected: '/api',
    description: '상대 경로 - 여러 후행 슬래시 제거',
  },
  {
    input: '/api',
    expected: '/api',
    description: '상대 경로 - 후행 슬래시 없음 (변경 없음)',
  },

  // 특수 케이스
  {
    input: '/',
    expected: '/',
    description: '루트 경로 (변경 없음)',
  },
  {
    input: '',
    expected: '',
    description: '빈 문자열 (변경 없음)',
  },
];

let passedTests = 0;
const totalTests = testCases.length;

console.log(`총 ${totalTests}개의 테스트 케이스를 실행합니다...\n`);

testCases.forEach((testCase, index) => {
  const result = ensureApiPath(testCase.input);
  const passed = result === testCase.expected;

  console.log(`테스트 ${index + 1}: ${testCase.description}`);
  console.log(`  입력: "${testCase.input}"`);
  console.log(`  기대값: "${testCase.expected}"`);
  console.log(`  실제값: "${result}"`);
  console.log(`  결과: ${passed ? '✅ 통과' : '❌ 실패'}\n`);

  if (passed) passedTests++;
});

console.log('='.repeat(50));
console.log(`테스트 결과: ${passedTests}/${totalTests} 통과`);
console.log(`성공률: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

if (passedTests === totalTests) {
  console.log('🎉 모든 테스트가 통과했습니다!');
} else {
  console.log('⚠️  일부 테스트가 실패했습니다.');
  process.exit(1);
}
