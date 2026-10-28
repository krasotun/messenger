import { sameTag, SheriffConfig } from '@softarc/sheriff-core';

// Границы модулей по папкам (docs/adr/2026-10-28-page-part-stores-and-folder-boundaries.md).
// Пилот - только chats; identity-access пока держится правилами по суффиксам в eslint.config.js.
export const config: SheriffConfig = {
  enableBarrelLess: true,
  modules: {
    'src/app/domains/chats/data': ['domain:chats', 'type:data'],
    'src/app/domains/chats/feature-<name>': ['domain:chats', 'type:feature'],
    'src/app/domains/chats/ui': ['domain:chats', 'type:ui'],
    'src/app/domains/chats/testing': ['domain:chats', 'type:testing'],
  },
  depRules: {
    // root - файлы вне модулей (app, core, pages), noTag - модули с index.ts
    // без тегов (shared, identity-access, корень chats).
    root: '*',
    noTag: '*',

    'domain:chats': [sameTag, 'noTag', 'root'],

    'type:feature': ['type:data', 'type:ui', 'noTag', 'root'],
    'type:ui': ['type:data', 'noTag', 'root'],
    'type:data': ['noTag', 'root'],
    'type:testing': '*',
  },
};
