import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { scanRepo } from '../../src/collectors/repo-scanner.js';

const exec = promisify(execFile);

let fixtureRepo: string;

beforeAll(async () => {
  // Create a small git repo with known files for testing
  fixtureRepo = path.join(os.tmpdir(), `gitcard-fixture-${Date.now()}`);
  await fs.mkdir(fixtureRepo, { recursive: true });
  await exec('git', ['init'], { cwd: fixtureRepo });
  await exec('git', ['config', 'user.email', 'test@test.com'], { cwd: fixtureRepo });
  await exec('git', ['config', 'user.name', 'Test'], { cwd: fixtureRepo });

  // Write some files
  await fs.writeFile(path.join(fixtureRepo, 'index.ts'), 'const x: number = 1;');
  await fs.writeFile(path.join(fixtureRepo, 'style.css'), 'body { margin: 0; }');
  await fs.writeFile(path.join(fixtureRepo, 'README.md'), '# Test');

  await exec('git', ['add', '.'], { cwd: fixtureRepo });
  await exec('git', ['commit', '-m', 'feat: initial commit'], { cwd: fixtureRepo });
  await exec('git', ['commit', '--allow-empty', '-m', 'chore: second commit'], {
    cwd: fixtureRepo,
  });
});

afterAll(async () => {
  await fs.rm(fixtureRepo, { recursive: true, force: true });
});

describe('scanRepo', () => {
  it('scans a real git repo and returns expected shape', async () => {
    const result = await scanRepo(fixtureRepo);

    expect(result.totalFiles).toBeGreaterThan(0);
    expect(result.totalSizeBytes).toBeGreaterThan(0);
    expect(result.defaultBranch).toBeTruthy();
    expect(Array.isArray(result.languages)).toBe(true);
    expect(Array.isArray(result.recentCommits)).toBe(true);
    expect(result.totalCommits).toBeGreaterThan(0);
    expect(result.contributorCount).toBeGreaterThan(0);
  });

  it('detects TypeScript and CSS languages', async () => {
    const result = await scanRepo(fixtureRepo);
    const names = result.languages.map((l) => l.language);
    expect(names).toContain('TypeScript');
    expect(names).toContain('CSS');
  });

  it('languages have required fields', async () => {
    const result = await scanRepo(fixtureRepo);
    for (const lang of result.languages) {
      expect(lang.language).toBeTruthy();
      expect(lang.color).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(lang.percentage).toBeGreaterThan(0);
      expect(lang.percentage).toBeLessThanOrEqual(100);
      expect(lang.fileCount).toBeGreaterThan(0);
    }
  });

  it('recent commits have expected shape', async () => {
    const result = await scanRepo(fixtureRepo);
    expect(result.recentCommits.length).toBeGreaterThan(0);
    const commit = result.recentCommits[0];
    expect(commit.hash).toHaveLength(7);
    expect(commit.message).toBeTruthy();
    expect(commit.relativeDate).toBeTruthy();
  });
});
