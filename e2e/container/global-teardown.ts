/// <reference types="node" />
import { execFileSync } from 'node:child_process';

const composeFile = 'docker-compose.e2e.yml';

export default function globalTeardown(): void {
  try {
    execFileSync('docker', ['compose', '-f', composeFile, 'down'], { stdio: 'ignore' });
  } catch {
    // Compose services may already be stopped.
  }
}
