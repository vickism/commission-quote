# Commission Quote

Next.js App Router, TypeScript and Mantine application.
Integrates with an independent mock commission vendor over HTTP.

## Project guidance

- Follow existing project conventions and use npm.
- Use package.json as the source of truth for available commands.
- Consult relevant ADRs when changing architectural decisions.
- Keep the application and mock vendor independently runnable.
- Keep the vendor API key server-side; never expose or log secrets.
- Reuse Mantine components rather than building basic UI controls.
- Use installed Mantine skills when relevant.
- Do not introduce unnecessary infrastructure or dependencies.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Engineering boundaries

- Keep commission calculation in the mock vendor.
- Validate input and external API responses at their boundaries.
- Handle vendor failures and timeouts explicitly.
- Keep random vendor failures controllable in automated tests.
- Do not assume undocumented commission calculation rules.
- Preserve unrelated code and user changes.


## Verification

- Run relevant tests and checks for the code being changed.
- Before declaring a feature complete, verify its acceptance criteria.
- Report checks actually run and any unresolved failures.
- For complex tasks, continue through implementation and verification
  rather than stopping after creating a scaffold.


## Implementation
- Keep business logic independently testable.
- Follow established project conventions rather than introducing new ones.

## UI
- Always Handle loading, saving, success, empty and error states.
- Prevent unintended duplicate submissions.
- Keep the interface responsive and visually consistent.
- Avoid custom styling when existing Mantine capabilities suffice.

## Security and Resilience

- Validate all external input at the server boundary.
- Validate responses received from the vendor.
- Keep secrets in server-only environment configuration.
- Never commit secrets or log API keys.
- Return safe, consistent error responses.
- Handle network failures, vendor errors and timeouts explicitly.
- Do not automatically retry quote creation without idempotency guarantees.
- Make simulated failures deterministic and controllable in tests.
- Log useful operational context without exposing sensitive information.

## Testing and Verification

- Test observable behaviour rather than implementation details.
- Prioritise commission calculations, validation, API authentication, successful integration, failures and timeouts.
- Include UI tests for essential user interactions.

## Working Approach

For non-trivial changes:
1. Understand the requested outcome and relevant existing code.
2. Identify the smallest implementation that satisfies the requirement.
3. Implement the complete change, including appropriate tests.
4. Run relevant verification and resolve failures.
5. Review the diff for correctness, security and unnecessary complexity.

Do not stop at scaffolding when the requested task includes working functionality. Continue through verification unless blocked.

Ask for clarification only when a material decision cannot be safely inferred from the requirements or existing code. Never make assumptions. 

## Completion

Before reporting completion:
- Check the implementation against the requested acceptance criteria.
- Review the changed files and ensure unrelated code was not modified.
- Identify remaining edge cases or known limitations.
- Do an adversarial review of the diff for correctness, security and unnecessary complexity.
- Update README documentation when setup or behaviour changes.
- Keep the README's AI usage disclosure accurate.

Report concisely:
- What changed And why.
- What was verified and the results.
- Any remaining issues or decisions requiring attention.



## Common gotchas
- Adding too many inline comments. Default to no comments unless the code is non-obvious or requires context. Use doc comments for public APIs.
