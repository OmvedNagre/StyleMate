import { File } from 'expo-file-system';
import { fetch } from 'expo/fetch';
import { categories, colors, patterns, types } from '../constants/wardrobeOptions';

const endpoint = __DEV__ ? process.env.EXPO_PUBLIC_STYLEMATE_TAG_URL : undefined;
export const taggingAvailable = !!endpoint;

/** @param {string} uri */
export async function suggestTags(uri) {
  if (!endpoint) throw new Error('Tagging trial is unavailable.');
  const file = new File(uri);
  if (file.size > 5 * 1024 * 1024) throw new Error('Use a garment photo under 5 MB.');
  const extension = file.extension.toLowerCase();
  const mime = extension === '.jpg' ? 'image/jpeg' : 'image/' + extension.slice(1);
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'].includes(mime)) throw new Error('Try a JPEG, PNG, WebP, or HEIC photo.');
  const response = await fetch(endpoint.replace(/\/$/, '') + '/suggest', {
    method: 'POST', headers: { 'Content-Type': mime }, body: file,
  });
  if (response.status === 429) throw new Error('Tagging limit reached. Try again later or continue manually.');
  if (!response.ok) throw new Error('Suggestions are unavailable. Continue manually or try again.');
  const result = await response.json();
  const category = categories.includes(result.category) ? result.category : undefined;
  return {
    category,
    itemType: category && types[category]?.includes(result.itemType) ? result.itemType : undefined,
    color: colors.includes(result.color) ? result.color : undefined,
    pattern: patterns.includes(result.pattern) ? result.pattern : undefined,
  };
}
