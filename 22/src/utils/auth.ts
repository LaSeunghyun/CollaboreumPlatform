export type UserRole = 'fan' | 'artist' | 'admin';

export interface SignupData {
  email: string;
  password: string;
  name: string;
  userType: 'artist' | 'fan';
  agreeTerms: boolean;
  agreePrivacy: boolean;
  agreeMarketing: boolean;
}

export const mockLogin = (email: string, password: string): UserRole => {
  // Mock login logic - in real app, this would call an API
  if (email.includes('artist')) {
    return 'artist';
  } else if (email.includes('admin')) {
    return 'admin';
  } else {
    return 'fan';
  }
};

export const mockSocialLogin = (provider: string): UserRole => {
  // Mock social login - typically returns 'fan' by default
  return 'fan';
};

export const mockSignup = (data: SignupData): UserRole => {
  // Mock signup logic
  return data.userType;
};

export const mockSocialSignup = (provider: string, userType: string): UserRole => {
  // Mock social signup
  return userType as UserRole;
};