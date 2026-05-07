import * as cheerio from 'cheerio';

const BASE_URL = 'https://anikai.to';
const DECODE1_URL = 'https://enc-dec.app/api/enc-kai?text=';
const DECODE2_URL = 'https://enc-dec.app/api/dec-kai?text=';

const fetchHtml = async (url: string) => {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': BASE_URL,
    }
  });
  if (!response.ok) throw new Error(`Failed to fetch ${url} (Status: ${response.status})`);
  return response.text();
};

const fetchJson = async (url: string) => {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': BASE_URL,
      'Accept': 'application/json'
    }
  });
  if (!response.ok) throw new Error(`Failed to fetch ${url} (Status: ${response.status})`);
  try {
     return await response.json();
  } catch(e) {
     const text = await response.text();
     return JSON.parse(text.trim());
  }
};

const parseAnimesPage = (html: string) => {
  const $ = cheerio.load(html);
  const animes = $('div.aitem').map((_, el) => {
    let title = $(el).find('a.title').text().trim();
    if (!title) {
        title = $(el).find('a.title').attr('title') || $(el).find('a.title').attr('data-jp') || '';
    }
    const urlAttr = $(el).find('a').first().attr('href') || '';
    
    // Extract ID removing "watch/" part
    let id = urlAttr.startsWith('/') ? urlAttr.slice(1) : urlAttr;
    if (id.startsWith('watch/')) {
        id = id.slice(6);
    }
    
    const thumbnail = $(el).find('.poster img').attr('data-src') || $(el).find('.poster img').attr('src') || '';

    const subText = $(el).find('.sub').text().trim();
    const dubText = $(el).find('.dub').text().trim();
    const epsText = $(el).find('.eps').text().trim();
    
    const sub = subText ? parseInt(subText) : (epsText ? parseInt(epsText) : null);
    const dub = dubText ? parseInt(dubText) : null;

    return { 
      id, 
      title, 
      thumbnail,
      episodes: {
        sub,
        dub
      }
    };
  }).get();
  
  const hasNextPage = $('ul.pagination a[rel=next]').length > 0;
  
  let totalPages = 1;
  $('ul.pagination li a').each((_, el) => {
     const pageText = $(el).text();
     const pageNum = parseInt(pageText, 10);
     if (!isNaN(pageNum) && pageNum > totalPages) {
        totalPages = pageNum;
     }
  });

  return { animes, hasNextPage, totalPages };
};

export const getPopular = async (page: number = 1) => {
  const html = await fetchHtml(`${BASE_URL}/browser?keyword=&sort=trending&page=${page}`);
  const data = parseAnimesPage(html);
  return {
    status: 200,
    success: true,
    currentPage: page,
    totalPages: data.totalPages,
    hasNextPage: data.hasNextPage,
    animes: data.animes
  };
};

export const getLatest = async (page: number = 1) => {
  const html = await fetchHtml(`${BASE_URL}/updates?page=${page}`);
  const data = parseAnimesPage(html);
  return {
    status: 200,
    success: true,
    currentPage: page,
    totalPages: data.totalPages,
    hasNextPage: data.hasNextPage,
    animes: data.animes
  };
};

export const getCategory = async (category: string, page: number = 1) => {
  const url = `${BASE_URL}/${category}?page=${page}`;
  const html = await fetchHtml(url);
  const data = parseAnimesPage(html);
  return {
    status: 200,
    success: true,
    currentPage: page,
    totalPages: data.totalPages,
    hasNextPage: data.hasNextPage,
    animes: data.animes
  };
};

export const getGenre = async (genre: string, page: number = 1) => {
  const url = `${BASE_URL}/genres/${genre}?page=${page}`;
  const html = await fetchHtml(url);
  const data = parseAnimesPage(html);
  return {
    status: 200,
    success: true,
    currentPage: page,
    totalPages: data.totalPages,
    hasNextPage: data.hasNextPage,
    animes: data.animes
  };
};

export const getRecent = async (page: number = 1) => {
  const url = `${BASE_URL}/recent?page=${page}`;
  const html = await fetchHtml(url);
  const data = parseAnimesPage(html);
  return {
    status: 200,
    success: true,
    currentPage: page,
    totalPages: data.totalPages,
    hasNextPage: data.hasNextPage,
    animes: data.animes
  };
};

export const getAZList = async (letter: string = 'A', page: number = 1) => {
  const target = letter.toLowerCase() === 'all' ? '/az-list' : `/az-list/${letter.toUpperCase()}`;
  const url = `${BASE_URL}${target}?page=${page}`;
  const html = await fetchHtml(url);
  const data = parseAnimesPage(html);
  return {
    status: 200,
    success: true,
    currentPage: page,
    totalPages: data.totalPages,
    hasNextPage: data.hasNextPage,
    animes: data.animes
  };
};

export const getServerList = async (episodeToken: string) => {
  if (!episodeToken) throw new Error("Episode token is required");
  const secondaryTokenData = await fetchJson(`${DECODE1_URL}${episodeToken}`);
  const secondaryToken = secondaryTokenData.result;
  const linksData = await fetchJson(`${BASE_URL}/ajax/links/list?token=${episodeToken}&_=${secondaryToken}`);
  const html = linksData.result || linksData;
  const $ = cheerio.load(html);

  const servers: any[] = [];
  $('div.server-items').each((_, el) => {
     const type = $(el).attr('data-id'); // sub, dub, softsub
     $(el).find('span.server[data-lid]').each((_, span) => {
        servers.push({
           serverId: $(span).attr('data-lid'),
           name: $(span).text().trim(),
           type
        });
     });
  });

  return {
    status: 200,
    success: true,
    data: servers
  };
};

export interface SearchFilters {
  q?: string;
  sort?: string;
  genres?: string[];
  excludeGenres?: string[];
  status?: string[];
  type?: string[];
  season?: string[];
  language?: string[];
  country?: string[];
  rating?: string[];
  year?: string[];
}

export const searchAnime = async (filters: SearchFilters, page: number = 1) => {
  const params = new URLSearchParams();
  if (filters.q) params.append('keyword', filters.q);
  params.append('sort', filters.sort || (filters.q ? 'most_relevance' : 'trending'));
  params.append('page', page.toString());

  filters.genres?.forEach(g => params.append('genre[]', g));
  filters.excludeGenres?.forEach(g => params.append('genre[]', `-${g}`));
  filters.status?.forEach(s => params.append('status[]', s));
  filters.type?.forEach(t => params.append('type[]', t));
  filters.season?.forEach(s => params.append('season[]', s));
  filters.language?.forEach(l => params.append('language[]', l));
  filters.country?.forEach(c => params.append('country[]', c));
  filters.rating?.forEach(r => params.append('rating[]', r));
  filters.year?.forEach(y => params.append('year[]', y));

  const url = `${BASE_URL}/browser?${params.toString()}`;
  const html = await fetchHtml(url);
  const data = parseAnimesPage(html);
  return {
    status: 200,
    success: true,
    currentPage: page,
    totalPages: data.totalPages,
    hasNextPage: data.hasNextPage,
    animes: data.animes
  };
};

const getAnilistId = async (title: string): Promise<number | null> => {
  try {
    const query = `
      query ($search: String) {
        Media (search: $search, type: ANIME) {
          id
        }
      }
    `;
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { search: title }
      })
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data?.Media?.id || null;
  } catch (e) {
    return null;
  }
};

export const getAnimeDetails = async (id: string) => {
  // Correctly append id which could be 'watch/anime-slug'
  let slug = id.startsWith('/') ? id.slice(1) : id;
  if (!slug.startsWith('watch/')) {
    slug = `watch/${slug}`;
  }
  const url = `${BASE_URL}/${slug}`;
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);

  const titleEn = $('h1.title').text();
  const titleJp = $('h1.title').attr('data-jp');
  
  let anilistId = null;
  if (titleEn || titleJp) {
     anilistId = await getAnilistId(titleEn || titleJp || '');
  }

  const thumbnail = $('.poster img').attr('src');
  const description = $('div.desc.text-expand').text().trim() || $('.film-description .text').text().trim();
  
  const additionalInfo: Record<string, string> = {};
  $('.anisc-info .item').each((_, el) => {
    const title = $(el).find('.item-head').text().trim().replace(':', '');
    const value = $(el).find('.name').text().trim() || $(el).text().replace($(el).find('.item-head').text(), '').trim();
    if (title && value) {
      additionalInfo[title.toLowerCase().replace(/ /g, '_')] = value;
    }
  });

  const related: any[] = [];
  const recommend: any[] = [];
  
  $('aside.sidebar > section').each((_, el) => {
     const title = $(el).find('.stitle').text().trim().toLowerCase();
     const items = $(el).find('.aitem').map((_, item) => {
        let link = $(item).attr('href') || '';
        if (link.startsWith('/watch/')) link = link.slice(7);
        else if (link.startsWith('watch/')) link = link.slice(6);
        return {
           id: link,
           title: $(item).find('.title').attr('title') || $(item).find('.title').attr('data-jp') || $(item).find('.title').text().trim(),
           thumbnail: ($(item).attr('style') || '').match(/url\('?([^']+)'?\)/)?.[1] || $(item).find('.poster img').attr('data-src') || $(item).find('.poster img').attr('src'),
           episodes: {
              sub: parseInt($(item).find('.sub').text().trim()) || null,
              dub: parseInt($(item).find('.dub').text().trim()) || null
           }
        };
     }).get();
     
     if (title === 'relations') {
         related.push(...items);
     } else if (title === 'recommended') {
         recommend.push(...items);
     }
  });

  const aniId = $('div.rate-box').attr('data-id') || '';

  if (!titleEn && !titleJp) throw new Error("Could not parse details. Invalid ID?");

  // Return formatted response
  return {
    status: 200,
    success: true,
    data: {
      aniId,
      anilistId,
      id: id.startsWith('watch/') ? id.slice(6) : id,
      title: titleEn || titleJp,
      titleJp,
      thumbnail,
      description,
      additionalInfo,
      relatedAnimes: related,
      recommendedAnimes: recommend
    }
  };
};

export const getEpisodes = async (aniId: string) => {
  if (!aniId) throw new Error("Anime ID (aniId) for episodes is missing");
  // Get token for the anime
  const tokenData = await fetchJson(`${DECODE1_URL}${aniId}`);
  const token = tokenData.result;
  
  if (!token) throw new Error("Failed to extract episode token. aniId may be invalid.");

  // Get episode list html
  const epData = await fetchJson(`${BASE_URL}/ajax/episodes/list?ani_id=${aniId}&_=${token}`);
  const html = epData.result || epData;
  const $ = cheerio.load(html);

  const episodes = $('ul.range li > a[num][slug][token]').map((_, el) => {
    const num = $(el).attr('num');
    const slug = $(el).attr('slug');
    const epToken = $(el).attr('token');
    const titleJp = $(el).find('span[data-jp]').text();
    const langs = $(el).attr('langs'); // 1: sub, 2, 3: dub/sub
    const isFiller = $(el).hasClass('filler');
    
    let type = langs === '1' ? 'Sub' : 'Sub & Dub';
    if (isFiller) type += ' Filler';

    return {
      id: slug,
      number: num,
      title: titleJp ? `Episode ${num}: ${titleJp}` : `Episode ${num}`,
      type: type.trim(),
      token: epToken
    };
  }).get();

  const eps = episodes.reverse();
  return {
    status: 200,
    success: true,
    totalEpisodes: eps.length,
    data: eps
  };
};

const getDirectMegaUpLinks = async (iframeUrl: string) => {
  try {
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

    if (iframeUrl.includes('anikai.to/iframe/')) {
       const iframePageRes = await fetch(iframeUrl, { headers: { 'User-Agent': userAgent } });
       const iframePageHtml = await iframePageRes.text();
       const $ = cheerio.load(iframePageHtml);
       const extractedIframe = $('iframe').attr('src');
       if (extractedIframe) {
           iframeUrl = extractedIframe;
       }
    }

    const parsedUrl = new URL(iframeUrl);
    const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);
    const token = pathSegments[pathSegments.length - 1];
    
    if (!token) return { iframeUrl };

    const reqUrl = `${parsedUrl.protocol}//${parsedUrl.host}/media/${token}`;

    const response = await fetch(reqUrl, {
      headers: {
        'User-Agent': userAgent,
        'Referer': iframeUrl
      }
    });
    const responseBody = await response.text();
    let megaToken = '';
    try {
      megaToken = JSON.parse(responseBody).result;
    } catch (e) {
      console.error("MegaUp media response was not JSON:", responseBody.slice(0, 100));
      return { iframeUrl };
    }
    
    const postBody = { text: megaToken, agent: userAgent };
    const postResponse = await fetch("https://enc-dec.app/api/dec-mega", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postBody)
    });
    
    const postResponseBody = await postResponse.text();
    const decodedPayload = JSON.parse(postResponseBody);
    const decodedResult = decodedPayload.result;
    const megaUpResult = typeof decodedResult === 'string' ? JSON.parse(decodedResult) : decodedResult;

    const sources = megaUpResult.sources || [];
    const tracks = megaUpResult.tracks || [];
    
    const masterPlaylistUrl = sources.find((s: any) => s.file.includes("list") && s.file.endsWith(".m3u8"))?.file || sources[0]?.file;
    
    const subtitleTracks = tracks
      .filter((t: any) => t.kind === "captions" && t.file.endsWith(".vtt"))
      .sort((a: any, b: any) => (b.default ? 1 : 0) - (a.default ? 1 : 0))
      .map((t: any) => ({ file: t.file, label: t.label || "Unknown", isDefault: !!t.default }));

    if (!masterPlaylistUrl) return { iframeUrl };

    const videoResults: { quality: string, url: string }[] = [];
    
    try {
      const playlistResponse = await fetch(masterPlaylistUrl, { 
         headers: { 'User-Agent': userAgent, 'Referer': iframeUrl } 
      });
      const playlistContent = await playlistResponse.text();
      
      if (playlistContent.includes("#EXT-X-STREAM-INF")) {
        const lines = playlistContent.split("\n");
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line.startsWith("#EXT-X-STREAM-INF")) {
            const resolutionMatch = line.match(/RESOLUTION=\d+x(\d+)/);
            const height = resolutionMatch?.[1];
            const quality = height ? `${height}p` : 'Unknown';
            const streamUrlString = lines[i + 1]?.trim();
            if (streamUrlString) {
              const streamUrl = streamUrlString.startsWith("http") ? streamUrlString : masterPlaylistUrl.substring(0, masterPlaylistUrl.lastIndexOf("/")) + "/" + streamUrlString;
              videoResults.push({ quality, url: streamUrl });
            }
          }
        }
      } else {
        videoResults.push({ quality: 'Unknown', url: masterPlaylistUrl });
      }
    } catch(e) {
       videoResults.push({ quality: 'Unknown', url: masterPlaylistUrl });
    }

    return {
      iframeUrl,
      direct: videoResults.length > 0,
      playlist: masterPlaylistUrl,
      sources: videoResults,
      subtitleTracks
    };
  } catch (e) {
    console.error("Failed to extract MegaUp", e);
    return { iframeUrl, error: 'Extraction failed' };
  }
};

export const getVideoLinks = async (episodeId: string, episodeToken: string, serverFilter?: string, typeFilter?: string) => {
  if (!episodeToken) throw new Error("Episode token is required");
  
  const secondaryTokenData = await fetchJson(`${DECODE1_URL}${episodeToken}`);
  const secondaryToken = secondaryTokenData.result;

  const linksData = await fetchJson(`${BASE_URL}/ajax/links/list?token=${episodeToken}&_=${secondaryToken}`);
  const html = linksData.result || linksData;
  const $ = cheerio.load(html);

  let serverGroups: any[] = [];
  
  const serverDivs = $('div.server-items');
  let selectedLid: string | null = null;
  let selectedName: string | null = null;
  
  // First pass: collect metadata about servers without decrypting
  serverDivs.each((_, el) => {
     const type = $(el).attr('data-id'); // sub, dub, softsub
     const spans = $(el).find('span.server[data-lid]');
     const servers: any[] = [];
     
     spans.each((_, span) => {
        const lid = $(span).attr('data-lid');
        const name = $(span).text().trim();
        servers.push({ serverId: lid, name, type });
     });
     serverGroups.push({ type, servers });
  });

  // If we only need one server, find it and fetch it explicitly
  if (serverFilter || typeFilter) {
    let filteredGroups = serverGroups;
    if (typeFilter) {
      filteredGroups = serverGroups.filter(g => {
        if (typeFilter.toLowerCase() === 'sub') return g.type === 'sub' || g.type === 'softsub';
        if (typeFilter.toLowerCase() === 'dub') return g.type === 'dub';
        return false;
      });
      if (typeFilter.toLowerCase() === 'sub' && filteredGroups.length > 1) {
        const softsub = filteredGroups.find(g => g.type === 'softsub');
        if (softsub) filteredGroups = [softsub];
        else filteredGroups = [filteredGroups[0]];
      }
    }
    
    let selectedServerMeta: any = null;
    if (serverFilter) {
      const serverNum = serverFilter.replace(/\D/g, '');
      const targetName = `Server ${serverNum}`;
      for (const group of filteredGroups) {
         const found = group.servers.find((s: any) => s.name === targetName);
         if (found) {
            selectedServerMeta = found;
            break;
         }
      }
      if (!selectedServerMeta && filteredGroups[0]?.servers?.length > 0) {
         selectedServerMeta = filteredGroups[0].servers[0];
      }
    } else {
      if (filteredGroups[0]?.servers?.length > 0) {
         selectedServerMeta = filteredGroups[0].servers[0];
      }
    }

    if (selectedServerMeta) {
       let finalServerResult: any = { serverId: selectedServerMeta.serverId, name: selectedServerMeta.name };
       try {
           const lid = selectedServerMeta.serverId;
           const streamTokenData = await fetchJson(`${DECODE1_URL}${lid}`);
           const streamToken = streamTokenData.result;
           const streamJson = await fetchJson(`${BASE_URL}/ajax/links/view?id=${lid}&_=${streamToken}`);
           const encodedLink = streamJson.result?.trim() || streamJson.trim();
           const decryptedJsonString = await fetchHtml(`${DECODE2_URL}${encodedLink}`);
           const decryptedJson = JSON.parse(decryptedJsonString);
           const decryptedLink = decryptedJson.result?.url || '';
           
           if (decryptedLink && decryptedLink.includes('megaup.')) {
             const extracted = await getDirectMegaUpLinks(decryptedLink);
             if (extracted.direct && extracted.playlist) {
               finalServerResult = { ...finalServerResult, link: extracted.playlist, iframe: decryptedLink, sources: extracted.sources, subtitleTracks: extracted.subtitleTracks };
             } else {
               finalServerResult = { ...finalServerResult, link: decryptedLink, error: extracted.error || 'No direct link' };
             }
           } else {
             finalServerResult = { ...finalServerResult, link: decryptedLink };
           }
       } catch(e) {
          console.error("Error decoding server", selectedServerMeta.name, e);
          finalServerResult.error = 'Failed to decode link';
       }
       return { status: 200, success: true, data: finalServerResult };
    } else {
       return { status: 404, success: false, error: 'Requested server or type not found' };
    }
  }

  // If no filters provided, decode ALL of them concurrently
  const promises: Promise<void>[] = [];
  serverGroups.forEach(group => {
     group.servers.forEach((s: any) => {
        promises.push((async () => {
           try {
             const lid = s.serverId;
             const streamTokenData = await fetchJson(`${DECODE1_URL}${lid}`);
             const streamToken = streamTokenData.result;
             const streamJson = await fetchJson(`${BASE_URL}/ajax/links/view?id=${lid}&_=${streamToken}`);
             const encodedLink = streamJson.result?.trim() || streamJson.trim();
             const decryptedJsonString = await fetchHtml(`${DECODE2_URL}${encodedLink}`);
             const decryptedJson = JSON.parse(decryptedJsonString);
             const decryptedLink = decryptedJson.result?.url || '';
             
             if (decryptedLink && decryptedLink.includes('megaup.')) {
               const extracted = await getDirectMegaUpLinks(decryptedLink);
               if (extracted.direct && extracted.playlist) {
                  s.link = extracted.playlist;
                  s.iframe = decryptedLink;
                  s.sources = extracted.sources;
                  s.subtitleTracks = extracted.subtitleTracks;
               } else {
                  s.link = decryptedLink;
                  s.error = extracted.error || 'No direct link';
               }
             } else {
               s.link = decryptedLink;
             }
           } catch(e) {
              console.error("Error decoding server", s.name, e);
              s.error = 'Failed to decode link';
           }
        })());
     });
  });

  await Promise.allSettled(promises);

  return {
    status: 200,
    success: true,
    data: serverGroups
  };
};

