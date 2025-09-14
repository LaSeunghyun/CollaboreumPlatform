// 타입 가드 유틸리티 함수들

export const isString = (value: any): value is string => {
  return typeof value === 'string';
};

export const isObject = (value: any): value is object => {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
};

export const isArray = (value: any): value is any[] => {
  return Array.isArray(value);
};

export const hasProperty = <T extends object, K extends PropertyKey>(
  obj: T,
  prop: K
): obj is T & Record<K, unknown> => {
  return prop in obj;
};

// 사용자 객체 타입 가드
export const isUserObject = (value: any): value is { username: string; id: string; role?: string; avatar?: string } => {
  return isObject(value) && 
         hasProperty(value, 'username') && 
         isString(value.username) &&
         hasProperty(value, 'id') && 
         isString(value.id);
};

// 게시글 작성자 타입 가드
export const isPostAuthor = (value: any): value is { username: string; id: string; role?: string; avatar?: string } => {
  return isUserObject(value);
};

// 댓글 작성자 타입 가드
export const isCommentAuthor = (value: any): value is { username: string; id: string; role?: string; avatar?: string } => {
  return isUserObject(value);
};

// API 응답 타입 가드
export const isApiResponse = (value: any): value is { data: any; success?: boolean; message?: string } => {
  return isObject(value) && hasProperty(value, 'data');
};

// 안전한 문자열 첫 글자 추출
export const getFirstChar = (value: any, fallback: string = 'A'): string => {
  if (isString(value) && value.length > 0) {
    return value.charAt(0).toUpperCase();
  }
  if (isObject(value) && hasProperty(value, 'username') && isString(value.username) && value.username.length > 0) {
    return value.username.charAt(0).toUpperCase();
  }
  return fallback;
};

// 안전한 사용자명 추출
export const getUsername = (value: any, fallback: string = 'Unknown'): string => {
  if (isString(value)) {
    return value;
  }
  if (isObject(value) && hasProperty(value, 'username') && isString(value.username)) {
    return value.username;
  }
  return fallback;
};

// 안전한 아바타 URL 추출
export const getAvatarUrl = (value: any): string | undefined => {
  if (isObject(value) && hasProperty(value, 'avatar') && isString(value.avatar)) {
    return value.avatar;
  }
  return undefined;
};
