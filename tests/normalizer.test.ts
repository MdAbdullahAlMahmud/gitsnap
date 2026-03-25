import { describe, it, expect } from 'vitest';
import { normalize } from '../src/normalizer.js';
import type { CollectorResults } from '../src/collectors/index.js';
import type { RepoScanResult } from '../src/types.js';

const baseScan: RepoScanResult = {
  totalFiles: 50,
  totalSizeBytes: 1024 * 1024,
  languages: [
    { language: 'TypeScript', color: '#3178c6', percentage: 80, fileCount: 40, bytes: 800000 },
    { language: 'CSS', color: '#563d7c', percentage: 20, fileCount: 10, bytes: 200000 },
  ],
  recentCommits: [
    { hash: 'abc1234', message: 'feat: add thing', author: 'Alice', date: '2026-01-01', relativeDate: '3 months ago' },
  ],
  totalCommits: 100,
  firstCommitDate: '2024-01-01T00:00:00Z',
  contributorCount: 5,
  defaultBranch: 'main',
  remoteUrl: 'https://github.com/alice/my-repo.git',
  weeklyActivity: [
    { weekStart: '2026-01-05', count: 3, level: 2 },
    { weekStart: '2026-01-12', count: 0, level: 0 },
  ],
};

const baseResults: CollectorResults = {
  scan: baseScan,
  packages: {
    name: 'my-app',
    version: '1.0.0',
    dependencyCount: 10,
    devDependencyCount: 5,
    packageManager: 'npm',
  },
  github: {
    stars: 500,
    forks: 50,
    openIssues: 10,
    topics: ['typescript', 'cli'],
    description: 'A great tool',
    license: 'MIT',
    owner: 'alice',
    repo: 'my-repo',
    avatarUrl: 'https://avatars.githubusercontent.com/u/1',
  },
};

describe('normalize', () => {
  it('produces a complete RepoSnapshot with all data', () => {
    const snapshot = normalize(baseResults, '/repo', 'dark');

    expect(snapshot.repoName).toBe('my-repo'); // GitHub name takes priority
    expect(snapshot.totalFiles).toBe(50);
    expect(snapshot.totalSizeFormatted).toBe('1.0 MB');
    expect(snapshot.primaryLanguage?.language).toBe('TypeScript');
    expect(snapshot.languages).toHaveLength(2);
    expect(snapshot.totalCommits).toBe(100);
    expect(snapshot.ageFormatted).toBeTruthy();
    expect(snapshot.contributorCount).toBe(5);
    expect(snapshot.packageName).toBe('my-app');
    expect(snapshot.packageVersion).toBe('1.0.0');
    expect(snapshot.dependencyCount).toBe(10);
    expect(snapshot.packageManager).toBe('npm');
    expect(snapshot.github?.stars).toBe(500);
    expect(snapshot.theme).toBe('dark');
    expect(snapshot.layout).toBe('default');
    expect(snapshot.weeklyActivity).toHaveLength(2);
    expect(snapshot.generatedAt).toBeTruthy();
  });

  it('passes terminal layout through', () => {
    const snapshot = normalize(baseResults, '/repo', 'dark', 'terminal');
    expect(snapshot.layout).toBe('terminal');
  });

  it('handles missing GitHub data', () => {
    const results = { ...baseResults, github: null };
    const snapshot = normalize(results, '/repo', 'light');

    expect(snapshot.github).toBeNull();
    expect(snapshot.repoName).toBe('my-app'); // falls back to package name
    expect(snapshot.theme).toBe('light');
  });

  it('handles missing package data', () => {
    const results = { ...baseResults, packages: null };
    const snapshot = normalize(results, '/repo/my-repo', 'dark');

    expect(snapshot.packageName).toBeNull();
    expect(snapshot.packageVersion).toBeNull();
    expect(snapshot.dependencyCount).toBe(0);
    expect(snapshot.packageManager).toBeNull();
    expect(snapshot.repoName).toBe('my-repo'); // GitHub name
  });

  it('falls back to directory name when both GitHub and package are missing', () => {
    const results = { ...baseResults, github: null, packages: null };
    const snapshot = normalize(results, '/projects/cool-tool', 'dark');

    expect(snapshot.repoName).toBe('cool-tool');
  });

  it('formats size correctly for small repos', () => {
    const results = {
      ...baseResults,
      scan: { ...baseScan, totalSizeBytes: 512 },
    };
    const snapshot = normalize(results, '/repo', 'dark');
    expect(snapshot.totalSizeFormatted).toBe('512 B');
  });
});
