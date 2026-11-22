import { occasions, weather, styles } from '../constants/wardrobeOptions';
/** @typedef {{occasion: string, weather: string, style: string, footwear: string}} Preferences */
/** @type {Record<string, {strong: string[], possible: string[]}>} */
export const occasionRules = {
  college: { strong: ['casual', 'smartCasual', 'versatile'], possible: ['sporty'] },
  casual: { strong: ['casual', 'versatile'], possible: ['smartCasual', 'sporty'] },
  formal: { strong: ['formal', 'smartCasual'], possible: ['versatile'] },
  party: { strong: ['smartCasual', 'formal', 'casual'], possible: ['versatile', 'ethnic'] },
  outing: { strong: ['casual', 'smartCasual', 'versatile'], possible: ['sporty'] },
};
/** @type {Record<string, string[]>} */
const closeStyles = { casual: ['smartCasual', 'sporty'], smartCasual: ['casual', 'formal'], formal: ['smartCasual'], sporty: ['casual'], ethnic: [], versatile: ['casual', 'smartCasual', 'formal', 'sporty', 'ethnic'] };
/** Unrecognized route values fall back to visible defaults, never enter rules unchecked.
 * @param {Record<string, unknown>} input
 * @returns {Preferences} */
export function normalizePreferences(input = {}) {
  /** @param {string} key @param {string[]} allowed @param {string} fallback */
  const valid = (key, allowed, fallback) => typeof input[key] === 'string' && allowed.includes(input[key]) ? input[key] : fallback;
  return { occasion: valid('occasion', occasions, 'college'), weather: valid('weather', weather, 'normal'), style: valid('style', ['any', ...styles], 'any'), footwear: valid('footwear', ['any', 'sneakers', 'formalShoes', 'boots', 'sandals'], 'any') };
}
/** @param {string} style @param {string} occasion */
export function occasionScore(style, occasion) {
  const rule = occasionRules[occasion] ?? occasionRules.college;
  if (rule.strong.includes(style)) return 30;
  if (rule.possible.includes(style)) return 20;
  return styles.includes(style) ? 8 : 15;
}
/** @param {string} style @param {string} preferred */
export function styleScore(style, preferred) {
  if (preferred === 'any' || style === preferred) return 10;
  if (style === 'versatile') return 8;
  if (closeStyles[preferred]?.includes(style)) return 6;
  return styles.includes(style) ? 2 : 5;
}
/** @param {import('../demo/data').Clothing} item @param {string} condition */
export function weatherScore(item, condition) {
  const seasons = Array.isArray(item.seasons) ? item.seasons : [];
  if (condition === 'rainy') {
    if (seasons.includes('monsoon')) return 18;
    if (seasons.includes('allSeason')) return 16;
    return seasons.length === 1 && seasons[0] === 'winter' ? 5 : 10;
  }
  if (seasons.includes('allSeason')) return 20;
  if (condition === 'normal') return seasons.some((season) => ['summer', 'winter', 'monsoon'].includes(season)) ? 14 : 10;
  if (seasons.includes(condition === 'hot' ? 'summer' : 'winter')) return 20;
  if (seasons.includes(condition === 'hot' ? 'winter' : 'summer')) return 5;
  return 10;
}
/** Only one hard occasion exclusion; softer mismatches remain ranked candidates.
 * @param {import('../demo/data').Clothing} item @param {Preferences} preferences */
export const eligible = (item, preferences) => !(preferences.occasion === 'formal' && item.style === 'sporty');
