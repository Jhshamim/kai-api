import * as scraper from './src/services/scraper.js';

export default {
  async fetch(request: Request, env: any, ctx: any) {
    const url = new URL(request.url);
    const path = url.pathname;
    const searchParams = url.searchParams;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Content-Type': 'application/json'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      let data: any = null;

      if (path === '/api/health') {
        data = { status: 'ok' };
      } else if (path === '/api/popular') {
        const page = searchParams.get('page') ? parseInt(searchParams.get('page') as string, 10) : undefined;
        data = await scraper.getPopular(page);
      } else if (path === '/api/latest') {
        const page = searchParams.get('page') ? parseInt(searchParams.get('page') as string, 10) : undefined;
        data = await scraper.getLatest(page);
      } else if (path === '/api/search') {
        const page = searchParams.get('page') ? parseInt(searchParams.get('page') as string, 10) : undefined;
        const genres = searchParams.getAll('genre');
        const excludeGenres = searchParams.getAll('excludeGenre');
        
        data = await scraper.searchAnime({
          q: searchParams.get('q') || undefined,
          sort: searchParams.get('sort') || undefined,
          genres: genres.length > 0 ? genres : undefined,
          excludeGenres: excludeGenres.length > 0 ? excludeGenres : undefined,
        }, page);
      } else if (path === '/api/details') {
        const id = searchParams.get('id');
        if (!id) throw new Error("Missing id parameter");
        data = await scraper.getAnimeDetails(id);
      } else if (path === '/api/episodes') {
        const aniId = searchParams.get('aniId');
        if (!aniId) throw new Error("Missing aniId parameter");
        data = await scraper.getEpisodes(aniId);
      } else if (path === '/api/servers') {
        const token = searchParams.get('token');
        if (!token) throw new Error("Missing token parameter");
        data = await scraper.getServerList(token);
      } else if (path === '/api/stream') {
        const token = searchParams.get('token');
        const id = searchParams.get('id');
        const server = searchParams.get('server') || undefined;
        const type = searchParams.get('type') || undefined;
        if (!token || !id) throw new Error("Missing token or id parameter");
        data = await scraper.getVideoLinks(id, token, server, type);
      } else if (path === '/api/recent') {
        const page = searchParams.get('page') ? parseInt(searchParams.get('page') as string, 10) : 1;
        data = await scraper.getRecent(page);
      } else if (path.startsWith('/api/category/')) {
        const category = path.replace('/api/category/', '');
        const page = searchParams.get('page') ? parseInt(searchParams.get('page') as string, 10) : 1;
        data = await scraper.getCategory(category, page);
      } else if (path.startsWith('/api/genre/')) {
        const genre = path.replace('/api/genre/', '');
        const page = searchParams.get('page') ? parseInt(searchParams.get('page') as string, 10) : 1;
        data = await scraper.getGenre(genre, page);
      } else if (path.startsWith('/api/az-list/')) {
        const letter = path.replace('/api/az-list/', '') || 'all';
        const page = searchParams.get('page') ? parseInt(searchParams.get('page') as string, 10) : 1;
        data = await scraper.getAZList(letter, page);
      } else {
        return new Response(JSON.stringify({ error: "Endpoint not found" }), { status: 404, headers: corsHeaders });
      }

      return new Response(JSON.stringify(data), { status: 200, headers: corsHeaders });
    } catch (e: any) {
      return new Response(JSON.stringify({ status: 500, success: false, error: e.message }), {
        status: 500,
        headers: corsHeaders
      });
    }
  }
};
