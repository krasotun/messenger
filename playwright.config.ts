import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/reset-mock-backend.ts',
  use: {
    baseURL: 'http://localhost:4300',
    trace: 'on-first-retry',
  },
  reporter: [['html']],

  // Эталон скриншота один и не зависит от платформы: снимки сравниваются с тем,
  // что рендерит linux, потому что арбитр - прогон `visual` в CI на ubuntu.
  // Платформа убрана из имени намеренно: пока она там была, рядом жили две
  // копии каждого снимка, и darwin-копия обновлялась локально, а linux-копия -
  // руками из artifact.
  snapshotPathTemplate: '{testDir}/{testFileDir}/{testFileName}-snapshots/{arg}{-projectName}{ext}',

  // Стенд поднимается процессами, а не контейнерами: мок-бэкенд и приложение,
  // собранное с e2e-конфигурацией. Прод раздается статикой на GitHub Pages,
  // поэтому проверять сборку за nginx незачем.
  webServer: [
    {
      command: 'npm run e2e:backend',
      url: 'http://localhost:3000/health',
      reuseExistingServer: true,
    },
    {
      command: 'npm run start:e2e',
      url: 'http://localhost:4300',
      reuseExistingServer: true,
    },
  ],

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
