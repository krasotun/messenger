/// <reference types="node" />
import { execFileSync } from 'node:child_process';

const composeFile = 'docker-compose.e2e.yml';
const frontendUrl = 'http://localhost:8080';
const backendHealthUrl = 'http://localhost:3000/health';

function run(command: string, args: string[]): void {
  execFileSync(command, args, { stdio: 'inherit', timeout: 300_000 });
}

async function waitForUrl(url: string, label: string): Promise<void> {
  for (let attempt = 0; attempt < 30; attempt++) {
    try {
      const response = await fetch(url);

      if (response.ok) {
        return;
      }
    } catch {
      // Frontend is not ready yet.
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(`${label} did not become ready at ${url}`);
}

async function resetMockBackend(): Promise<void> {
  const response = await fetch('http://localhost:3000/test/reset', { method: 'POST' });

  if (!response.ok) {
    throw new Error(`Mock auth backend reset failed with status ${response.status}`);
  }
}

export default async function globalSetup(): Promise<void> {
  run('docker', ['compose', '-f', composeFile, 'up', '--build', '-d']);

  await waitForUrl(frontendUrl, 'Frontend container');
  await waitForUrl(backendHealthUrl, 'Mock auth backend container');
  await resetMockBackend();
}
