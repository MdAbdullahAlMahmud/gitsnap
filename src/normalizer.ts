import path from 'node:path';
import { formatBytes, formatAge } from './utils/format.js';
import type { CollectorResults } from './collectors/index.js';
import type { RepoSnapshot } from './types.js';

export function normalize(
  results: CollectorResults,
  repoPath: string,
  theme: 'dark' | 'light',
  layout: 'default' | 'terminal' = 'default',
): RepoSnapshot {
  const { scan, packages, github } = results;

  const repoName =
    github?.repo ??
    packages?.name ??
    path.basename(path.resolve(repoPath));

  return {
    // Scan data
    totalFiles: scan.totalFiles,
    totalSizeBytes: scan.totalSizeBytes,
    totalSizeFormatted: formatBytes(scan.totalSizeBytes),
    languages: scan.languages,
    primaryLanguage: scan.languages[0] ?? null,
    recentCommits: scan.recentCommits,
    totalCommits: scan.totalCommits,
    firstCommitDate: scan.firstCommitDate,
    ageFormatted: formatAge(scan.firstCommitDate),
    contributorCount: scan.contributorCount,
    defaultBranch: scan.defaultBranch,

    // Package data
    packageName: packages?.name ?? null,
    packageVersion: packages?.version ?? null,
    dependencyCount: packages?.dependencyCount ?? 0,
    devDependencyCount: packages?.devDependencyCount ?? 0,
    packageManager: packages?.packageManager ?? null,

    // GitHub data
    github: github ?? null,

    // Activity
    weeklyActivity: scan.weeklyActivity,

    // Derived
    repoName,
    generatedAt: new Date().toISOString(),
    theme,
    layout,
  };
}
