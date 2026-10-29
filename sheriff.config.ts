import { sameTag, SheriffConfig } from '@softarc/sheriff-core';

// Границы модулей по папкам (docs/adr/2026-10-28-page-part-stores-and-folder-boundaries.md).
export const config: SheriffConfig = {
  enableBarrelLess: true,
  modules: {
    'src/app/domains/<domain>/data': ['domain:<domain>', 'type:data'],
    'src/app/domains/<domain>/feature-<name>': ['domain:<domain>', 'type:feature'],
    'src/app/domains/<domain>/ui': ['domain:<domain>', 'type:ui'],
    'src/app/domains/<domain>/testing': ['domain:<domain>', 'type:testing'],
  },
  depRules: {
    // root - файлы вне модулей (app, core, pages), noTag - модули с index.ts
    // без тегов (shared, корни доменов).
    root: '*',
    noTag: '*',

    // Из users чатам открыт только data: Пользователь, поиск и Текущая сессия.
    'domain:chats': [
      sameTag,
      'noTag',
      'root',
      ({ toTags }) => toTags.includes('domain:users') && toTags.includes('type:data'),
    ],
    'domain:users': [sameTag, 'noTag', 'root'],

    'type:feature': ['type:data', 'type:ui', 'noTag', 'root'],
    'type:ui': ['type:data', 'noTag', 'root'],
    'type:data': ['noTag', 'root'],
    'type:testing': '*',
  },
};
