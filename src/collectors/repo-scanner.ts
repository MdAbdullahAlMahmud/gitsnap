import path from 'node:path';
import fs from 'node:fs/promises';
import { createGit, getRemoteUrl, getDefaultBranch, getFirstCommitDate, getContributorCount } from '../utils/git.js';
import { getLanguageInfo } from '../languages.js';
import { formatRelativeDate } from '../utils/format.js';
import type { RepoScanResult, LanguageBreakdown, CommitInfo, WeeklyActivity } from '../types.js';
import { MAX_RECENT_COMMITS, MAX_LANGUAGES, ACTIVITY_WEEKS } from '../constants.js';

interface FileStat {
  ext: string;
  bytes: number;
}

async function getFileStats(repoPath: string): Promise<FileStat[]> {
  const git = createGit(repoPath);
  // Get tracked files
  const output = await git.raw(['ls-files']);
  const files = output.trim().split('\n').filter(Boolean);

  const stats: FileStat[] = [];
  await Promise.all(
    files.map(async (file) => {
      try {
        const fullPath = path.join(repoPath, file);
        const stat = await fs.stat(fullPath);
        const ext = path.extname(file).slice(1).toLowerCase();
        if (ext) {
          stats.push({ ext, bytes: stat.size });
        }
      } catch {
        // Skip files that can't be stat'd
      }
    }),
  );
  return stats;
}

function buildLanguageBreakdown(fileStats: FileStat[]): LanguageBreakdown[] {
  const langMap = new Map<string, { color: string; fileCount: number; bytes: number }>();

  for (const { ext, bytes } of fileStats) {
    const info = getLanguageInfo(ext);
    if (!info) continue;
    const existing = langMap.get(info.name);
    if (existing) {
      existing.fileCount++;
      existing.bytes += bytes;
    } else {
      langMap.set(info.name, { color: info.color, fileCount: 1, bytes });
    }
  }

  const totalBytes = [...langMap.values()].reduce((sum, v) => sum + v.bytes, 0);
  if (totalBytes === 0) return [];

  return [...langMap.entries()]
    .map(([language, { color, fileCount, bytes }]) => ({
      language,
      color,
      fileCount,
      bytes,
      percentage: Math.round((bytes / totalBytes) * 100 * 10) / 10,
    }))
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, MAX_LANGUAGES);
}

async function getRecentCommits(repoPath: string): Promise<{ commits: CommitInfo[]; total: number }> {
  try {
    const git = createGit(repoPath);
    const log = await git.log({ maxCount: MAX_RECENT_COMMITS });
    const commits: CommitInfo[] = log.all.map((c) => ({
      hash: c.hash.slice(0, 7),
      message: c.message.split('\n')[0].slice(0, 72),
      author: c.author_name,
      date: c.date,
      relativeDate: formatRelativeDate(c.date),
    }));

    // Get total count
    const countOutput = await git.raw(['rev-list', '--count', 'HEAD']);
    const total = parseInt(countOutput.trim(), 10) || 0;

    return { commits, total };
  } catch {
    return { commits: [], total: 0 };
  }
}

/** Returns Monday of the week containing `date` as an ISO date string */
function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getUTCDay(); // 0=Sun
  d.setUTCDate(d.getUTCDate() - ((day + 6) % 7)); // shift to Monday
  return d.toISOString().slice(0, 10);
}

async function getWeeklyActivity(repoPath: string): Promise<WeeklyActivity[]> {
  try {
    const git = createGit(repoPath);
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - ACTIVITY_WEEKS * 7);

    const output = await git.raw([
      'log',
      '--format=%aI',
      `--since=${since.toISOString()}`,
      'HEAD',
    ]);
    const dates = output.trim().split('\n').filter(Boolean);

    // Build week → count map
    const countMap = new Map<string, number>();

    // Pre-fill all weeks with 0 so empty weeks appear in the chart
    for (let w = 0; w < ACTIVITY_WEEKS; w++) {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - w * 7);
      countMap.set(getWeekStart(d), 0);
    }

    for (const d of dates) {
      const key = getWeekStart(new Date(d));
      countMap.set(key, (countMap.get(key) ?? 0) + 1);
    }

    const max = Math.max(...countMap.values(), 1);
    const weeks: WeeklyActivity[] = [...countMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b)) // oldest first
      .map(([weekStart, count]) => ({
        weekStart,
        count,
        level: (count === 0 ? 0
          : count <= max * 0.25 ? 1
          : count <= max * 0.5  ? 2
          : count <= max * 0.75 ? 3
          : 4) as WeeklyActivity['level'],
      }));

    return weeks;
  } catch {
    return [];
  }
}

export async function scanRepo(repoPath: string): Promise<RepoScanResult> {
  const [fileStats, remoteUrl, defaultBranch, firstCommitDate, contributorCount, commitData, weeklyActivity] =
    await Promise.all([
      getFileStats(repoPath),
      getRemoteUrl(repoPath),
      getDefaultBranch(repoPath),
      getFirstCommitDate(repoPath),
      getContributorCount(repoPath),
      getRecentCommits(repoPath),
      getWeeklyActivity(repoPath),
    ]);

  const languages = buildLanguageBreakdown(fileStats);
  const totalFiles = fileStats.length;
  const totalSizeBytes = fileStats.reduce((sum, f) => sum + f.bytes, 0);

  return {
    totalFiles,
    totalSizeBytes,
    languages,
    recentCommits: commitData.commits,
    totalCommits: commitData.total,
    firstCommitDate,
    contributorCount,
    defaultBranch,
    remoteUrl,
    weeklyActivity,
  };
}
