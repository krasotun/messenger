// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const prettierPlugin = require('eslint-plugin-prettier');
const importPlugin = require('eslint-plugin-import');
const sheriff = require('@softarc/eslint-plugin-sheriff');

const applicationRestrictedPaths = [
  {
    name: '@angular/forms',
    message: 'Application must not know about Angular forms.',
  },
  {
    name: '@angular/platform-browser',
    message: 'Application must not know about the DOM.',
  },
];

const applicationRestrictedPatterns = [
  {
    group: ['@angular/cdk', '@angular/cdk/*'],
    message: 'Application must not know about Overlay and other CDK primitives.',
  },
  {
    group: ['@shared/ui/*'],
    message: 'Application must not know about UI primitives such as ModalRef.',
  },
  {
    group: ['@shared/forms/*'],
    message: 'Application must not know about Angular forms.',
  },
];

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
      'no-restricted-syntax': [
        'error',
        {
          // Комментарии узлом литерала не являются, поэтому под селектор не
          // попадают: объяснения для разработчика остаются русскими.
          selector: 'Literal[value=/[\\p{Script=Cyrillic}]/u]',
          message: 'User-facing text must be written in English.',
        },
        {
          selector: 'TemplateElement[value.raw=/[\\p{Script=Cyrillic}]/u]',
          message: 'User-facing text must be written in English.',
        },
      ],
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
    // Отдельное правило, а не шаблон в no-restricted-imports: блоки ниже
    // перезаписывают его для своих файлов и покрывают не все каталоги.
    files: ['src/**/*.ts'],
    ignores: ['src/**/*.spec.ts', 'src/**/testing/**'],
    rules: {
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src',
              from: './src/**/testing/**',
              message: 'Test doubles and fixtures are for specs only.',
            },
          ],
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
              group: ['@domains/*/*', '!@domains/*/testing'],
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
    // data - слой application: не знает про DOM, Overlay, ModalRef и формы.
    // Импорты между data, feature-* и ui проверяет Sheriff (sheriff.config.ts).
    files: ['src/app/domains/*/data/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: applicationRestrictedPaths,
          patterns: applicationRestrictedPatterns,
        },
      ],
    },
  },
  {
    files: ['src/**/*.ts'],
    ignores: ['src/**/*.spec.ts', 'src/**/testing/**'],
    extends: [sheriff.configs.all],
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Text[value=/[\\p{Script=Cyrillic}]/u]',
          message: 'User-facing text must be written in English.',
        },
        {
          // У BoundText в `value` лежит разобранное выражение, а исходный
          // текст узла вместе с интерполяцией - в `value.source`.
          selector: 'BoundText[value.source=/[\\p{Script=Cyrillic}]/u]',
          message: 'User-facing text must be written in English.',
        },
        {
          selector: 'TextAttribute[value=/[\\p{Script=Cyrillic}]/u]',
          message: 'User-facing text must be written in English.',
        },
      ],
    },
  },
]);
