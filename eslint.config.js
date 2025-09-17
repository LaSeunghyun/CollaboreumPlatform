// eslint-disable-next-line @typescript-eslint/no-require-imports
const js = require('@eslint/js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const tseslint = require('@typescript-eslint/eslint-plugin');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const tsparser = require('@typescript-eslint/parser');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const react = require('eslint-plugin-react');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const reactHooks = require('eslint-plugin-react-hooks');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const importPlugin = require('eslint-plugin-import');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const sonarjs = require('eslint-plugin-sonarjs');

module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        Blob: 'readonly',
        CustomEvent: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        prompt: 'readonly',
        File: 'readonly',
        // DOM types
        HTMLElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLButtonElement: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLParagraphElement: 'readonly',
        HTMLHeadingElement: 'readonly',
        HTMLTableElement: 'readonly',
        HTMLTableSectionElement: 'readonly',
        HTMLTableRowElement: 'readonly',
        HTMLTableCellElement: 'readonly',
        HTMLTableCaptionElement: 'readonly',
        HTMLTextAreaElement: 'readonly',
        NodeListOf: 'readonly',
        Node: 'readonly',
        KeyboardEvent: 'readonly',
        MouseEvent: 'readonly',
        // Node.js globals
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        global: 'readonly',
        NodeJS: 'readonly',
        // Console
        console: 'readonly',
        // Jest globals
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'react': react,
      'react-hooks': reactHooks,
      'import': importPlugin,
      'sonarjs': sonarjs
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...sonarjs.configs.recommended.rules,
      'no-constant-condition': 'error',
      'no-undef': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_', 
        varsIgnorePattern: '^_' 
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      'sonarjs/cognitive-complexity': ['warn', 20],
      'complexity': ['warn', 15],
      'import/no-unresolved': 'off', // TypeScript가 처리
      'import/no-extraneous-dependencies': 'error',
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/display-name': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error'
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  },
  {
    files: ['**/*.test.*', '**/*.spec.*', '**/__tests__/**/*'],
    rules: { 
      'no-undef': 'off',
      '@typescript-eslint/no-explicit-any': 'off'
    }
  },
  {
    files: ['**/*.js'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off'
    }
  },
  {
    ignores: [
      'node_modules/',
      'build/',
      'dist/',
      'coverage/',
      '*.min.js',
      'server/node_modules/',
      'server/build/',
      'server/dist/'
    ]
  }
];
