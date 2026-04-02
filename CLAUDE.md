# gitcard — AI Development Guide

## Project Overview

**gitcard** is a CLI tool (`npx gitcard [repo-path]`) that generates a 1200×630 PNG/PDF/SVG "snapshot card" of any git repository. It collects repo metadata (languages, commits, stats) + optional GitHub API data, renders an HTML card via Handlebars, and screenshots it with Puppeteer.

## Architecture

```
CLI (src/cli.ts)
  └── Promise.allSettled([scanRepo, parsePackages, fetchGithub])
        └── normalize() → RepoSnapshot
              └── renderCard() → HTML string
                    └── takeScreenshot() → file on disk
```

## Key Files

| File | Purpose |
|------|---------|
| `src/cli.ts` | Commander entry point, orchestrates pipeline |
| `src/types.ts` | All TypeScript interfaces |
| `src/constants.ts` | VERSION, defaults |
| `src/collectors/repo-scanner.ts` | File tree, language breakdown, git log |
| `src/collectors/github-api.ts` | GitHub REST API via @octokit/rest |
| `src/collectors/package-parser.ts` | Parse package.json, Cargo.toml, etc. |
| `src/normalizer.ts` | Merge collector outputs → RepoSnapshot |
| `src/renderer.ts` | Handlebars compile → HTML string |
| `src/screenshot.ts` | Puppeteer HTML → PNG/PDF/SVG |
| `src/languages.ts` | Extension → language + color map |
| `templates/card.hbs` | Card HTML template |
| `templates/styles.css` | Card CSS (dark + light themes) |

## Commands

```bash
npm run build          # tsup → dist/
npm test               # vitest
npm run test:coverage  # vitest --coverage
npm run lint           # eslint src/ tests/
npm run format         # prettier --write
npm run dev            # tsx watch src/cli.ts
```

## Code Conventions

- **Imports**: Use named imports. No default exports except in entry files.
- **Error handling**: Collectors return `null` on failure (never throw). CLI catches top-level errors and calls `logger.error()` + `process.exit(1)`.
- **Async**: All I/O is async/await. No callbacks.
- **Types**: All data shapes defined in `src/types.ts`. No inline `any`.
- **Module rules**: `collectors/*` must not import from `renderer.ts` or `screenshot.ts`. `normalizer.ts` imports from `collectors/*` types only.

## Testing Requirements

- Unit tests for every collector, normalizer, and renderer
- Use `vi.mock()` for `simple-git` and `@octokit/rest` in unit tests
- Fixture files live in `tests/fixtures/`
- E2E test in `tests/cli.test.ts` runs the real CLI with `--no-github`
- Coverage threshold: 80% lines/functions/branches/statements

## Commit Format

Conventional commits enforced via commitlint:
- `feat:` new features
- `fix:` bug fixes
- `docs:` documentation only
- `test:` adding/fixing tests
- `chore:` tooling, deps, config
- `refactor:` code restructuring without behavior change
