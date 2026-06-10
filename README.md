# 📊 YouTube Trend Tracker

A React + Vite web app that fetches real-time YouTube data and calculates a **Viral Score (0–100)** for each video based on:

- **Views / Subscriber ratio** (0–50 pts) — how far the video punches above the channel's normal reach
- **Engagement rate** (0–50 pts) — (likes + comments) ÷ views

## Features

- 🔥 **Trending tab** — top 20 trending videos, filterable by country and category
- 🔍 **Search tab** — search any keyword and rank results by viral score
- 📊 **Stats bar** — avg score, top score, and mega-viral count at a glance
- 🔎 **Score breakdown** — expandable per-video explanation of how the score was calculated

---

## Local development

### 1. Set up your API key

Copy the example env file and add your YouTube Data API v3 key:

```bash
cp .env.example .env
```

Edit `.env`:

```
VITE_YOUTUBE_API_KEY=your_api_key_here
```

### 2. Run the dev server

```bash
npm install
npm run dev
```

Open http://localhost:5173.

### Getting an API key

1. Go to https://console.cloud.google.com
2. Create a project (or use an existing one)
3. Enable **YouTube Data API v3**
4. Create an **API key** under Credentials
5. (Optional) Restrict the key to HTTP referrers matching your domain

The free tier provides 10,000 quota units/day — more than enough for personal use.

---

## Deploy to Cloudflare Pages

### 1. Connect to Cloudflare Pages

1. Log in to https://dash.cloudflare.com
2. Go to **Workers & Pages → Pages → Create a project**
3. Click **Connect to Git** and select your GitHub repo
4. Use these build settings:

| Setting | Value |
|---|---|
| Framework preset | **Vite** |
| Build command | `npm run build` |
| Build output directory | `dist` |

### 2. Add your API key in Cloudflare

Go to your project's **Settings → Environment variables** and add:

```
VITE_YOUTUBE_API_KEY = your_api_key_here
```

Cloudflare injects it at build time — no key ever goes into the repo.

Every `git push` to `main` triggers a new deployment.

---

## Project structure

```
youtube-trend-tracker/
├── index.html
├── package.json
├── vite.config.js
├── .env.example            # Copy to .env and add your key
├── .gitignore
├── public/
│   ├── _redirects          # Cloudflare SPA routing fix
│   └── favicon.svg
└── src/
    ├── main.jsx
    ├── App.jsx             # Main app state & layout
    ├── index.css           # Global styles & CSS variables
    ├── components/
    │   ├── VideoCard.jsx
    │   ├── ScoreMeter.jsx
    │   └── StatsBar.jsx
    └── utils/
        ├── viralScore.js   # Score calculation logic
        └── format.js       # Number & date formatters
```
