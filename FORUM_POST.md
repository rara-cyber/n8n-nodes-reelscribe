# READY-TO-POST: n8n Community Forum Showcase

**Where to post:** https://community.n8n.io → Category: "Share your workflow" or "Built with n8n"

---

**Title:** Auto-Transcribe Instagram Reels, TikTok & YouTube Videos — New Community Node

**Body:**

Hey everyone! :wave:

I built a community node that connects n8n to [ReelScribe](https://reelscribe.app) for automatic video transcription. Wanted to share it in case it's useful for your workflows.

## What it does

The **ReelScribe** node lets you transcribe videos from Instagram, TikTok, and YouTube — just give it a URL and it handles the rest.

**Key features:**
- **Built-in polling** — the node automatically waits until transcription is done (no need for complicated Wait node loops)
- **Fire-and-forget mode** — submit a video and get a webhook callback when it's ready
- **Batch processing** — transcribe a whole list of URLs from a spreadsheet
- **Credit monitoring** — check your balance right inside n8n

## Install

Search **"reelscribe"** in Community Nodes, or:

```
npm install n8n-nodes-reelscribe
```

## Example workflows

Here are some ideas for what you can build:

**1. Transcribe videos → Save to Google Sheets**
```
Google Sheets (Read URLs) → ReelScribe (Transcribe) → Google Sheets (Write Results)
```
Grab a list of video URLs, transcribe each one, write the text back to your sheet.

**2. Video → Transcription → AI Summary**
```
ReelScribe (Transcribe) → OpenAI (Summarize) → Notion (Save)
```
Transcribe a video, have GPT summarize it, then save the summary to Notion.

**3. Auto-transcribe new content**
```
RSS Trigger → ReelScribe (Transcribe) → Slack (Notify)
```
When a new video is detected, auto-transcribe it and notify your team on Slack.

**4. Competitor analysis**
```
Google Sheets (Competitor URLs) → ReelScribe (Transcribe) → OpenAI (Analyze) → Email
```
Batch transcribe competitor videos, analyze their messaging with AI, get a report via email.

## Links

- **npm:** https://www.npmjs.com/package/n8n-nodes-reelscribe
- **GitHub:** https://github.com/rara-cyber/n8n-nodes-reelscribe
- **API docs:** https://reelscribe.app/docs/api

Would love to hear what workflows you'd build with this! Happy to answer any questions. :slightly_smiling_face:

---

## NOTES FOR YOU (delete before posting):
- The emojis above use Discourse shortcodes (:wave: and :slightly_smiling_face:) which work on the n8n forum
- If you have screenshots of the node in the n8n editor, add them — posts with images get way more engagement
- After posting, check back in a day or two to reply to any comments — engagement helps your post stay visible
- Consider also posting a shorter version in the n8n Discord #showcase channel
