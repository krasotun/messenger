// @ts-check

/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Скоуп необязателен, но если указан - только из этого списка.
    'scope-enum': [
      2,
      'always',
      ['identity', 'shared-ui', 'core', 'deployment', 'infra', 'process'],
    ],
  },
};
