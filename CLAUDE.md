# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run build        # Compile TypeScript to dist/ and copy static assets (SVG icons)
npm run dev          # Development mode with watch
npm run lint         # Run ESLint via n8n-node CLI
npm run lint:fix     # Auto-fix lint issues
```

No test framework is configured. There are no test scripts or test files.

## Architecture

This is an **n8n community node package** (`n8n-nodes-reelscribe`) that wraps the reelscribe.app API. It follows the standard n8n community node pattern with two source files:

### Credentials (`credentials/ReelScribeApi.credentials.ts`)
- Defines API key (Bearer token, `rs_` prefix) and base URL (`https://www.reelscribe.app`)
- Authentication is applied automatically via `IAuthenticateGeneric` — the node never manually sets auth headers
- Credential test hits `GET /v1/credits`

### Node (`nodes/ReelScribe/ReelScribe.node.ts`)
- Single class `ReelScribe` with 4 operations: Transcribe, Get Transcription, List Transcriptions, Get Credits
- All HTTP requests use `this.helpers.httpRequestWithAuthentication('reelScribeApi', options)` — never raw fetch/axios
- The **Transcribe** operation has a built-in polling loop: it POSTs to `/v1/transcribe`, then polls `GET /v1/transcriptions?requestId=...` until a terminal status (`TERMINAL_STATUSES` constant) is reached. When `waitForCompletion` is false, it fires and forgets
- Operations that don't need custom handling (get, list, credits) build `method`/`url`/`body`/`qs` variables and fall through to a shared `httpRequestWithAuthentication` call at the bottom of the loop
- The Transcribe+poll path uses `continue` to skip the shared request code

### Registration
The `n8n` field in `package.json` registers both the compiled node and credential files. Class names and `name` fields are internal identifiers — only `displayName` is user-facing.

## API Endpoints

All under `{baseUrl}/v1/`:

| Method | Path | Operation |
|--------|------|-----------|
| POST | `/transcribe` | Submit video URL |
| GET | `/transcriptions` | Get/list transcriptions (by id, requestId, status, url) |
| GET | `/credits` | Check balance |

## Code Style

- Tabs for indentation (width 2), single quotes, trailing commas, semicolons
- `@typescript-eslint/no-explicit-any` is disabled
- Formatting follows `.prettierrc.js` and `.editorconfig`

## Publishing

```bash
npm version <patch|minor|major>
npm run build && npm publish
```

Package is published as `n8n-nodes-reelscribe` on npm. After version bump, commit and push to GitHub (`rara-cyber/n8n-nodes-reelscribe`).
