# Contributing to WarishLabs

Thank you for interest in contributing to WarishLabs! This document details the standards and guidelines for development on this repository.

## Project Overview
WarishLabs is an engineering-first software showcase and laboratory platform built with Next.js 16, TypeScript, React 19, and Prisma.

## Prerequisites
- Node.js 22.x or higher
- npm 10.x or higher
- PostgreSQL (running locally or Neon database connection)

## Installation
1. Clone the repository and navigate to the root directory.
2. Install dependencies:
   ```bash
   npm install
   ```

## Environment Setup
Create a `.env` file in the root using the template in `.env.example`:
- Configure your PostgreSQL connection under `DATABASE_URL` (URL-encode special characters in the password, e.g. use `%40` instead of `@`).
- Set Clerk auth keys and optional credentials.

Apply migrations and seed initial data:
```bash
npx prisma migrate dev
npx tsx prisma/seed.ts
```

## Local Development
Start the local development server:
```bash
npm run dev
```

---

## Development Guidelines

### Branch Naming Conventions
Always work on a separate branch. Work should not be committed directly to `main`. Use one of the following branch naming prefixes:
- `feature/*` — for new features and components
- `hotfix/*` — for urgent production bug fixes
- `docs/*` — for documentation updates
- `chore/*` — for dependencies, configs, or CI adjustments

### Conventional Commits
Commit messages must follow the Conventional Commits specification:
- `feat:` — Introduces a new feature
- `fix:` — Patches a bug
- `docs:` — Documentation adjustments only
- `refactor:` — Code changes that neither fix a bug nor add a feature
- `test:` — Adds or modifies test cases
- `ci:` — Changes to CI configuration workflows (e.g. GitHub Actions, CodeQL)
- `build:` — Build system changes or dependencies
- `perf:` — Code changes that improve performance
- `chore:` — Miscellaneous repository tasks (e.g. .gitignore, Dependabot)

---

## Pull Request Workflow
1. Create a branch matching the conventions.
2. Implement your changes following coding standards.
3. Validate and test locally before pushing.
4. Open a Pull Request targeting the `main` branch.

### Coding Standards
- Maintain strict TypeScript type safety; do not use `any` unless absolutely necessary.
- Follow ESLint rules. Do not disable or weaken existing rule sets.

### Testing Before Pushing
Run the local verification checks in order to make sure the CI pipeline will pass:
```bash
npm run lint         # Check for code quality issues
npm run typecheck    # Validate TypeScript compilations
npm run test         # Run test suites
npm run build        # Validate production build bundle
npm run ci:test      # Execute all verification tests sequentially
```
Do not push code with failing checks.
