const DEFAULT_SORT_OPTIONS = {
  project: [
    { value: 'popular', label: '인기순' },
    { value: 'latest', label: '최신순' },
    { value: 'deadline', label: '마감임박' },
    { value: 'progress', label: '달성률' },
  ],
  funding: [
    { value: 'popular', label: '인기순' },
    { value: 'latest', label: '최신순' },
    { value: 'amount', label: '모금액순' },
    { value: 'backers', label: '후원자순' },
  ],
  community: [
    { value: 'popular', label: '인기순' },
    { value: 'latest', label: '최신순' },
    { value: 'comments', label: '댓글순' },
  ],
};

const resolveSortOptions = type => {
  if (!type) {
    return DEFAULT_SORT_OPTIONS.project;
  }

  const normalized = type.toLowerCase();
  return (
    DEFAULT_SORT_OPTIONS[normalized] ||
    DEFAULT_SORT_OPTIONS.project
  );
};

module.exports = {
  DEFAULT_SORT_OPTIONS,
  resolveSortOptions,
};
