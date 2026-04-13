# n8n-nodes-reelscribe

[![npm version](https://img.shields.io/npm/v/n8n-nodes-reelscribe.svg)](https://www.npmjs.com/package/n8n-nodes-reelscribe)
[![npm downloads](https://img.shields.io/npm/dm/n8n-nodes-reelscribe.svg)](https://www.npmjs.com/package/n8n-nodes-reelscribe)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An [n8n](https://n8n.io/) community node that lets you **automatically transcribe Instagram Reels, TikTok videos, and YouTube content** using [ReelScribe](https://reelscribe.app).

Build powerful automation workflows — transcribe videos, generate captions, repurpose content, and more — all without writing any code.

## What Can You Do With This Node?

- **Auto-transcribe videos** from Instagram, TikTok, and YouTube with a single URL
- **Built-in polling** — the node waits for your transcription to finish (no complicated Wait loops needed)
- **Fire-and-forget mode** — submit videos and get notified via webhook when they're done
- **Batch process** a list of video URLs from Google Sheets or a database
- **Monitor credit usage** directly inside your n8n workflows

## Use Cases

Here are some real workflows you can build:

| Workflow | Description |
|----------|-------------|
| **Content repurposing** | Transcribe your videos, then send the text to ChatGPT to create blog posts, tweets, or newsletters |
| **Auto-captions pipeline** | Transcribe every new video you post and save captions to Google Docs or Notion |
| **Competitor analysis** | Batch transcribe competitor TikToks/Reels, then analyze messaging patterns with AI |
| **Accessibility compliance** | Automatically generate transcripts for WCAG compliance |
| **Knowledge base** | Transcribe YouTube tutorials and index them in your team wiki |
| **Social listening** | Transcribe trending videos in your niche and extract key topics |

## Operations

| Operation | Description |
|-----------|-------------|
| **Transcribe** | Submit a video URL for transcription (Instagram, TikTok, YouTube) with optional auto-polling |
| **Get Transcription** | Retrieve a transcription by ID or request ID |
| **List Transcriptions** | List all transcriptions with optional status/URL filters |
| **Get Credits** | Check your credit balance and subscription tier |

## Installation

### From the n8n UI (Recommended)

1. Go to **Settings > Community Nodes** in your n8n instance
2. Click **Install a community node**
3. Enter `n8n-nodes-reelscribe`
4. Click **Install**

### Via npm

```bash
npm install n8n-nodes-reelscribe
```

## Setup (3 Steps)

1. In n8n, go to **Credentials > New Credential**
2. Search for **ReelScribe API**
3. Enter your API key (starts with `rs_`) — generate one from your [ReelScribe dashboard](https://www.reelscribe.app/settings)

That's it! You're ready to start transcribing.

## Quick Start Example

**Transcribe a video and save to Google Sheets:**

```
Trigger → ReelScribe (Transcribe) → Google Sheets (Append Row)
```

1. Add a **ReelScribe** node to your workflow
2. Select **Transcribe** as the operation
3. Paste a video URL (Instagram, TikTok, or YouTube)
4. Turn on **Wait for Completion** — the node will automatically poll until the transcription is ready
5. Connect a Google Sheets node to save the result

**Batch transcribe from a spreadsheet:**

```
Google Sheets (Read Rows) → ReelScribe (Transcribe) → Google Sheets (Update Row)
```

Read a list of video URLs, transcribe each one, and write the transcription text back to the sheet.

## API Reference

This node wraps the [ReelScribe API v1](https://reelscribe.app/docs/api):

- `POST /v1/transcribe` — Submit transcription
- `GET /v1/transcriptions` — List/search transcriptions
- `GET /v1/credits` — Credit balance

## Links

- [ReelScribe Website](https://reelscribe.app)
- [API Documentation](https://reelscribe.app/docs/api)
- [Report a Bug](https://github.com/rara-cyber/n8n-nodes-reelscribe/issues)
- [npm Package](https://www.npmjs.com/package/n8n-nodes-reelscribe)

## Contributing

Found a bug or have a feature request? [Open an issue](https://github.com/rara-cyber/n8n-nodes-reelscribe/issues) on GitHub.

## License

[MIT](LICENSE)
