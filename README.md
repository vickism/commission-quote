# Commission Quote

Commission quote application built with [Next.js](https://nextjs.org/) App Router,
[TypeScript](https://www.typescriptlang.org/) and [Mantine](https://mantine.dev/).

The project currently contains the starter UI and development tooling. The independent
mock commission vendor integration is planned.

## Getting started

Install dependencies with `npm ci`, then run `npm run dev` to start the development server.

## Features

The project includes the following development tools:

- [PostCSS](https://postcss.org/) with [mantine-postcss-preset](https://mantine.dev/styles/postcss-preset)
- [TypeScript](https://www.typescriptlang.org/)
- [Storybook](https://storybook.js.org/)
- [Jest](https://jestjs.io/) setup with [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- Oxlint setup for TypeScript and React sources

## npm scripts

### Build and dev scripts

- `dev` – start dev server
- `build` – bundle application for production
- `analyze` – analyzes application bundle with [@next/bundle-analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)

### Testing scripts

- `typecheck` – checks TypeScript types
- `lint` – runs oxlint and stylelint
- `format:test` – checks files with oxfmt
- `jest` – runs jest tests
- `jest:watch` – starts jest watch
- `test` – generates Next.js types, then runs formatting, lint, TypeScript and Jest checks

### Other scripts

- `storybook` – starts storybook dev server
- `storybook:build` – build production storybook bundle to `storybook-static`
- `format:write` – formats all files with oxfmt

## AI usage

AI assistance has been used to update project metadata and documentation. Changes are
reviewed and verified with the available project checks.
