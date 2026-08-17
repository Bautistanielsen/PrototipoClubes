# Repository Guidelines

## Project Structure & Module Organization

This repository is a React 18 and TypeScript single-page prototype built with Vite. Application code lives in `src/`. Route-level views are organized under `src/screens/`, reusable UI under `src/components/`, and dialogs under `src/components/modals/`. Shared state and actions belong in `src/state/AppContext.tsx`; domain types, seeded demo data, and calculation or formatting helpers live in `src/types.ts`, `src/data/`, and `src/lib/`. Global styles are in `src/index.css`. Keep generated output in `dist/` and dependencies in `node_modules/`; neither should be committed.

## Build, Test, and Development Commands

- `npm install` installs the locked dependencies from `package-lock.json`.
- `npm run dev` starts the Vite development server with hot reload.
- `npm run build` runs strict TypeScript checks and creates a production bundle in `dist/`.
- `npm run preview` serves the production bundle locally for final verification.

There is currently no automated test or lint script. Treat `npm run build` as the minimum required validation for every change.

## Coding Style & Naming Conventions

Use TypeScript and functional React components. Follow the existing two-space indentation, single quotes, semicolons, and trailing commas in multiline objects and JSX props. Name components and screen files in PascalCase (`ReservaModal.tsx`), functions and variables in camelCase, and constants in uppercase snake case (`PRECIO_TURNO`). Prefer explicit domain types from `src/types.ts`, type-only imports where applicable, and small reusable helpers over duplicated calculations. TypeScript is configured with `strict`, unused-code checks, and fallthrough protection; resolve errors rather than suppressing them.

## Testing Guidelines

No test framework or coverage threshold is configured yet. For UI changes, exercise desktop and mobile layouts through `npm run dev`, including navigation, overlays, and state updates. If adding tests, colocate them as `*.test.ts` or `*.test.tsx` near the code and add the corresponding documented `npm test` script.

## Commit & Pull Request Guidelines

The current history uses a Conventional Commit-style subject (`feat: initial commit of club management prototype`). Continue with concise, imperative subjects such as `fix: correct monthly balance` or `feat: add member filters`. Pull requests should explain the user-visible change, identify affected screens, list verification performed, and link related issues. Include before/after screenshots for visual changes and note any new dependencies or configuration requirements.
