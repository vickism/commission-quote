# Commission Quote

Commission quote application built with [Next.js](https://nextjs.org/) App Router,
[TypeScript](https://www.typescriptlang.org/) and [Mantine](https://mantine.dev/).

The project currently contains the starter UI and development tooling. The independent
mock commission vendor integration is planned.

## Getting started

Install dependencies with `npm ci`, then run `npm run dev` to start the development server.
Use the Node.js version specified in `.nvmrc`.

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

## CI and contributing

GitHub Actions runs `npm ci`, `npm run audit`, `npm test` and `npm run build` on pull requests,
pushes to `master`, and manual workflow runs. The workflow is named `CI` and its job ID
is `test_pull_request`. Branch protection is configured separately in GitHub.
The workflow is defined in [ci.yml](.github/workflows/ci.yml). `npm test` includes
Next.js type generation, formatting, Oxlint, Stylelint, TypeScript and Jest checks.
The audit uses the reviewed, expiring exceptions in `.nsprc` and fails on unaccepted findings.

Before opening a pull request, run `npm run audit`, `npm test` and `npm run build` locally and record
the results in the [pull request template](.github/pull_request_template.md).
Use the [bug report](.github/ISSUE_TEMPLATE/bug_report.yml) or
[feature request](.github/ISSUE_TEMPLATE/feature_request.yml) form for issues.
Remove secrets and personal financial data from reports, logs and screenshots.

## AI usage

AI assistance has been used to update project metadata, development tooling,
GitHub configuration, contribution templates and documentation. Changes are
reviewed and verified with the available project checks.
