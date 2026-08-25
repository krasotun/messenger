/// <reference types="node" />

// Мок-бэкенд держит пользователей в памяти и переиспользуется между прогонами
// (reuseExistingServer), поэтому состояние сбрасывается перед каждым запуском.
const resetUrl = 'http://localhost:3000/test/reset';

export default async function globalSetup(): Promise<void> {
  const response = await fetch(resetUrl, { method: 'POST' });

  if (!response.ok) {
    throw new Error(`Mock auth backend reset failed with status ${response.status}`);
  }
}
