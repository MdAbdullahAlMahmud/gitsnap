import { describe, it, expect, afterAll } from 'vitest';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import os from 'node:os';

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const CLI = path.join(ROOT, 'src/cli.ts');

const tmpOutput = path.join(os.tmpdir(), `gitcard-e2e-${Date.now()}`);

describe('CLI E2E', () => {
  afterAll(async () => {
    await fs.unlink(`${tmpOutput}.png`).catch(() => {});
  });

  it('generates a PNG when run on the gitcard repo with --no-github', async () => {
    const { stdout, stderr } = await execFileAsync(
      'node',
      ['--import', 'tsx/esm', CLI, ROOT, '--no-github', '--output', tmpOutput],
      { cwd: ROOT, timeout: 60_000 },
    );

    const combined = stdout + stderr;
    expect(combined).toMatch(/Saved to/i);

    const stat = await fs.stat(`${tmpOutput}.png`);
    expect(stat.size).toBeGreaterThan(5000);
  }, 90_000);
});
