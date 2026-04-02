# Contributing to gitcard

Thank you for your interest in contributing!

## Setup

```bash
git clone https://github.com/MdAbdullahAlMahmud/gitcard
cd gitcard
npm install
```

## Development

```bash
npm run dev        # Run CLI in watch mode
npm run build      # Build for production
npm test           # Run tests
npm run lint       # Lint code
npm run format     # Format code
```

## Commit Messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/). Examples:

- `feat: add light theme support`
- `fix: handle repos with no commits`
- `docs: update README with examples`
- `test: add normalizer edge case tests`
- `chore: bump puppeteer to v22`

## Creating a Changeset

When your PR includes a user-facing change, add a changeset:

```bash
npx changeset
```

Follow the prompts to describe the change. This drives CHANGELOG generation and versioning.

## Pull Requests

1. Fork and create a branch: `git checkout -b feat/my-feature`
2. Make your changes with tests
3. Add a changeset if applicable
4. Ensure `npm run lint && npm test && npm run build` all pass
5. Open a PR — fill in the template

## Code Style

- TypeScript strict mode
- Prettier for formatting (run `npm run format`)
- ESLint for linting (run `npm run lint`)
- 80%+ test coverage required
