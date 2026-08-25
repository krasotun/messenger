import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/reset-mock-backend.ts',
  use: {
    baseURL: 'http://localhost:4300',
    trace: 'on-first-retry',
  },
  reporter: [['html']],

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
