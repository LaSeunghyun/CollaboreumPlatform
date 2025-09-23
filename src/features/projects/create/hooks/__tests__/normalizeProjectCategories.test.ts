import {
  FALLBACK_PROJECT_CATEGORIES,
  PROJECT_CATEGORY_LABELS,
  normalizeProjectCategories,
} from '../useProjectCategories';

describe('normalizeProjectCategories', () => {
  it('normalizes enum maps into select options', () => {
    const result = normalizeProjectCategories({
      MUSIC: '음악',
      VIDEO: '비디오',
      GAME: '게임',
    });

    expect(result).toStrictEqual([
      { id: 'MUSIC', value: 'MUSIC', label: '음악' },
      { id: 'VIDEO', value: 'VIDEO', label: '비디오' },
      { id: 'GAME', value: 'GAME', label: '게임' },
    ]);
  });

  it('derives category keys from nested API responses', () => {
    const result = normalizeProjectCategories({
      data: [
        { id: 'PERFORMANCE', label: '공연' },
        { label: '도서' },
        { code: 'OTHER' },
      ],
    });

    expect(result).toEqual(
      expect.arrayContaining([
        { id: 'PERFORMANCE', value: 'PERFORMANCE', label: '공연' },
        { id: 'BOOK', value: 'BOOK', label: '도서' },
        { id: 'OTHER', value: 'OTHER', label: '기타' },
      ]),
    );
  });

  it('falls back to default labels when only keys are provided', () => {
    const result = normalizeProjectCategories(['music', 'OTHER']);

    expect(result).toEqual(
      expect.arrayContaining([
        { id: 'MUSIC', value: 'MUSIC', label: PROJECT_CATEGORY_LABELS.MUSIC },
        { id: 'OTHER', value: 'OTHER', label: PROJECT_CATEGORY_LABELS.OTHER },
      ]),
    );
  });

  it('returns an empty array when no valid categories exist', () => {
    expect(normalizeProjectCategories([null, undefined, 123])).toHaveLength(0);
  });

  it('exposes fallback categories in enum order for placeholders', () => {
    expect(FALLBACK_PROJECT_CATEGORIES).toStrictEqual([
      { id: 'MUSIC', value: 'MUSIC', label: '음악' },
      { id: 'VIDEO', value: 'VIDEO', label: '비디오' },
      { id: 'PERFORMANCE', value: 'PERFORMANCE', label: '공연' },
      { id: 'BOOK', value: 'BOOK', label: '도서' },
      { id: 'GAME', value: 'GAME', label: '게임' },
      { id: 'OTHER', value: 'OTHER', label: '기타' },
    ]);
  });
});
