/// <reference types="node" />
import { execFileSync } from 'node:child_process';

const containerName = 'messenger-frontend-local';

export default function globalTeardown(): void {
  try {
    execFileSync('docker', ['rm', '-f', containerName], { stdio: 'ignore' });
  } catch {
    // Container may already be removed.
  }
}
