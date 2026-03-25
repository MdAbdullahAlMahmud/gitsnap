export interface CLIOptions {
  repoPath: string;
  format: 'png' | 'pdf' | 'svg';
  output: string;
  theme: 'dark' | 'light';
  layout: 'default' | 'terminal';
  noGithub: boolean;
  open: boolean;
  width: number;
  height: number;
  token?: string;
}

export interface WeeklyActivity {
  /** ISO week start date (Monday) */
  weekStart: string;
  count: number;
  /** 0–4 intensity level for rendering */
  level: 0 | 1 | 2 | 3 | 4;
}

export interface CommitInfo {
  hash: string;
  message: string;
  author: string;
  date: string;
  relativeDate: string;
}

export interface LanguageBreakdown {
  language: string;
  color: string;
  percentage: number;
  fileCount: number;
  bytes: number;
}

export interface RepoScanResult {
  totalFiles: number;
  totalSizeBytes: number;
  languages: LanguageBreakdown[];
  recentCommits: CommitInfo[];
  totalCommits: number;
  firstCommitDate: string | null;
  contributorCount: number;
  defaultBranch: string;
  remoteUrl: string | null;
  weeklyActivity: WeeklyActivity[];
}

export interface GithubData {
  stars: number;
  forks: number;
  openIssues: number;
  topics: string[];
  description: string | null;
  license: string | null;
  owner: string;
  repo: string;
  avatarUrl: string | null;
}

export interface PackageData {
  name: string | null;
  version: string | null;
  dependencyCount: number;
  devDependencyCount: number;
  packageManager: string;
}

export interface RepoSnapshot {
  // From scan
  totalFiles: number;
  totalSizeBytes: number;
  totalSizeFormatted: string;
  languages: LanguageBreakdown[];
  primaryLanguage: LanguageBreakdown | null;
  recentCommits: CommitInfo[];
  totalCommits: number;
  firstCommitDate: string | null;
  ageFormatted: string | null;
  contributorCount: number;
  defaultBranch: string;

  // From package
  packageName: string | null;
  packageVersion: string | null;
  dependencyCount: number;
  devDependencyCount: number;
  packageManager: string | null;

  // From GitHub (optional)
  github: GithubData | null;

  // Activity
  weeklyActivity: WeeklyActivity[];

  // Derived
  repoName: string;
  generatedAt: string;
  theme: 'dark' | 'light';
  layout: 'default' | 'terminal';
}
