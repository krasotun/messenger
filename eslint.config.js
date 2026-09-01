// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const prettierPlugin = require('eslint-plugin-prettier');
const importPlugin = require('eslint-plugin-import');

module.exports = defineConfig([
  {
    ignores: ['dist/**'],
  },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    plugins: {
      prettier: prettierPlugin,
      import: importPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
        node: {
          extensions: ['.js', '.mjs', '.cjs', '.ts', '.mts', '.cts', '.d.ts'],
        },
      },
    },
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'no-underscore-dangle': 'off',
      curly: ['error', 'all'],
      eqeqeq: ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-const-assign': 'error',
      'no-alert': 'error',
      'no-duplicate-imports': 'error',
      'no-param-reassign': ['error', { props: true }],
      'no-use-before-define': 'off',
      '@typescript-eslint/no-use-before-define': 'error',
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'error',
      'object-shorthand': ['error', 'always'],
      'prefer-template': 'error',
      'prettier/prettier': 'error',
      'import/no-unresolved': 'error',
      'import/no-duplicates': 'error',
      'import/order': [
        'error',
        {
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },
  {
    files: ['src/app/app*.ts', 'src/app/core/**/*.ts', 'src/app/pages/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@domains/*/application/*',
                '@domains/*/infrastructure/*',
                '@domains/*/presentation/*',
              ],
              message: 'Use the domain public API for static imports.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/app/shared/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@core/*', '@domains/*'],
              message: 'Shared code must not depend on app, core, or domains.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/app/domains/*/application/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@angular/forms',
              message: 'Application must not know about Angular forms.',
            },
            {
              name: '@angular/platform-browser',
              message: 'Application must not know about the DOM.',
            },
          ],
          patterns: [
            {
              group: ['@angular/cdk', '@angular/cdk/*'],
              message: 'Application must not know about Overlay and other CDK primitives.',
            },
            {
              group: ['@shared/ui/*'],
              message: 'Application must not know about UI primitives such as ModalRef.',
            },
            {
              group: ['**/infrastructure/*', '@domains/*/infrastructure/*'],
              message: 'Application reaches the outside world through a gateway token only.',
            },
            {
              group: ['**/presentation/*', '@domains/*/presentation/*'],
              message: 'Application must not depend on presentation.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/app/domains/*/presentation/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/infrastructure/*', '@domains/*/infrastructure/*'],
              message: 'Presentation reaches infrastructure through application only.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {},
  },
]);
