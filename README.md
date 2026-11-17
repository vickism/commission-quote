# Commission Quote

Generate commission quotes from loan details using Next.js, TypeScript and Mantine.
An independent Mockoon API calculates the commission.

## Run locally

Use Node.js 26.13.1.

1. Run `npm ci`.
2. Copy [.env.example](.env.example) to `.env.local` in the project root. Set
   `COMMISSION_VENDOR_API_KEY` to match the `api-key` response rule in
   [the mock definition](mocks/commission-vendor.json). Leave the default vendor URL.
3. Run `npm run dev` to start the app (port 3000) and mock vendor (port 4001),
   then open http://localhost:3000. Press Ctrl+C to stop both.

To run them separately, use `npm run dev:app` and `npm run mock:vendor`.

The vendor key is read only on the server and must never use the `NEXT_PUBLIC_` prefix.

To run the production build locally, run `npm run build`, then `npm start`.
Keep the vendor running in its own terminal.

For a new Git worktree, run `.\setup-worktree.ps1` (Windows) or
`bash setup-worktree.sh` (Bash) from its directory.

## Verify

```sh
npm test
npm run build
npm run audit
```

`npm test` checks formatting, lint, types and automated tests. Tests simulate vendor
responses and timeouts, so the mock does not need to be running. These checks also run
in [CI](.github/workflows/ci.yml); reviewed audit exceptions are in [.nsprc](.nsprc).

For a manual check, generate a quote for each risk band, submit invalid input, and
check that editing clears the previous result. Stop/restart your local vendor to
verify failure and recovery.

## Behavior and limitations

- The mock intentionally returns occasional 503 errors randomly. Its calculation rules are
  illustrative and currently do not use the loan term.
- There are no automatic retries; a timed-out request may already have generated a quote.
- Quotes are not stored.

The browser calls a Next.js POST endpoint, which validates input and calls a server-only
vendor adapter.

## Before production

- Add staff authentication and authorization; the application endpoint is currently public.
- Confirm the real vendor contract, currency, precision and lending limits; use managed credentials and HTTPS.
- Agree on idempotency, quote history, audit and retention requirements.
- Configure rate limits, runtime deadlines, monitoring and restricted operational logs.

## AI usage

AI assisted planning, implementation, tests, documentation and project tooling.
Changes were reviewed and verified with automated checks and browser testing.
