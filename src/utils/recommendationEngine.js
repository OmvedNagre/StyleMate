import { normalizePreferences, occasionScore, styleScore, weatherScore, eligible } from './compatibility';
import { matchColors } from './colorMatcher';
import { label } from '../constants/wardrobeOptions';

/** @typedef {import('../demo/data').Clothing} Clothing */
/** @typedef {import('./compatibility').Preferences} Preferences */
/** @typedef {{items: Clothing[], wornAt: string}} History */
/** @typedef {{id: string, name: string, clothingIds: string[], items: Clothing[], score: number, reasons: string[], preferences?: Preferences, breakdown?: {occasion: number, color: number, weather: number, style: number, repetition: number}, legacy?: boolean}} Outfit */
export const CATEGORY_LIMIT = 40;
/** @param {string} a @param {string} b */
const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
/** @param {string[]} ids */
export const combinationKey = (ids) => `outfit:${JSON.stringify([...new Set(ids)].sort(compare))}`;
/** @param {number[]} values */
const average = (values) => Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
/** Clock supplied explicitly: the same inputs and reference time always yield the same result.
 * @param {string[]} ids @param {History[]} history @param {number} now */
export function repetitionScore(ids, history, now) {
  const key = combinationKey(ids);
  let points = 10;
  for (const entry of history) {
    if (!Array.isArray(entry.items) || combinationKey(entry.items.map((item) => item.id)) !== key) continue;
    const age = now - Date.parse(entry.wornAt);
    if (!Number.isFinite(age) || age < 0) continue;
    if (age <= 3 * 86400000) points = 0;
    else if (age <= 7 * 86400000) points = Math.min(points, 5);
  }
  return points;
}
/** @param {Clothing[]} items @param {Preferences} prefs @param {History[]} history @param {number} now
 * @returns {Outfit} */
export function scoreOutfit(items, prefs, history, now) {
  const top = items.find((item) => item.category === 'topwear');
  const bottom = items.find((item) => item.category === 'bottomwear');
  if (!top || !bottom) throw new Error('An outfit needs a top and a bottom.');
  const color = matchColors(top.color, bottom.color);
  const core = [top, bottom];
  const outerwear = items.find((item) => item.category === 'outerwear');
  // Core weather is averaged. A suitable cold-weather layer adds two points, capped at 20.
  const weather = Math.min(20, average(core.map((item) => weatherScore(item, prefs.weather))) + (prefs.weather === 'cold' && outerwear ? 2 : 0));
  const ids = items.map((item) => item.id);
  const breakdown = {
    occasion: average(items.map((item) => occasionScore(item.style, prefs.occasion))),
    color: color.score, weather,
    style: average(items.map((item) => styleScore(item.style, prefs.style))),
    repetition: repetitionScore(ids, history, now),
  };
  const reasons = [
    `Occasion ${breakdown.occasion}/30: the selected items' style labels are rated for ${label(prefs.occasion)}.`,
    `Color ${breakdown.color}/30: ${color.reason}`,
    `Weather ${breakdown.weather}/20: based on the top and bottom's season labels for ${label(prefs.weather)}${prefs.weather === 'cold' && outerwear ? ', plus a compatible outer layer' : ''}.`,
    `Style ${breakdown.style}/10: ${prefs.style === 'any' ? 'no specific style was requested.' : `item styles are compared with ${label(prefs.style)}.`}`,
    `Repetition ${breakdown.repetition}/10: ${breakdown.repetition === 0 ? 'this exact combination was worn within 3 days.' : breakdown.repetition === 5 ? 'this exact combination was worn within 7 days.' : 'no wear of this exact combination was recorded in the last 7 days.'}`,
  ];
  if (prefs.weather === 'rainy') reasons.push('Season labels do not establish water resistance; no rain protection is assumed.');
  if (!items.some((item) => item.category === 'footwear')) reasons.push(prefs.footwear === 'any' ? 'No compatible footwear was selected from the evaluated items; footwear is optional.' : `No compatible ${label(prefs.footwear)} were selected from the evaluated items; footwear was omitted.`);
  const score = Object.values(breakdown).reduce((sum, value) => sum + value, 0);
  if (score < 60) reasons.push('This is a lower-scoring option from the available wardrobe. Try different preferences or add more pieces.');
  return { id: combinationKey(ids), name: `${top.name} + ${bottom.name}`, clothingIds: ids, items, score, breakdown, reasons, preferences: prefs };
}
/** @param {Clothing[]} wardrobe @param {Record<string, unknown>} preferences @param {History[]} history @param {number} now */
export function generateOutfits(wardrobe, preferences, history, now) {
  const prefs = normalizePreferences(preferences);
  // Duplicate input IDs cannot create multiple copies of a garment. DB IDs are unique.
  const unique = [...new Map(wardrobe.map((item) => [item.id, item])).values()].sort((a, b) => compare(a.id, b.id));
  const candidates = unique.filter((item) => eligible(item, prefs));
  /** @param {string} category */
  const all = (category) => candidates.filter((item) => item.category === category);
  const limited = ['topwear', 'bottomwear', 'footwear', 'outerwear', 'accessory'].some((category) => all(category).length > CATEGORY_LIMIT);
  /** @param {string} category */
  const group = (category) => all(category).slice(0, CATEGORY_LIMIT);
  const tops = group('topwear'); const bottoms = group('bottomwear');
  if (!tops.length || !bottoms.length) return { outfits: /** @type {Outfit[]} */ ([]), limited, evaluated: 0, message: `Add ${!tops.length && !bottoms.length ? 'at least one topwear and one bottomwear item' : !tops.length ? 'a topwear item' : 'a bottomwear item'} compatible with ${label(prefs.occasion)}, or choose a different occasion.` };
  const shoes = group('footwear').filter((item) => prefs.footwear === 'any' || item.itemType === prefs.footwear);
  const layers = group('outerwear').filter((item) => prefs.weather === 'cold' ? weatherScore(item, 'cold') >= 18 : prefs.weather === 'hot' ? false : weatherScore(item, prefs.weather) >= 14);
  const accessories = group('accessory');
  /** @type {Outfit[]} */
  const results = [];
  for (const top of tops) for (const bottom of bottoms) {
    const items = [top, bottom];
    // Choose one compatible optional item per category, never accessory permutations.
    for (const options of [shoes, layers, accessories]) {
      const compatible = options.filter((item) => occasionScore(item.style, prefs.occasion) >= 20 && styleScore(item.style, prefs.style) >= 6 && (item.category === 'accessory' || weatherScore(item, prefs.weather) >= 10) && matchColors(top.color, item.color).score >= 18 && matchColors(bottom.color, item.color).score >= 18);
      compatible.sort((a, b) => {
        const rank = (/** @type {Clothing} */ item) => occasionScore(item.style, prefs.occasion) + styleScore(item.style, prefs.style) + weatherScore(item, prefs.weather) + matchColors(top.color, item.color).score + matchColors(bottom.color, item.color).score;
        return rank(b) - rank(a) || compare(a.id, b.id);
      });
      if (compatible[0]) items.push(compatible[0]);
    }
    results.push(scoreOutfit(items, prefs, history, now));
  }
  results.sort((a, b) => b.score - a.score || compare(a.id, b.id));
  return { outfits: results.slice(0, 3), limited, evaluated: results.length, message: '' };
}
