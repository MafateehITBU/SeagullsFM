/**
 * Stream / Now Playing API (Mood FM only).
 * GET /api/stream/moodfm returns cached Zetta metadata as JSON.
 * Source: (1) StaticInfo.streamingXml for Mood FM channel if set in CMS, (2) else ZETTA_MOODFM_XML_URL from .env.
 */

import { getMoodFmNowPlaying, fetchZettaNowPlaying } from '../utils/zettaStream.js';
import Channel from '../models/Channel.js';
import StaticInfo from '../models/StaticInfo.js';

const MOOD_FM_CHANNEL_NAMES = ['MoodFM', 'Mood FM', 'Mood 92', 'moodfm', 'MoodFm'];

/**
 * Find Mood FM channel by name (try several variants).
 */
async function findMoodFmChannel() {
  for (const name of MOOD_FM_CHANNEL_NAMES) {
    const ch = await Channel.findOne({ name }).lean();
    if (ch) return ch;
  }
  return null;
}

/**
 * @desc    Get Mood FM now playing & up next (from Zetta XML, cached)
 * @route   GET /api/stream/moodfm
 * @access  Public
 */
export const getMoodFmStream = async (req, res) => {
  try {
    let xmlFromDb = null;
    if (!process.env.ZETTA_MOODFM_XML_URL || !process.env.ZETTA_MOODFM_XML_URL.trim()) {
      const moodChannel = await findMoodFmChannel();
      if (moodChannel) {
        const staticInfo = await StaticInfo.findOne({ channelId: moodChannel._id }).lean();
        if (staticInfo?.streamingXml?.trim()) {
          xmlFromDb = staticInfo.streamingXml;
        }
      }
    }
    const skipCache = req.query.refresh === '1' || req.query.refresh === 'true';
    const data = await getMoodFmNowPlaying(xmlFromDb, skipCache);
    res.json({
      success: true,
      data: {
        nowPlaying: data.nowPlaying ?? { title: '', artist: '', artwork: null },
        upNext: data.upNext ?? { title: '', artist: '', artwork: null },
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stream metadata',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

/**
 * @desc    Debug: why is stream empty? Shows channel, staticInfo, streamingXml length.
 * @route   GET /api/stream/moodfm/status
 * @access  Public
 */
export const getMoodFmStreamStatus = async (req, res) => {
  try {
    const hasUrl = !!(process.env.ZETTA_MOODFM_XML_URL && process.env.ZETTA_MOODFM_XML_URL.trim());
    const moodChannel = await findMoodFmChannel();
    let staticInfo = null;
    let streamingXmlLength = 0;
    if (moodChannel) {
      staticInfo = await StaticInfo.findOne({ channelId: moodChannel._id }).lean();
      if (staticInfo?.streamingXml) {
        streamingXmlLength = staticInfo.streamingXml.length;
      }
    }
    res.json({
      success: true,
      source: hasUrl ? 'url (ZETTA_MOODFM_XML_URL)' : (streamingXmlLength > 0 ? 'db' : 'none'),
      channelFound: !!moodChannel,
      channelId: moodChannel?._id?.toString() ?? null,
      channelName: moodChannel?.name ?? null,
      staticInfoFound: !!staticInfo,
      streamingXmlLength,
      hint: !moodChannel
        ? 'No channel named MoodFM / Mood FM / moodfm in DB. Create or rename channel.'
        : !staticInfo
          ? 'No StaticInfo for this channel. Create static info first (e.g. via CMS).'
          : streamingXmlLength === 0
            ? 'streamingXml is empty. PUT /api/staticinfo/' + moodChannel._id + ' with form key "streamingXml" and your ZettaClipboard XML as value.'
            : 'Data should be available. GET /api/stream/moodfm should return nowPlaying/upNext.',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

/**
 * @desc    Debug: fetch Zetta URL once and return result or error (no cache)
 * @route   GET /api/stream/moodfm/debug
 * @access  Public (disable in production if desired)
 */
export const getMoodFmStreamDebug = async (req, res) => {
  const url = process.env.ZETTA_MOODFM_XML_URL;
  if (!url) {
    return res.status(500).json({
      success: false,
      error: 'ZETTA_MOODFM_XML_URL is not set in .env',
      hint: 'Add ZETTA_MOODFM_XML_URL=<full URL to your Zetta XML> to backend/.env',
    });
  }
  try {
    const data = await fetchZettaNowPlaying(url);
    res.json({
      success: true,
      urlSet: true,
      data: {
        nowPlaying: data.nowPlaying,
        upNext: data.upNext,
      },
    });
  } catch (err) {
    res.status(502).json({
      success: false,
      urlSet: true,
      error: err.message,
      hint: 'Check that the URL is reachable from this server and returns valid ZettaClipboard XML.',
    });
  }
};
