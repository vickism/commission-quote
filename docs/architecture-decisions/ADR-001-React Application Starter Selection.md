# ADR-001: React Application Starter Selection

- **Status:** Accepted
- **Owner:** Vick Tahil
- **Deciders:** Vick Tahil
- **Date created:** 16 November 2026
- **Date decided:** 16 November 2026
- **Date updated:** 16 November 2026

## Context

The Commission Quote coding challenge requires a React web application that collects loan details, securely communicates with an independent mock vendor API, and displays the resulting commission quote.

The application must handle validation, loading states, successful responses, and failures.

The implementation has a target timebox of approximately four hours. The resulting codebase will also be extended during a live pair-programming interview.

A suitable React starter should reduce initial development effort by providing an established application structure, reusable UI components, development tooling, and AI coding-agent configuration.

The evaluation must consider the **actual contents and capabilities of the starter project**, rather than features available through the underlying framework but requiring substantial additional setup.

This ADR addresses selection of the React application starter only. Backend technology, logging libraries, testing-library selection, and commission-calculation rules are separate decisions.

## Requirements

The selected starter should provide:

1. **React and TypeScript:** A modern, strongly typed application foundation.
2. **Ready-to-use UI components:** An integrated component library providing accessible controls including inputs, selects, buttons, cards, alerts, loading indicators, and responsive layouts.
3. **LLM/AI development guidance:** Ready-to-use project or framework instructions for coding agents, including Claude Code, without having to author the initial configuration manually.
4. **Reusable AI skills:** Bundled or officially maintained skills that can be used immediately or installed through a documented command.
5. **Server-side integration:** A secure means of communicating with external APIs without exposing credentials in browser code.
6. **Form workflows:** A straightforward approach to form state, validation, submission, loading, and error handling.
7. **Automated testing support:** Preferably an existing test runner, test setup, and example tests.
8. **Code quality tooling:** Preconfigured type checking, linting, and formatting.
9. **Project conventions:** A clear, documented application structure.
10. **Minimal unnecessary functionality:** Avoid authentication, databases, billing, and other features unrelated to the challenge.
11. **Extensibility:** Support incremental changes without substantial restructuring.
12. **Maintenance and documentation:** Prefer official starter projects maintained by established framework or component-library teams, with current dependencies, documentation, and clear upgrade paths.

## Principles

- Prefer official, actively maintained starters over community boilerplates with uncertain long-term maintenance.
- Favour functionality available out of the box over functionality requiring additional configuration.
- Distinguish bundled functionality from separately installable tools.
- Prefer established UI libraries rather than creating common components.
- Use framework-specific AI guidance maintained by framework or component-library authors where possible.
- Avoid unnecessary application infrastructure.
- Balance development speed against codebase complexity.
- Keep the implementation understandable for subsequent live coding.

## Options

### Option 1: Standard Next.js Starter

**Source:** https://nextjs.org/docs/app/getting-started/installation

The official `create-next-app` starter provides React, TypeScript, App Router, Tailwind CSS, ESLint, and integrated server-side capabilities.

**AI Support**

Current Next.js tooling supports project-level `AGENTS.md` and `CLAUDE.md` guidance directing coding agents to version-matched framework documentation.

Next.js also publishes optional agent skills for development and runtime verification.

**Pros**

- Official, maintained full-stack application foundation.
- Minimal initial configuration.
- Server-side Route Handlers.
- Framework-specific AI guidance.
- Official AI skills available separately.
- Established documentation and ecosystem.

**Cons**

- Does not include a ready-to-use component library.
- Testing is not configured by the standard starter.
- Additional AI skills may require installation.
- Some framework capabilities are unnecessary for this challenge.

### Option 2: Official Next.js + Mantine Template

**Source:** https://github.com/mantinedev/next-app-template

The official Mantine template combines Next.js App Router with an established UI component library.

**Starter Capabilities**

- Next.js, React and TypeScript.
- Mantine core components and hooks.
- Mantine theme configuration.
- Jest and React Testing Library.
- Storybook.
- Linting, formatting and type-checking scripts.
- GitHub workflow configuration.

**AI Support**

The template does not bundle its own `CLAUDE.md`, `AGENTS.md`, or agent skills.

Its Next.js framework provides AI documentation guidance, while Mantine separately provides official AI resources:

- LLM-readable component documentation.
- Mantine MCP server.
- `mantine-form` skill.
- `mantine-combobox` skill.
- `mantine-custom-components` skill.

Mantine skills can be installed using documented tooling rather than authored manually.

**Pros**

- Official starter maintained by the Mantine project.
- Full-stack application foundation.
- Complete, ready-to-use component library.
- Testing and code-quality tooling already configured.
- Next.js AI development guidance.
- Official Mantine-specific AI skills available.
- No separate application backend required.
- Relatively little unnecessary application functionality.

**Cons**

- Mantine skills require an additional installation step.
- Some development tooling may be unnecessary.
- Application-specific AI instructions still need to reflect the final architecture.

### Option 3: React Router Framework Mode

**Source:** https://github.com/remix-run/react-router-templates

The official React Router starter provides server-side rendering, TypeScript, routing, data loading, mutations, and development/build tooling.

**AI Support**

The React Router source repository contains AI contributor guidance, but this should not be confused with project-level instructions generated into an application.

The documented default starter does not include a comprehensive set of project-specific agent skills.

**Pros**

- Official full-stack React framework.
- Form and data-handling APIs suit the challenge.
- Established routing conventions.
- No separate application backend required.
- Maintained by the React Router team.

**Cons**

- No comprehensive component library in the default template.
- AI skills and project-level guidance require additional setup.
- Additional testing configuration may be necessary.

### Option 4: TanStack Start

**Source:** https://tanstack.com/cli/latest/docs/cli-reference

TanStack Start provides full-stack React with type-safe routing and server functions.

**AI Support**

The TanStack CLI supports agent-friendly project generation and documentation discovery.

Its `--intent` option supports local agent skill mappings using TanStack Intent.

This is a documented CLI capability rather than evidence that every generated application includes a complete set of bundled skills.

**Pros**

- Officially maintained full-stack React framework.
- Strong TypeScript support.
- Integrated server-side operations.
- Agent-oriented tooling.
- Configurable starter generation.

**Cons**

- A complete UI component library is not part of the basic starter.
- UI integration requires additional configuration.
- Generated application capabilities depend on selected CLI options.
- Some framework conventions introduce additional complexity.

### Option 5: Official Vite + Mantine Template

**Source:** https://github.com/mantinedev/vite-template

The official Mantine Vite template provides a conventional client-side React application with Mantine and preconfigured development tooling.

**Starter Capabilities**

- React and TypeScript.
- Mantine components and hooks.
- Vite development tooling.
- Vitest and React Testing Library.
- Storybook.
- Code-quality and formatting tools.
- GitHub workflow configuration.

**AI Support**

The template does not bundle project-level agent instructions or skills.

Official Mantine MCP tools, LLM-readable documentation, and installable Mantine skills are available independently.

**Pros**

- Official Mantine starter.
- Ready-to-use UI component library.
- Testing infrastructure included.
- Conventional React architecture.
- Strong initial development tooling.
- Official component-library AI skills available.

**Cons**

- Requires a separate backend for secure vendor communication.
- AI instructions and skills require additional setup.
- More application components must be configured and started.

## Considerations

### Verified Starter Comparison

| Starter | UI components | AI instructions | Agent skills | Server-side API | Tests configured |
|---|---|---|---|---|---|
| Standard Next.js | No | Framework-generated | Official, separate install | Yes | No |
| Next.js + Mantine | Yes | Next.js guidance | Mantine, separate install | Yes | Yes |
| React Router default | No | Not bundled in default template | Not bundled | Yes | Additional setup |
| TanStack Start | Not by default | CLI-supported | Intent-supported | Yes | CLI-option-dependent |
| Vite + Mantine | Yes | Not bundled | Mantine, separate install | No | Yes |

The comparison distinguishes bundled AI configuration from framework-generated instructions and separately installable official skills.

### Component Library Readiness

Mantine provides ready-to-import packaged components for common form controls, layouts, feedback messages, and loading states.

The preferred starter should avoid creating common controls from scratch.

### AI Configuration Readiness

Three levels of AI development support are relevant:

1. **Bundled instructions and skills:** Present in the generated or cloned application.
2. **Framework-generated instructions:** Automatically created by framework tooling.
3. **Official installable skills:** Available through maintained documentation and installation commands.

All three can reduce configuration effort, but they should not be treated as equivalent.

### Full-Stack Support

Full-stack starters allow the application to communicate securely with an independent vendor API without requiring a separate application backend.

Client-only starters require an additional server, increasing setup, integration, and testing work.

### Maintenance Risk

Starter maintenance is an important selection criterion.

Preference should be given to:

- Official starter repositories.
- Frameworks with established release and maintenance practices.
- Actively maintained dependencies.
- Documented upgrade paths.
- Maintained component libraries and AI tooling.

Community boilerplates with uncertain maintenance, substantial custom infrastructure, or complex dependency stacks are excluded from this evaluation.

### Unnecessary Complexity

A starter should not introduce authentication, billing, database infrastructure, or substantial application functionality unrelated to the challenge.

Additional dependencies increase the amount of code that must be understood and maintained, particularly during the live coding interview.

### Testing and Code Quality

Preconfigured tests, linting, formatting and type checking reduce setup effort.

However, the specific testing and logging libraries will be evaluated independently rather than selected implicitly through this ADR.

## Preferred Option

**Option 2: Official Next.js + Mantine Template — provisional recommendation.**

This provides the best balance of the requirements:

- An officially maintained full-stack application foundation.
- A comprehensive, ready-to-use component library.
- Existing testing and code-quality tooling.
- Framework-generated Next.js AI guidance.
- Official Mantine AI skills available through documented installation.
- Relatively little unnecessary application functionality.
- No requirement for a separate application backend.

The primary limitation is that Mantine's skills are not included in the template and require installation.

This is considered an acceptable trade-off because the skills are officially maintained and the installation process is documented.

**Option 1: Standard Next.js** is the fallback if component-library flexibility becomes more important than initial setup convenience.

**Option 5: Vite + Mantine** is the alternative if a separate application backend is preferred.

## Selected Option
Option 2: Official Next.js + Mantine Template

## Next Steps

1. Confirm the selected official starter and version.
2. Initialise the application using the selected starter.
3. Verify the UI components needed for the quote form and results display.
4. Confirm framework-generated AI instructions are available to the chosen coding assistant.
5. Install relevant official Mantine skills using the documented procedure.
6. Confirm the included test, lint, type-check and build commands.
7. Record the accepted selection and decision date.
8. Evaluate remaining technical decisions separately.

## References

- [Next.js installation](https://nextjs.org/docs/app/getting-started/installation)
- [Next.js AI coding-agent support](https://nextjs.org/docs/app/guides/ai-agents)
- [Mantine Next.js official starter](https://github.com/mantinedev/next-app-template)
- [Mantine AI tools and skills](https://mantine.dev/guides/llms/)
- [Mantine skills repository](https://github.com/mantinedev/skills)
- [React Router official starter templates](https://github.com/remix-run/react-router-templates)
- [TanStack CLI reference](https://tanstack.com/cli/latest/docs/cli-reference)
- [Mantine Vite official starter](https://github.com/mantinedev/vite-template)