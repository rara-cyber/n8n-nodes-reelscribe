# Marketing Plan: n8n-nodes-reelscribe

## What This Is

A free marketing plan to get more backlinks and visibility for ReelScribe by promoting our n8n community node across different channels and target audiences.

---

## Target Audiences

Before diving into channels, here are the 4 types of people we want to reach:

| Audience | Who They Are | What They Care About |
|----------|-------------|---------------------|
| **Content Creators** | YouTubers, TikTokers, Instagrammers | Saving time on captions/subtitles, repurposing content |
| **Marketing Teams** | Social media managers, content marketers | Automating video-to-text workflows at scale |
| **Automation Builders** | n8n power users, no-code enthusiasts | Cool new nodes, workflow ideas, time savings |
| **Developers** | People building tools/integrations | API quality, reliability, open-source community |

---

## Channel-by-Channel Strategy

### 1. n8n Community Forum (community.n8n.io) — TOP PRIORITY

**Why:** 30,000+ members who are already looking for useful nodes. This is your most targeted audience.

**What to do:**

**Post 1: Showcase Post (post in "Share your workflow" or "Built with n8n")**

> **Title:** Automatically Transcribe Instagram Reels, TikTok & YouTube Videos with ReelScribe
>
> Hey everyone! I built a community node that connects n8n to ReelScribe for automatic video transcription.
>
> **What it does:**
> - Transcribe videos from Instagram, TikTok, and YouTube — just paste a URL
> - Built-in polling so it waits for the transcription to finish (or fire-and-forget mode)
> - List and filter your transcriptions by status
> - Check your credit balance right from n8n
>
> **Install:** Search "reelscribe" in Community Nodes, or `npm install n8n-nodes-reelscribe`
>
> **Example use cases:**
> - Auto-transcribe every video you post → send transcript to Google Docs
> - Monitor competitor TikToks → transcribe → analyze with AI
> - Batch transcribe a list of YouTube URLs from a Google Sheet
>
> **Links:**
> - npm: https://www.npmjs.com/package/n8n-nodes-reelscribe
> - GitHub: https://github.com/rara-cyber/n8n-nodes-reelscribe
> - API docs: https://reelscribe.app/docs/api
>
> Would love to hear what workflows you'd build with this! Happy to help if you have questions.

**Post 2: Answer questions in the forum**
- Search for posts where people ask about "transcription", "video to text", "captions", "subtitles", "Instagram", "TikTok transcribe"
- Reply helpfully and mention that your node can solve their problem
- This builds credibility AND creates natural backlinks

**Post 3: Share workflow templates as JSON**
- Export 2-3 example workflows and share them as downloadable JSON in your forum posts
- People love copy-paste workflows they can import directly

---

### 2. GitHub Repository Optimization — HIGH PRIORITY

**Why:** A well-optimized repo is the foundation for everything else. Every other channel links back here.

**What to do:**

**Add GitHub Topics (Settings → Topics):**
```
n8n, n8n-nodes, n8n-community-node, automation, video-transcription, 
transcription, instagram, tiktok, youtube, no-code, workflow-automation
```

**Improve the README to include:**
- A clear 1-line description of what the node does
- Screenshots of the node in the n8n editor (people love visuals)
- A "Use Cases" section listing 5-6 real scenarios
- Installation instructions (both UI and npm)
- Example workflow JSON that people can import
- Badge showing npm version and downloads

**Submit to awesome-n8n:**
- Once you have some npm downloads, open a Pull Request to https://github.com/restyler/awesome-n8n to get listed
- This is a curated list that ranks nodes by downloads — being listed here gets you traffic

---

### 3. npm Package Optimization — HIGH PRIORITY

**Why:** When people search "transcription" or "video" in n8n's Community Nodes panel, your keywords determine if they find you.

**Current keywords are good!** But consider adding a few more to `package.json`:
```json
"keywords": [
  "n8n-community-node-package",
  "n8n-nodes",
  "n8n",
  "reelscribe",
  "transcription",
  "instagram",
  "tiktok",
  "youtube",
  "video",
  "captions",
  "subtitles",
  "video-to-text",
  "automation",
  "no-code",
  "speech-to-text"
]
```

---

### 4. Dev.to / Hashnode Blog Posts — HIGH VALUE

**Why:** These platforms have great SEO. A well-written tutorial can rank on Google for years and drive continuous traffic.

**Article Ideas (write 1-2 to start):**

**Article 1: Beginner-Friendly Tutorial**
> **Title:** "How to Automatically Transcribe TikTok & Instagram Videos with n8n (No Code)"
>
> **Outline:**
> 1. What is n8n and why it's useful (brief)
> 2. What ReelScribe does
> 3. Step-by-step: Install the node, set up credentials, build a simple workflow
> 4. Screenshots of every step
> 5. Link to GitHub and npm
>
> **Tags:** n8n, automation, nocode, tutorial, productivity

**Article 2: Use-Case Focused**
> **Title:** "I Automated My Video Content Repurposing Pipeline with n8n + ReelScribe"
>
> **Outline:**
> 1. The problem: manually transcribing videos is slow
> 2. The solution: n8n workflow that auto-transcribes and sends to Notion/Google Docs
> 3. How it works (with workflow screenshots)
> 4. Results: hours saved per week
> 5. Links to install

**Where to cross-post:** Publish on Dev.to first (best SEO), then cross-post to Hashnode and Medium.

---

### 5. Reddit — MEDIUM PRIORITY

**Why:** Good for reaching automation enthusiasts, but you need to be genuinely helpful (not spammy).

**Subreddits to target:**

| Subreddit | Approach |
|-----------|----------|
| r/n8n | Share your workflow showcase, answer questions about transcription |
| r/automation | Post about the workflow, frame it as "here's how I automated X" |
| r/nocode | Share the tutorial angle — "no-code video transcription pipeline" |
| r/content_marketing | Frame it as a time-saving tool for content teams |
| r/NewTubers | Many small YouTubers want cheap/automated transcription |

**Example Reddit Post (for r/n8n):**
> **Title:** I built a community node for auto-transcribing Instagram/TikTok/YouTube videos
>
> Hey! I wanted to share a node I made that connects n8n to ReelScribe for video transcription.
>
> You give it a video URL, it transcribes it, and you can pipe the text anywhere — Google Sheets, Notion, Slack, whatever.
>
> It handles the polling for you (waits until the transcription is done) so you don't need to set up complicated Wait loops.
>
> Install it from Community Nodes by searching "reelscribe".
>
> Happy to answer any questions!

**Important Reddit rules:**
- Don't post the same thing to multiple subreddits at the same time
- Space out your posts (1-2 per week max)
- Engage with comments genuinely
- Your account should have other activity too, not just self-promotion

---

### 6. YouTube — MEDIUM-HIGH PRIORITY (if you can record)

**Why:** Video tutorials rank well on Google AND YouTube search. "n8n tutorial" gets thousands of searches.

**Video Ideas:**
1. "Auto-Transcribe TikTok Videos with n8n — 5 Minute Setup" (short, focused)
2. "Build a Content Repurposing Pipeline with n8n + ReelScribe" (longer, detailed)
3. "Top n8n Nodes for Content Creators in 2026" (mention ReelScribe alongside popular nodes)

**Tips:**
- Keep it under 10 minutes
- Show your screen — people want to see the n8n editor
- Include the npm install command and links in the video description
- Add timestamps in the description for better YouTube SEO

---

### 7. Twitter/X — LOW EFFORT, STEADY DRIP

**Why:** Quick visibility, easy to do, builds awareness over time.

**What to post:**
- Short demos (screen recordings of the workflow running)
- "Did you know you can auto-transcribe TikTok videos in n8n? Here's how:" + link
- Reply to n8n-related tweets with helpful tips mentioning ReelScribe
- Tag @n8n_io when sharing workflows — they sometimes retweet community projects

**Hashtags:** #n8n #automation #nocode #contentcreator #transcription

---

### 8. n8n Workflow Templates — HIGH VALUE

**Why:** When people browse n8n's template library, they discover your node naturally.

**Templates to create and submit:**

| Template Name | What It Does |
|--------------|--------------|
| "Transcribe YouTube Videos to Google Sheets" | Takes a list of URLs from a sheet, transcribes them, writes results back |
| "Auto-Transcribe New Instagram Posts" | Monitors an RSS feed or trigger, transcribes new videos |
| "Video Transcription + AI Summary Pipeline" | Transcribes → sends to OpenAI for summary → saves to Notion |
| "Batch Transcription with Slack Notifications" | Processes a queue of videos, notifies a Slack channel when done |

Submit these through the n8n Creator Portal or share as JSON on the community forum.

---

### 9. n8n Creator Portal / Verification — IMPORTANT

**Why:** Verified nodes show up more prominently in n8n's UI.

**How to submit:**
1. Make sure your package follows all n8n guidelines (yours already does)
2. Submit through https://docs.n8n.io/integrations/creating-nodes/deploy/submit-community-nodes/
3. Once verified, your node gets better placement in search results

---

## Backlink Strategy Summary

Here's where you get backlinks from (links pointing to reelscribe.app):

| Source | Link Points To | How |
|--------|---------------|-----|
| n8n Community Forum posts | GitHub repo + reelscribe.app | Showcase posts |
| GitHub README | reelscribe.app/docs/api | Already in repo |
| awesome-n8n listing | GitHub repo → reelscribe.app | Submit PR |
| Dev.to / Hashnode articles | reelscribe.app + GitHub | Write tutorials |
| npm package page | GitHub repo → reelscribe.app | Already configured |
| Reddit posts | reelscribe.app or GitHub | Community posts |
| YouTube descriptions | reelscribe.app + install links | Video descriptions |
| n8n Workflow Templates | Node page → reelscribe.app | Submit templates |

---

## 90-Day Action Plan

### Week 1-2: Foundation
- [ ] Add more keywords to package.json (captions, subtitles, video-to-text, etc.)
- [ ] Improve GitHub README with screenshots, use cases, and badges
- [ ] Add GitHub topics to the repository
- [ ] Build 2-3 example workflow JSONs

### Week 3-4: Launch Posts
- [ ] Publish showcase post on n8n Community Forum
- [ ] Publish first Dev.to article (beginner tutorial)
- [ ] Post on r/n8n

### Week 5-6: Expand Reach
- [ ] Submit for n8n Creator Portal verification
- [ ] Cross-post Dev.to article to Hashnode and Medium
- [ ] Post on r/automation and r/nocode (spaced out)
- [ ] Start Twitter/X posting (1-2 tweets per week)

### Week 7-8: Templates & Content
- [ ] Create and submit 2-3 workflow templates
- [ ] Write second article (use-case focused)
- [ ] Record a YouTube tutorial (if possible)

### Week 9-12: Community Engagement
- [ ] Actively answer transcription-related questions on n8n forum
- [ ] Submit PR to awesome-n8n
- [ ] Engage with n8n community on Discord
- [ ] Monitor npm download trends and adjust strategy

---

## Quick Wins (Do These Today)

1. **Add keywords to package.json** — takes 5 minutes, improves discoverability immediately
2. **Add GitHub topics** — takes 2 minutes, free SEO
3. **Write the forum showcase post** — copy the template above, customize it, post it

---

## How to Track Success

- **npm downloads:** Check at https://www.npmjs.com/package/n8n-nodes-reelscribe (weekly/monthly trend)
- **GitHub stars:** Track stars and forks on your repo
- **Forum post views:** n8n forum shows view counts on posts
- **Backlinks:** Use a free tool like Ahrefs Backlink Checker to monitor links to reelscribe.app
- **Google Search Console:** Track which search terms bring people to your site
