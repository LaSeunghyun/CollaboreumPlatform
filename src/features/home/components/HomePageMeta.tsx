import React, { useEffect } from 'react';

const META_DEFINITIONS = [
  {
    type: 'name' as const,
    key: 'description',
    content:
      '독립 아티스트와 팬이 함께 프로젝트를 만들고 성장하는 콜라보리움. 인기 아티스트, 펀딩 프로젝트, 커뮤니티 소식을 한눈에 확인하세요.',
  },
  {
    type: 'property' as const,
    key: 'og:title',
    content: '콜라보리움 - 크리에이터와 팬이 함께 성장하는 플랫폼',
  },
  {
    type: 'property' as const,
    key: 'og:description',
    content:
      '투명한 펀딩 시스템과 커뮤니티를 통해 아티스트와 팬이 함께 만드는 새로운 생태계를 경험해보세요.',
  },
  {
    type: 'property' as const,
    key: 'og:type',
    content: 'website',
  },
  {
    type: 'property' as const,
    key: 'og:url',
    content: 'https://collaboreum.com/',
  },
];

export const HomePageMeta: React.FC = () => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title =
      '콜라보리움 - 아티스트와 팬이 함께 만드는 크리에이티브 생태계';

    const appliedMeta = META_DEFINITIONS.map(definition => {
      const selector = `meta[${definition.type}="${definition.key}"]`;
      const existing = document.head.querySelector(
        selector,
      ) as HTMLMetaElement | null;

      if (existing) {
        const previousContent = existing.getAttribute('content');
        existing.setAttribute('content', definition.content);
        return { element: existing, previousContent, created: false };
      }

      const element = document.createElement('meta');
      element.setAttribute(definition.type, definition.key);
      element.setAttribute('content', definition.content);
      document.head.appendChild(element);
      return { element, previousContent: null, created: true };
    });

    return () => {
      document.title = previousTitle;
      appliedMeta.forEach(meta => {
        if (meta.created) {
          meta.element.remove();
          return;
        }

        if (
          meta.previousContent !== null &&
          meta.previousContent !== undefined
        ) {
          meta.element.setAttribute('content', meta.previousContent);
        }
      });
    };
  }, []);

  return null;
};
