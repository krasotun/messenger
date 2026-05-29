/// <reference types="node" />
import { execFileSync } from 'node:child_process';

const imageName = 'messenger-frontend:local';
const containerName = 'messenger-frontend-local';
const containerUrl = 'http://localhost:8080';

function run(command: string, args: string[]): void {
  execFileSync(command, args, { stdio: 'inherit' });
}

function removeContainerIfExists(): void {
  try {
    execFileSync('docker', ['rm', '-f', containerName], { stdio: 'ignore' });
  } catch {
    // Container may not exist before the first run.
  }
}

async function waitForFrontend(): Promise<void> {
  for (let attempt = 0; attempt < 30; attempt++) {
    try {
      const response = await fetch(containerUrl);

      if (response.ok) {
        return;
      }
    } catch {
      // Frontend is not ready yet.
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(`Frontend container did not become ready at ${containerUrl}`);
}

export default async function globalSetup(): Promise<void> {
  run('docker', ['build', '-t', imageName, '.']);

  removeContainerIfExists();

  run('docker', ['run', '-d', '--name', containerName, '-p', '8080:80', imageName]);

  await waitForFrontend();
}
