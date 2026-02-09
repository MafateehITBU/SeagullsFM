/**
 * Zetta Automation stream metadata (Now Playing / Up Next).
 * Fetches XML from Zetta endpoint, parses to JSON. Backend-only; frontend never sees XML.
 */

import { XMLParser } from 'fast-xml-parser';

const CACHE_TTL_MS = 8000; // Refresh every 8 seconds (between 5–10s)
let cache = null;
let cacheTime = 0;

/**
 * Normalize a track object from various XML structures to { title, artist, artwork }.
 * @param {object} obj - Parsed XML node (can be nested)
 * @returns {{ title: string, artist: string, artwork: string|null }}
 */
function normalizeTrack(obj) {
  if (!obj || typeof obj !== 'object') {
    return { title: '', artist: '', artwork: null, description: '', startTime: '', stopTime: '' };
  }
  const get = (key, alt) => {
    const v = obj[key] ?? obj[alt];
    return typeof v === 'string' ? v.trim() : '';
  };
  return {
    title: get('title', 'Title') || get('name', 'Name') || '',
    artist: get('artist', 'Artist') || get('author', 'Author') || '',
    artwork: typeof obj.artwork === 'string' ? obj.artwork.trim() || null
      : (typeof obj.image === 'string' ? obj.image.trim() || null : null),
    description: get('description', 'Description') || '',
    startTime: get('startTime', 'AirStarttime') || '',
    stopTime: get('stopTime', 'AirStoptime') || '',
  };
}

/**
 * Recursively find first object that has title/artist-like keys (case-insensitive).
 */
function findTrackInTree(node, depth = 0) {
  if (depth > 10) return null;
  if (!node || typeof node !== 'object') return null;
  const keys = Object.keys(node);
  const hasTitle = keys.some(k => /title|name/i.test(k));
  const hasArtist = keys.some(k => /artist|author/i.test(k));
  if (hasTitle || hasArtist) return node;
  for (const k of keys) {
    const child = node[k];
    if (child && typeof child === 'object' && !Array.isArray(child)) {
      const found = findTrackInTree(child, depth + 1);
      if (found) return found;
    }
    if (Array.isArray(child) && child.length) {
      const first = child[0];
      if (first && typeof first === 'object') {
        const found = findTrackInTree(first, depth + 1);
        if (found) return found;
      }
    }
  }
  return null;
}

/**
 * Extract title, artist, and times from a Zetta LogEvent (ZettaClipboard format).
 * LogEvent has AssetEvent.Asset with @_Title and Artist.@_Name; or Description "Title - Artist".
 * Same fields as old PHP: Description, AirStarttime, AirStoptime.
 */
function trackFromZettaLogEvent(logEvent) {
  if (!logEvent || typeof logEvent !== 'object') {
    return { title: '', artist: '', artwork: null, description: '', startTime: '', stopTime: '' };
  }
  const desc = (logEvent['@_Description'] || logEvent.Description || '').trim();
  const startTime = (logEvent['@_AirStarttime'] || logEvent.AirStarttime || '').trim();
  const stopTime = (logEvent['@_AirStoptime'] || logEvent.AirStoptime || '').trim();
  let title = '';
  let artist = '';

  const assetEvent = logEvent.AssetEvent || logEvent.assetEvent;
  let asset = assetEvent?.Asset ?? assetEvent?.asset;
  if (Array.isArray(asset)) asset = asset[0];
  if (asset && typeof asset === 'object') {
    title = String(asset['@_Title'] ?? asset.Title ?? '').trim();
    let a = asset.Artist ?? asset.artist;
    if (Array.isArray(a)) a = a[0];
    artist = (a?.['@_Name'] ?? a?.Name ?? (typeof a === 'string' ? a : '')).trim();
  }
  if (!title && !artist && desc) {
    const parts = desc.split(/\s*-\s*/);
    title = (parts[0] || '').trim();
    artist = (parts[1] || '').trim();
  }
  return { title, artist, artwork: null, description: desc, startTime, stopTime };
}

/**
 * Find ZettaClipboard root or LogEvents in parsed XML (root key may vary by parser).
 */
function findZettaClipboardRoot(parsed) {
  if (!parsed || typeof parsed !== 'object') return null;
  const key = Object.keys(parsed).find(k => /zettaclipboard/i.test(k));
  if (key) return parsed[key];
  if (parsed.ZettaClipboard) return parsed.ZettaClipboard;
  if (parsed.zettaClipboard) return parsed.zettaClipboard;
  if (parsed.LogEvents || parsed.logEvents) return parsed;
  return null;
}

/**
 * Parse ZettaClipboard XML: LogEvents > LogEvent[] with LastStarted="true" = now, next = up next.
 */
function extractFromZettaClipboard(parsed) {
  const clipboard = findZettaClipboardRoot(parsed);
  if (!clipboard || typeof clipboard !== 'object') {
    return null;
  }
  const logEvents = clipboard.LogEvents || clipboard.logEvents;
  if (!logEvents) return null;

  let events = logEvents.LogEvent ?? logEvents.logEvent;
  if (!events) return null;
  if (!Array.isArray(events)) events = [events];

  let nowPlaying = null;
  let upNext = null;
  let currentIndex = -1;

  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    const isCurrent = (ev['@_LastStarted'] || ev.LastStarted) === 'true' || (ev['@_LastStarted'] || ev.LastStarted) === true;
    if (isCurrent) {
      nowPlaying = trackFromZettaLogEvent(ev);
      currentIndex = i;
      break;
    }
  }

  if (currentIndex >= 0) {
    const typeOf = (ev) => (ev.AssetEvent?.Asset?.['@_AssetTypeName'] ?? ev.AssetEvent?.Asset?.AssetTypeName ?? '').toLowerCase();
    for (let i = currentIndex + 1; i < events.length; i++) {
      const ev = events[i];
      const type = typeOf(ev);
      upNext = trackFromZettaLogEvent(ev);
      if (type === 'song') break;
    }
  } else if (events.length > 0) {
    // Fallback: no LastStarted found — treat first as now, next as up next
    nowPlaying = trackFromZettaLogEvent(events[0]);
    const typeOf = (ev) => (ev.AssetEvent?.Asset?.['@_AssetTypeName'] ?? ev.AssetEvent?.Asset?.AssetTypeName ?? '').toLowerCase();
    for (let i = 1; i < events.length; i++) {
      const ev = events[i];
      upNext = trackFromZettaLogEvent(ev);
      if (typeOf(ev) === 'song') break;
    }
  }

  const emptyTrack = () => ({ title: '', artist: '', artwork: null, description: '', startTime: '', stopTime: '' });
  if (!nowPlaying) nowPlaying = emptyTrack();
  if (!upNext) upNext = emptyTrack();
  return { nowPlaying, upNext };
}

/**
 * Extract current and next track from parsed XML object.
 * Supports ZettaClipboard (LogEvents/LogEvent) and simple nowplaying-style structures.
 */
function extractTracks(parsed) {
  if (!parsed || typeof parsed !== 'object') {
    return { nowPlaying: normalizeTrack(null), upNext: normalizeTrack(null) };
  }

  const zettaResult = extractFromZettaClipboard(parsed);
  if (zettaResult) return zettaResult;

  const root = parsed.nowplaying ?? parsed.NowPlaying ?? parsed.root ?? parsed;
  const obj = root && typeof root === 'object' ? root : parsed;

  let now = null;
  let next = null;

  const current = obj.current ?? obj.Current ?? obj.nowplaying ?? obj.NowPlaying ?? obj.track ?? obj.Track;
  const nextNode = obj.next ?? obj.Next ?? obj.upnext ?? obj.UpNext ?? obj.upcoming ?? obj.Upcoming;

  if (current) {
    if (Array.isArray(current)) now = current[0];
    else if (typeof current === 'object') now = current;
  }
  if (!now) now = findTrackInTree(obj);

  if (nextNode) {
    if (Array.isArray(nextNode)) next = nextNode[0];
    else if (typeof nextNode === 'object') next = nextNode;
  }
  if (!next && obj.nexttitle) {
    next = { title: obj.nexttitle, artist: obj.nextartist || obj.nextArtist || '' };
  }

  return {
    nowPlaying: normalizeTrack(now),
    upNext: normalizeTrack(next),
  };
}

/**
 * Fetch Zetta XML from URL and return parsed { nowPlaying, upNext }.
 * @param {string} url - Full URL to Zetta XML (e.g. nowplaying.xml)
 * @returns {Promise<{ nowPlaying: { title, artist, artwork }, upNext: { title, artist, artwork } }>}
 */
export async function fetchZettaNowPlaying(url) {
  if (!url || typeof url !== 'string') {
    throw new Error('ZETTA_MOODFM_XML_URL is not set');
  }
  const res = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/xml, text/xml, */*' },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) {
    throw new Error(`Zetta XML fetch failed: ${res.status} ${res.statusText}`);
  }
  const xml = await res.text();
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    trimValues: true,
  });
  let parsed;
  try {
    parsed = parser.parse(xml);
  } catch (parseErr) {
    throw new Error(`Invalid XML: ${parseErr.message}`);
  }
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('XML parsed to empty or non-object');
  }
  return extractTracks(parsed);
}

/**
 * Parse raw ZettaClipboard XML string and return { nowPlaying, upNext }.
 * Use this when XML is stored in DB (e.g. StaticInfo.streamingXml) instead of fetched from URL.
 */
export function parseZettaXmlString(xmlString) {
  if (!xmlString || typeof xmlString !== 'string' || !xmlString.trim()) {
    return {
      nowPlaying: { title: '', artist: '', artwork: null, description: '', startTime: '', stopTime: '' },
      upNext: { title: '', artist: '', artwork: null, description: '', startTime: '', stopTime: '' },
    };
  }
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    trimValues: true,
  });
  let parsed;
  try {
    parsed = parser.parse(xmlString.trim());
  } catch (parseErr) {
    throw new Error(`Invalid XML: ${parseErr.message}`);
  }
  if (!parsed || typeof parsed !== 'object') {
    return {
      nowPlaying: { title: '', artist: '', artwork: null, description: '', startTime: '', stopTime: '' },
      upNext: { title: '', artist: '', artwork: null, description: '', startTime: '', stopTime: '' },
    };
  }
  return extractTracks(parsed);
}

/**
 * Get Mood FM now playing data. Uses in-memory cache; refreshes every CACHE_TTL_MS.
 * Source: (1) xmlFromDb if provided, (2) else ZETTA_MOODFM_XML_URL. On error, returns last known if available.
 * @param {string|null} xmlFromDb - XML string from DB (optional)
 * @param {boolean} [skipCache=false] - If true, ignore cache and re-fetch/re-parse (e.g. ?refresh=1)
 */
export async function getMoodFmNowPlaying(xmlFromDb = null, skipCache = false) {
  const now = Date.now();
  if (!skipCache && cache && (now - cacheTime) < CACHE_TTL_MS) {
    return cache;
  }
  if (xmlFromDb && typeof xmlFromDb === 'string' && xmlFromDb.trim()) {
    try {
      const data = parseZettaXmlString(xmlFromDb);
      cache = data;
      cacheTime = now;
      return data;
    } catch (err) {
      if (cache) return cache;
      return {
        nowPlaying: { title: '', artist: '', artwork: null, description: '', startTime: '', stopTime: '' },
        upNext: { title: '', artist: '', artwork: null, description: '', startTime: '', stopTime: '' },
        _fallback: true,
        _error: err.message,
      };
    }
  }
  const url = process.env.ZETTA_MOODFM_XML_URL;
  if (!url || !url.trim()) {
    if (cache) return cache;
    return {
      nowPlaying: { title: '', artist: '', artwork: null, description: '', startTime: '', stopTime: '' },
      upNext: { title: '', artist: '', artwork: null, description: '', startTime: '', stopTime: '' },
      _fallback: true,
      _error: 'No Zetta source: set ZETTA_MOODFM_XML_URL in .env or save streamingXml in CMS (StaticInfo for Mood FM).',
    };
  }
  try {
    const data = await fetchZettaNowPlaying(url);
    cache = data;
    cacheTime = now;
    return data;
  } catch (err) {
    if (cache) return cache;
    return {
      nowPlaying: { title: '', artist: '', artwork: null, description: '', startTime: '', stopTime: '' },
      upNext: { title: '', artist: '', artwork: null, description: '', startTime: '', stopTime: '' },
      _fallback: true,
      _error: err.message,
    };
  }
}

export { CACHE_TTL_MS };
