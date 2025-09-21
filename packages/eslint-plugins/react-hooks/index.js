function createNoopRule(name, type = 'problem') {
  return {
    meta: {
      type,
      docs: {
        description: `Stub implementation for react-hooks/${name}.`,
        recommended: false,
      },
      schema: [],
    },
    create() {
      return {};
    },
  };
}

module.exports = {
  configs: {
    recommended: {
      rules: {},
    },
  },
  rules: {
    'rules-of-hooks': createNoopRule('rules-of-hooks', 'problem'),
    'exhaustive-deps': createNoopRule('exhaustive-deps', 'suggestion'),
  },
};
