# Anikai Scraper API

A robust, fast, and feature-rich API for scraping anime details, links, categories, and streams from Anikai. Built correctly and securely with TypeScript, making use of `cheerio` for HTML parsing and bypasses for Anikai's obfuscation layer.

---

## Features

- **Search:** Fully functional advanced search.
- **Details:** Extracts comprehensive anime info including description, AniList ID tracking, relations, and recommendations.
- **Streaming:** Obfuscated stream unlocking (extracts direct mp4 URLs and HLS playlist URLs for servers like Server 1, Server 2).
- **Categories:** Fetch by category, genre, A-Z list, recent updates, popular, etc.
- **Sub/Dub Counts:** Retrieves sub and dub episode counts out of the box dynamically.
- **Lightweight:** No puppeteer and no heavy headless browsers. Super fast and reliable.

---

## Request & Response Examples

### 1. Health API
**GET** `/api/health`
**Response:**
```json
{
  "status": "ok"
}
```

### 2. Recent Updates
**GET** `/api/recent?page=1`
**Response:**
```json
{
  "status": 200,
  "success": true,
  "currentPage": 1,
  "totalPages": 5,
  "hasNextPage": true,
  "animes": [
    {
      "id": "naruto-9r5k",
      "title": "Naruto",
      "thumbnail": "https://static.anikai.to/...",
      "episodes": {
        "sub": 220,
        "dub": 220
      }
    }
  ]
}
```

### 3. Popular Anime
**GET** `/api/popular?page=1`
**Response:**
```json
{
  "status": 200,
  "success": true,
  "currentPage": 1,
  "totalPages": 200,
  "hasNextPage": true,
  "animes": [ ... ]
}
```

### 4. Latest Added
**GET** `/api/latest?page=1`
**Response:**
```json
{
  "status": 200,
  "success": true,
  "currentPage": 1,
  "totalPages": 300,
  "hasNextPage": true,
  "animes": [ ... ]
}
```

### 5. Category API
**GET** `/api/category/tv?page=1`
*(Categories include: `tv`, `movie`, `ova`, `ona`, `special`)*
**Response:**
```json
{
  "status": 200,
  "success": true,
  "currentPage": 1,
  "totalPages": 200,
  "hasNextPage": true,
  "animes": [ ... ]
}
```

### 6. Genre API
**GET** `/api/genre/action?page=1`
**Response:**
```json
{
  "status": 200,
  "success": true,
  "currentPage": 1,
  "totalPages": 50,
  "hasNextPage": true,
  "animes": [ ... ]
}
```

### 7. A-Z List API
**GET** `/api/az-list/A?page=1`
*(Accepts letters `A` to `Z` or `all`)*
**Response:**
```json
{
  "status": 200,
  "success": true,
  "currentPage": 1,
  "totalPages": 40,
  "hasNextPage": true,
  "animes": [ ... ]
}
```

### 8. Search API
**GET** `/api/search?q=naruto&page=1`
*(Optional filters: `genre`, `excludeGenre`, `status`, `type`, `sort`)*
**Response:**
```json
{
  "status": 200,
  "success": true,
  "currentPage": 1,
  "totalPages": 2,
  "hasNextPage": true,
  "animes": [ ... ]
}
```

### 9. Details API
**GET** `/api/details?id=one-piece-dk6r`
**Response:**
```json
{
  "status": 200,
  "success": true,
  "data": {
    "aniId": "c4ey",
    "anilistId": 21,
    "id": "one-piece-dk6r",
    "title": "One Piece",
    "titleJp": "ONE PIECE",
    "thumbnail": "...",
    "description": "...",
    "relatedAnimes": [ ... ],
    "recommendedAnimes": [ ... ]
  }
}
```

### 10. Episodes API
**GET** `/api/episodes?aniId=c4ey`
*(Get the `aniId` from the Details API)*
**Response:**
```json
{
  "status": 200,
  "success": true,
  "totalEpisodes": 1100,
  "data": [
    {
      "id": "watch/one-piece-dk6r",
      "number": 1,
      "title": "Episode 1: I'm Luffy! The Man Who Will Become the Pirate King!",
      "type": "sub",
      "token": "cov7rO_y4Biz1Q"
    }
  ]
}
```

### 11. Servers API
**GET** `/api/servers?token=cov7rO_y4Biz1Q`
*(Get the `token` from the Episodes API)*
**Response:**
```json
{
  "status": 200,
  "success": true,
  "data": [
    {
      "type": "sub",
      "servers": [
        {
          "serverId": "4",
          "name": "Server 1"
        }
      ]
    }
  ]
}
```

### 12. Streaming Links API
**GET** `/api/stream?id=one-piece-dk6r&token=cov7rO_y4Biz1Q&server=hd-1`
**Response:**
```json
{
  "status": 200,
  "success": true,
  "data": {
    "serverId": "4",
    "name": "Server 1",
    "link": "https://master-playlist.m3u8",
    "sources": [
      {
        "quality": "1080p",
        "url": "https://1080p-playlist.m3u8"
      }
    ],
    "subtitleTracks": [
      {
        "url": "https://english.vtt",
        "language": "English",
        "kind": "captions"
      }
    ]
  }
}
```

---

## Deployment Instructions

Out-of-the-box support for both local development and instant deployment to top cloud providers!

### Vercel Deployment

The project is already pre-configured to deploy on Vercel as a Serverless function.
`api/index.ts` is configured as the Vercel edge endpoint.

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in your project root directory.
3. Your API routes are fully functional in Vercel Edge Serverless functions. Done!

### Cloudflare Workers

The project is pre-configured with a native Web Fetch API implementation for Cloudflare.

1. Install Wrangler CLI: `npm install -g wrangler`
2. Authenticate: `wrangler login`
3. Deploy to Cloudflare: `npm run build && wrangler deploy`

---

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the server:**
   ```bash
   npm run dev
   ```
3. Visit `http://localhost:3000` to view the swagger-like frontend where you can test all endpoints out-of-the-box.
