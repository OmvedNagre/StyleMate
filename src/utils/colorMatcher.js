import { colors, label } from '../constants/wardrobeOptions';
const neutrals = new Set(['black', 'white', 'grey', 'beige', 'cream', 'navy', 'brown']);
const strongPairs = new Set(['black/white', 'black/grey', 'beige/black', 'navy/white', 'beige/navy', 'blue/white', 'beige/olive', 'black/olive', 'grey/white', 'brown/cream', 'black/maroon', 'lightBlue/white']);
/** Symmetric, intentionally small fashion heuristic.
 * @param {string} first @param {string} second */
export function matchColors(first, second) {
  if (![first, second].every((color) => colors.includes(color) && color !== 'other')) return { score: 18, reason: 'An unspecified color receives a neutral score.' };
  const pair = [first, second].sort().join('/');
  if (strongPairs.has(pair)) return { score: 30, reason: `${label(first)} and ${label(second)} are a strong pairing in the color rules.` };
  if (first === second) return { score: 20, reason: `Both main pieces are ${label(first)}; same-color looks receive a moderate score.` };
  if (neutrals.has(first) || neutrals.has(second)) return { score: 25, reason: 'At least one main piece has a neutral color, making this an easy pairing in the rules.' };
  return { score: 15, reason: 'This color pair is not a preferred match in the simple palette rules.' };
}
