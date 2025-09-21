function createNoopRule(name) {
  return {
    meta: {
      type: 'suggestion',
      docs: {
        description: `Stub implementation for react/${name}.`,
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
    'display-name': createNoopRule('display-name'),
    'prop-types': createNoopRule('prop-types'),
    'react-in-jsx-scope': createNoopRule('react-in-jsx-scope'),
  },
};
