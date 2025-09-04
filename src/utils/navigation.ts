export const SPECIAL_PAGES = [
  'home', 'dashboard', 'mypage', 'community-full',
  'artist-profile', 'gallery', 'admin', 'login', 'signup',
  'about', 'events'
] as const;

export const isSpecialPage = (section: string): boolean => {
  return SPECIAL_PAGES.includes(section as any);
};

export const scrollToSection = (section: string): void => {
  if (!isSpecialPage(section)) {
    setTimeout(() => {
      const element = document.getElementById(section);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }
};