import React, { useState } from 'react';
import { 
  Play, 
  Server, 
  Search, 
  Clock, 
  TrendingUp, 
  Info, 
  Film,
  Video,
  ChevronDown,
  ChevronRight,
  Code
} from 'lucide-react';

type Param = { name: string; type: string; required: boolean; description: string; default?: string };

type Endpoint = {
  id: string;
  method: 'GET' | 'POST';
  path: string;
  name: string;
  description: string;
  icon: React.ElementType;
  params: Param[];
};

const endpoints: Endpoint[] = [
  {
    id: 'health',
    method: 'GET',
    path: '/api/health',
    name: 'Health Check',
    description: 'Check if the API is running.',
    icon: Server,
    params: []
  },
  {
    id: 'popular',
    method: 'GET',
    path: '/api/popular',
    name: 'Popular Anime',
    description: 'Get a list of currently trending/popular anime. If page is omitted, fetches up to 10 pages.',
    icon: TrendingUp,
    params: [
      { name: 'page', type: 'number', required: false, description: 'Page number' }
    ]
  },
  {
    id: 'latest',
    method: 'GET',
    path: '/api/latest',
    name: 'Latest Updates',
    description: 'Get recently updated anime episodes. If page is omitted, fetches up to 10 pages.',
    icon: Clock,
    params: [
      { name: 'page', type: 'number', required: false, description: 'Page number' }
    ]
  },
  {
    id: 'search',
    method: 'GET',
    path: '/api/search',
    name: 'Search & Filter Anime',
    description: 'Search for anime and filter by genres, year, season, etc. Supports comma-separated keys or multiple uses.',
    icon: Search,
    params: [
      { name: 'q', type: 'string', required: false, description: 'Search query keyword' },
      { name: 'page', type: 'number', required: false, description: 'Page number' },
      { name: 'sort', type: 'string', required: false, description: 'e.g. trending, title_az, recently_updated' },
      { name: 'genre', type: 'string[]', required: false, description: 'Genre ID(s) to include (e.g. 47 for Action, 1 for Adventure)' },
      { name: 'status', type: 'string[]', required: false, description: 'e.g. releasing, completed' },
      { name: 'type', type: 'string[]', required: false, description: 'e.g. tv, movie, ova' },
      { name: 'season', type: 'string[]', required: false, description: 'e.g. fall, summer' },
      { name: 'language', type: 'string[]', required: false, description: 'e.g. sub, dub' },
    ]
  },
  {
    id: 'details',
    method: 'GET',
    path: '/api/details',
    name: 'Anime Details',
    description: 'Get full details of a specific anime.',
    icon: Info,
    params: [
      { name: 'id', type: 'string', required: true, description: 'Anime slug (e.g. one-piece-dk6r)' }
    ]
  },
  {
    id: 'episodes',
    method: 'GET',
    path: '/api/episodes',
    name: 'Anime Episodes',
    description: 'Get the episode list for an anime.',
    icon: Film,
    params: [
      { name: 'aniId', type: 'string', required: true, description: 'Anime Internal ID (aniId property from /api/details)' }
    ]
  },
  {
    id: 'servers',
    method: 'GET',
    path: '/api/servers',
    name: 'Episode Servers List',
    description: 'Get the available servers for an episode.',
    icon: Server,
    params: [
      { name: 'token', type: 'string', required: true, description: 'Episode token (from /api/episodes)' }
    ]
  },
  {
    id: 'stream',
    method: 'GET',
    path: '/api/stream',
    name: 'Episode Video Stream',
    description: 'Get streaming links for an episode.',
    icon: Video,
    params: [
      { name: 'id', type: 'string', required: true, description: 'Episode ID (slug)' },
      { name: 'token', type: 'string', required: true, description: 'Episode token (from /api/episodes)' },
      { name: 'server', type: 'string', required: false, description: 'Server filter (e.g. hd-1, hd-2)' },
      { name: 'type', type: 'string', required: false, description: 'Type filter (sub or dub)' }
    ]
  },
  {
    id: 'category',
    method: 'GET',
    path: '/api/category/tv',
    name: 'Category API (e.g. TV)',
    description: 'Get anime by category (replace /tv with movie, ova, ona, special).',
    icon: Film,
    params: [
      { name: 'page', type: 'number', required: false, description: 'Page number' }
    ]
  },
  {
    id: 'recent',
    method: 'GET',
    path: '/api/recent',
    name: 'Recently Updated API',
    description: 'Get recently updated anime',
    icon: Film,
    params: [
      { name: 'page', type: 'number', required: false, description: 'Page number' }
    ]
  },
  {
    id: 'genre',
    method: 'GET',
    path: '/api/genre/action',
    name: 'Genre API (e.g. Action)',
    description: 'Get anime by genre slug.',
    icon: Film,
    params: [
      { name: 'page', type: 'number', required: false, description: 'Page number' }
    ]
  },
  {
    id: 'azlist',
    method: 'GET',
    path: '/api/az-list/all',
    name: 'A-Z List API',
    description: 'Get anime sorted alphabetically (replace /all with A, B, etc).',
    icon: Film,
    params: [
      { name: 'page', type: 'number', required: false, description: 'Page number' }
    ]
  }
];

// Very basic JSON highlighter
const highlightJSON = (obj: any) => {
  let json = JSON.stringify(obj, null, 2);
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      let cls = 'text-blue-400';
      if (/^"/.test(match)) {
          if (/:$/.test(match)) {
              cls = 'text-red-400';
          } else {
              cls = 'text-green-400';
          }
      } else if (/true|false/.test(match)) {
          cls = 'text-yellow-400';
      } else if (/null/.test(match)) {
          cls = 'text-yellow-400';
      }
      return '<span class="' + cls + '">' + match + '</span>';
  });
};

function EndpointTester({ endpoint }: { endpoint: Endpoint; key?: React.Key }) {
  const [expanded, setExpanded] = useState(false);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleParamChange = (name: string, value: string) => {
    setParamValues(prev => ({ ...prev, [name]: value }));
  };

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const url = new URL(endpoint.path, window.location.origin);
      endpoint.params.forEach(param => {
        const value = paramValues[param.name] || param.default;
        if (value) {
          url.searchParams.append(param.name, value);
        } else if (param.required) {
          throw new Error(`Missing required parameter: ${param.name}`);
        }
      });

      const res = await fetch(url.toString());
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      setResponse(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred fetching the API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-4">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg ${expanded ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
            <endpoint.icon size={20} />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
              {endpoint.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-green-100 text-green-700 uppercase">
                {endpoint.method}
              </span>
              <span className="text-sm font-mono text-slate-500">{endpoint.path}</span>
            </div>
          </div>
        </div>
        <div className="text-slate-400">
          {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 p-6 bg-slate-50/50">
          <p className="text-slate-600 mb-6">{endpoint.description}</p>

          {endpoint.params.length > 0 && (
            <div className="space-y-4 mb-6">
              <h4 className="text-sm font-semibold text-slate-900">Parameters</h4>
              <div className="grid gap-4">
                {endpoint.params.map(param => (
                  <div key={param.name} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 bg-white p-3 rounded-lg border border-slate-200">
                    <div className="sm:w-1/3">
                      <label className="text-sm font-semibold text-slate-800 flex items-center gap-1">
                        {param.name}
                        {param.required && <span className="text-red-500">*</span>}
                      </label>
                      <span className="text-xs font-mono text-slate-500">{param.type}</span>
                    </div>
                    <div className="sm:w-2/3 flex flex-col gap-2">
                       <input
                        type="text"
                        placeholder={param.default ? `Default: ${param.default}` : param.description}
                        value={paramValues[param.name] || ''}
                        onChange={(e) => handleParamChange(param.name, e.target.value)}
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleTest}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
          >
            {loading ? (
              <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
            ) : (
              <Play size={16} />
            )}
            <span>Send Request</span>
          </button>

          {(error || response) && (
            <div className="mt-6 rounded-xl border border-slate-700 bg-slate-900 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
                <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                  <Code size={16} />
                  Response
                </div>
                {error ? (
                  <span className="px-2 py-0.5 text-xs font-medium rounded bg-red-500/20 text-red-400">Error</span>
                ) : (
                  <span className="px-2 py-0.5 text-xs font-medium rounded bg-green-500/20 text-green-400">200 OK</span>
                )}
              </div>
              <div className="p-4 overflow-x-auto max-h-[500px]">
                {error ? (
                  <div className="text-red-400 text-sm font-mono whitespace-pre-wrap">{error}</div>
                ) : (
                  <pre className="text-sm font-mono leading-relaxed" style={{ color: '#d1cdc7' }}>
                    <code dangerouslySetInnerHTML={{ __html: highlightJSON(response) }} />
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Film size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">AnimeKai API</h1>
              <p className="text-xs font-medium text-slate-500">Interactive Documentation</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Available Endpoints</h2>
          <p className="text-slate-600">
            Expand an endpoint below to view its parameters and test it directly in your browser. Parameters are optional unless marked with an asterisk (*).
          </p>
        </div>

        <div className="space-y-2">
          {endpoints.map(ep => (
            <EndpointTester key={ep.id} endpoint={ep} />
          ))}
        </div>
      </main>
    </div>
  );
}
