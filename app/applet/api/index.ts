import express from 'express';
import * as scraper from '../src/services/scraper.js';

const app = express();
app.use(express.json());

const apiRouter = express.Router();

apiRouter.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

apiRouter.get("/popular", async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
    const data = await scraper.getPopular(page);
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ status: 500, success: false, error: e.message });
  }
});

apiRouter.get("/latest", async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
    const data = await scraper.getLatest(page);
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ status: 500, success: false, error: e.message });
  }
});

apiRouter.get("/search", async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
    
    const filters: scraper.SearchFilters = {
      q: req.query.q as string,
      sort: req.query.sort as string,
      genres: [].concat(req.query.genre || [] as any),
      excludeGenres: [].concat(req.query.excludeGenre || [] as any),
      status: [].concat(req.query.status || [] as any),
      type: [].concat(req.query.type || [] as any),
      season: [].concat(req.query.season || [] as any),
      language: [].concat(req.query.language || [] as any),
      country: [].concat(req.query.country || [] as any),
      rating: [].concat(req.query.rating || [] as any),
      year: [].concat(req.query.year || [] as any),
    };

    const data = await scraper.searchAnime(filters, page);
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ status: 500, success: false, error: e.message });
  }
});

apiRouter.get("/details", async (req, res) => {
  try {
    const id = req.query.id as string;
    if (!id) return res.status(400).json({ status: 400, success: false, error: "Missing id parameter" });
    const data = await scraper.getAnimeDetails(id);
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ status: 500, success: false, error: e.message });
  }
});

apiRouter.get("/episodes", async (req, res) => {
  try {
    const aniId = req.query.aniId as string;
    if (!aniId) return res.status(400).json({ status: 400, success: false, error: "Missing aniId parameter" });
    const data = await scraper.getEpisodes(aniId);
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ status: 500, success: false, error: e.message });
  }
});

apiRouter.get("/stream", async (req, res) => {
  try {
    const token = req.query.token as string;
    const episodeId = req.query.id as string;
    const server = req.query.server as string;
    const type = req.query.type as string;
    
    if (!token || !episodeId) return res.status(400).json({ status: 400, success: false, error: "Missing token or id parameter" });
    
    const data = await scraper.getVideoLinks(episodeId, token, server, type);
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ status: 500, success: false, error: e.message });
  }
});

apiRouter.get("/recent", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string || "1");
    const data = await scraper.getRecent(page);
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ status: 500, success: false, error: e.message });
  }
});

apiRouter.get("/category/:category", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string || "1");
    const data = await scraper.getCategory(req.params.category, page);
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ status: 500, success: false, error: e.message });
  }
});

apiRouter.get("/genre/:genre", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string || "1");
    const data = await scraper.getGenre(req.params.genre, page);
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ status: 500, success: false, error: e.message });
  }
});

apiRouter.get("/az-list/:letter?", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string || "1");
    const letter = req.params.letter || req.query.letter as string || "all";
    const data = await scraper.getAZList(letter, page);
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ status: 500, success: false, error: e.message });
  }
});

apiRouter.get("/servers", async (req, res) => {
  try {
    const token = req.query.token as string;
    if (!token) return res.status(400).json({ status: 400, success: false, error: "Missing token parameter" });
    const data = await scraper.getServerList(token);
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ status: 500, success: false, error: e.message });
  }
});

app.use('/api', apiRouter);

export default app;
