const DEFAULT_LANGUAGE_OPTIONS = {
  ecmaVersion: 2021,
  sourceType: 'module'
};

function loadBaseRecommended() {
  try {
    const base = require('eslint/conf/eslint-recommended');
    if (base && typeof base === 'object') {
      if (base.rules) {
        return { rules: { ...base.rules } };
      }
      return { ...base };
    }
  } catch (error) {
    // eslint:recommended is optional; fall back to an empty rule set when the
    // local eslint package does not expose the legacy configuration helper.
  }
  return { rules: {} };
}

const baseRecommended = loadBaseRecommended();

module.exports = {
  configs: {
    /**
     * Mirrors the behaviour of `eslint:recommended` for flat config setups.
     * The language options intentionally align with the defaults we use across
     * the project so consuming configs can extend and override them.
     */
    recommended: {
      name: 'eslint:recommended',
      languageOptions: { ...DEFAULT_LANGUAGE_OPTIONS },
      linterOptions: {
        reportUnusedDisableDirectives: true
      },
      rules: {
        ...baseRecommended.rules
      }
    }
  }
};
