import React from 'react';
import { Helmet } from 'react-helmet-async';

const META_DEFINITIONS = [
  {
    name: 'description',
    content:
      '독립 아티스트와 팬이 함께 프로젝트를 만들고 성장하는 콜라보리움. 인기 아티스트, 펀딩 프로젝트, 커뮤니티 소식을 한눈에 확인하세요.',
  },
  {
    property: 'og:title',
    content: '콜라보리움 - 크리에이터와 팬이 함께 성장하는 플랫폼',
  },
  {
    property: 'og:description',
    content:
      '투명한 펀딩 시스템과 커뮤니티를 통해 아티스트와 팬이 함께 만드는 새로운 생태계를 경험해보세요.',
  },
  {
    property: 'og:type',
    content: 'website',
  },
  {
    property: 'og:url',
    content: 'https://collaboreum.com/',
  },
];

export const HomePageMeta: React.FC = () => {
  return (
    <Helmet prioritizeSeoTags>
      <title>콜라보리움 - 아티스트와 팬이 함께 만드는 크리에이티브 생태계</title>
      {META_DEFINITIONS.map(definition => {
        if ('name' in definition) {
          return <meta key={definition.name} name={definition.name} content={definition.content} />;
        }

        return <meta key={definition.property} property={definition.property} content={definition.content} />;
      })}
    </Helmet>
  );
};
