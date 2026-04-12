# n8n-nodes-reelscribe

This is an [n8n](https://n8n.io/) community node for [ReelScribe](https://reelscribe.app) — the video transcription platform for Instagram Reels, TikTok videos, and YouTube content.

## Features

| Operation | Description |
|-----------|-------------|
| **Transcribe** | Submit a video URL for transcription (Instagram, TikTok, YouTube) |
| **Get Transcription** | Retrieve a transcription by ID or request ID |
| **List Transcriptions** | List all transcriptions with optional status/URL filters |
| **Get Credits** | Check your credit balance and subscription tier |
| **Get Settings** | View current account settings |
| **Update Settings** | Toggle auto-prune storage and other preferences |

## Prerequisites

- An [n8n](https://n8n.io/) instance (self-hosted or cloud)
- A [ReelScribe](https://reelscribe.app) account with an API key

## Installation

### Community Nodes (Recommended)

1. Go to **Settings > Community Nodes** in your n8n instance
2. Click **Install a community node**
3. Enter `n8n-nodes-reelscribe`
4. Click **Install**

### Manual Installation

```bash
npm install n8n-nodes-reelscribe
```

## Setup

1. In n8n, go to **Credentials > New Credential**
2. Search for **ReelScribe API**
3. Enter your API key (starts with `rs_`) — generate one from your [ReelScribe dashboard](https://www.reelscribe.app/settings)
4. Click **Save**

## Usage Examples

### Transcribe a Video

1. Add a **ReelScribe** node to your workflow
2. Select **Transcribe** as the operation
3. Paste the video URL
4. Optionally set a **Resume URL** to receive a webhook callback when complete
5. Execute — returns a `requestId` to track the transcription

### Poll for Completion

Chain a **Wait** node after transcription, then use **Get Transcription** with the `requestId` to check status:

```
ReelScribe (Transcribe) → Wait (30s) → ReelScribe (Get Transcription)
```

### List Completed Transcriptions

Use **List Transcriptions** with the `status` filter set to `completed` to fetch all finished transcriptions.

## API Reference

This node wraps the [ReelScribe API v1](https://reelscribe.app/docs/api):

- `POST /v1/transcribe` — Submit transcription
- `GET /v1/transcriptions` — List/search transcriptions
- `GET /v1/credits` — Credit balance
- `GET /v1/settings` — Account settings
- `PATCH /v1/settings` — Update settings

## License

[MIT](LICENSE)
