import { describe, it, expect } from 'vitest';
import { renderCard } from '../src/renderer.js';
import type { RepoSnapshot } from '../src/types.js';

const snapshot: RepoSnapshot = {
  repoName: 'test-repo',
  totalFiles: 42,
  totalSizeBytes: 1_500_000,
  totalSizeFormatted: '1.4 MB',
  languages: [
    { language: 'TypeScript', color: '#3178c6', percentage: 75, fileCount: 30, bytes: 1_000_000 },
    { language: 'CSS', color: '#563d7c', percentage: 25, fileCount: 12, bytes: 500_000 },
  ],
  primaryLanguage: { language: 'TypeScript', color: '#3178c6', percentage: 75, fileCount: 30, bytes: 1_000_000 },
  recentCommits: [
    { hash: 'abc1234', message: 'feat: add thing', author: 'Alice', date: '2026-01-01', relativeDate: '3 months ago' },
  ],
  totalCommits: 200,
  firstCommitDate: '2024-01-01T00:00:00Z',
  ageFormatted: '2 years ago',
  contributorCount: 3,
  defaultBranch: 'main',
  packageName: 'test-repo',
  packageVersion: '1.2.3',
  dependencyCount: 15,
  devDependencyCount: 5,
  packageManager: 'npm',
  github: {
    stars: 1234,
    forks: 56,
    openIssues: 7,
    topics: ['typescript', 'cli'],
    description: 'A test repository',
    license: 'MIT',
    owner: 'alice',
    repo: 'test-repo',
    avatarUrl: null,
  },
  weeklyActivity: [
    { weekStart: '2026-01-05', count: 5, level: 3 },
    { weekStart: '2026-01-12', count: 0, level: 0 },
    { weekStart: '2026-01-19', count: 2, level: 1 },
  ],
  generatedAt: '2026-03-25T00:00:00Z',
  theme: 'dark',
  layout: 'default',
};

describe('renderCard', () => {
  it('returns an HTML string', async () => {
    const html = await renderCard(snapshot);
    expect(typeof html).toBe('string');
    expect(html).toContain('<!DOCTYPE html>');
  });

  it('includes repo name', async () => {
    const html = await renderCard(snapshot);
    expect(html).toContain('test-repo');
  });

  it('includes language names', async () => {
    const html = await renderCard(snapshot);
    expect(html).toContain('TypeScript');
    expect(html).toContain('CSS');
  });

  it('includes GitHub stats', async () => {
    const html = await renderCard(snapshot);
    expect(html).toContain('1.2k'); // formatted stars
    expect(html).toContain('topics');
  });

  it('includes version badge', async () => {
    const html = await renderCard(snapshot);
    expect(html).toContain('v1.2.3');
  });

  it('hides GitHub block when github is null', async () => {
    const noGithub = { ...snapshot, github: null };
    const html = await renderCard(noGithub);
    // The GitHub stats section (stars/forks) should not be rendered
    expect(html).not.toContain('class="gh-stats"');
  });

  it('uses light theme class', async () => {
    const light = { ...snapshot, theme: 'light' as const };
    const html = await renderCard(light);
    expect(html).toContain('class="light"');
  });

  it('includes sparkline bars', async () => {
    const html = await renderCard(snapshot);
    expect(html).toContain('spark-bar');
    expect(html).toContain('level-3');
  });

  it('renders terminal layout with window chrome', async () => {
    const terminal = { ...snapshot, layout: 'terminal' as const };
    const html = await renderCard(terminal);
    expect(html).toContain('class="window"');
    expect(html).toContain('dot-red');
    expect(html).toContain('statusbar');
    expect(html).toContain('git log');
  });

  it('includes commit hash and message', async () => {
    const html = await renderCard(snapshot);
    expect(html).toContain('abc1234');
    expect(html).toContain('feat: add thing');
  });
});
