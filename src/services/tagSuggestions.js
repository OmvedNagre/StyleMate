import { File } from 'expo-file-system';
import { fetch } from 'expo/fetch';
import { categories, colors, patterns, types } from '../constants/wardrobeOptions';

const trialEnabled = false;
const endpoint = trialEnabled && __DEV__ ? process.env.EXPO_PUBLIC_STYLEMATE_TAG_URL : undefined;
export const taggingAvailable = !!endpoint;

/** @param {string} uri */
export async function suggestTags(uri) {
  if (!endpoint) throw new Error('Tagging trial is unavailable.');
  const file = new File(uri);
  if (file.size > 5 * 1024 * 1024) throw new Error('Use a garment photo under 5 MB.');
  const extension = file.extension.toLowerCase();
  const mime = extension === '.jpg' ? 'image/jpeg' : 'image/' + extension.slice(1);
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'].includes(mime)) throw new Error('Try a JPEG, PNG, WebP, or HEIC photo.');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 35000);
  const { status, result } = await (async () => {
    try {
      const response = await fetch(endpoint.replace(/\/$/, '') + '/suggest', {
        method: 'POST', headers: { 'Content-Type': mime }, body: file, signal: controller.signal,
      });
      return { status: response.status, result: await response.json() };
    } catch {
      if (controller.signal.aborted) throw new Error('Tagging timed out after 35 seconds. Try a smaller photo or continue manually.');
      throw new Error('Could not reach the tagging server. Check Wi-Fi or continue manually.');
    } finally { clearTimeout(timer); }
  })();
  if (status === 403 && result.code === 'project_unavailable') throw new Error('This Gemini project has no free-tier access. Use an eligible project key or enable billing in Google AI Studio.');
  if (status === 403) throw new Error('Google denied access. Check the Gemini project and API key on the server.');
  if (status === 429) throw new Error('Tagging limit reached. Try again later or continue manually.');
  if (status === 504) throw new Error('Gemini took too long to respond. Try again or continue manually.');
  if (status < 200 || status >= 300) throw new Error('Suggestions are unavailable. Continue manually or try again.');
  const category = categories.includes(result.category) ? result.category : undefined;
  return {
    category,
    itemType: category && types[category]?.includes(result.itemType) ? result.itemType : undefined,
    color: colors.includes(result.color) ? result.color : undefined,
    pattern: patterns.includes(result.pattern) ? result.pattern : undefined,
  };
}
