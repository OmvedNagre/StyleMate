import { generateOutfits, scoreOutfit, repetitionScore, combinationKey, CATEGORY_LIMIT } from '../src/utils/recommendationEngine';
import { matchColors } from '../src/utils/colorMatcher';
import { occasionScore, styleScore, weatherScore, normalizePreferences } from '../src/utils/compatibility';
import { colors, styles, occasions, weather } from '../src/constants/wardrobeOptions';

const now = Date.parse('2026-11-22T12:00:00Z');
const make = (id, category, overrides = {}) => ({ id, category, name: id, image: '', itemType: category === 'footwear' ? 'sneakers' : 'shirt', color: 'white', style: 'casual', pattern: 'plain', seasons: ['allSeason'], ...overrides });
const top = make('top', 'topwear', { color: 'navy' });
const bottom = make('bottom', 'bottomwear');
const run = (items, preferences = {}, history = []) => generateOutfits(items, preferences, history, now);
const historyAt = (days, items = [top, bottom]) => [{ items, wornAt: new Date(now - days * 86400000).toISOString() }];

test('worked example reaches 100 with a strong palette and no recent wear', () => {
  const outfit = run([top, bottom]).outfits[0];
  expect(outfit.breakdown).toEqual({ occasion: 30, color: 30, weather: 20, style: 10, repetition: 10 });
  expect(outfit.score).toBe(100);
  expect(outfit.items).toEqual([top, bottom]);
  expect(outfit.reasons).toContain('Color 30/30: Navy and White are a strong pairing in the color rules.');
});

test('color scores are symmetric, bounded, and unknown/same colors are not perfect', () => {
  for (const a of [...colors, 'ultraviolet']) for (const b of colors) {
    expect(matchColors(a, b).score).toBe(matchColors(b, a).score);
    expect(matchColors(a, b).score).toBeGreaterThanOrEqual(0);
    expect(matchColors(a, b).score).toBeLessThanOrEqual(30);
  }
  expect(matchColors('navy', 'white').score).toBe(30);
  expect(matchColors('navy', 'navy').score).toBe(20);
  expect(matchColors('unknown', 'white').score).toBe(18);
});

test('occasion and style maps distinguish matching, nearby and unknown values', () => {
  expect(occasionScore('formal', 'formal')).toBe(30);
  expect(occasionScore('sporty', 'formal')).toBe(8);
  expect(occasionScore('unknown', 'formal')).toBe(15);
  expect(styleScore('formal', 'any')).toBe(10);
  expect(styleScore('versatile', 'formal')).toBe(8);
  expect(styleScore('smartCasual', 'formal')).toBe(6);
  expect(styleScore('sporty', 'formal')).toBe(2);
});

test.each([['hot', ['summer'], 20], ['hot', ['winter'], 5], ['cold', ['winter'], 20], ['cold', ['summer'], 5], ['normal', ['summer'], 14], ['rainy', ['monsoon'], 18], ['rainy', ['allSeason'], 16], ['rainy', ['winter'], 5], ['normal', ['unknown'], 10]])('weather %s uses %s season labels', (condition, seasons, expected) => {
  expect(weatherScore({ ...top, seasons }, condition)).toBe(expected);
});

test('same inputs/reference time yield the same order, independent of input ordering; no mutation', () => {
  const items = [top, bottom, make('top2', 'topwear'), make('bottom2', 'bottomwear')];
  const before = JSON.stringify(items);
  const first = run(items);
  expect(run([...items].reverse())).toEqual(first);
  expect(run(items)).toEqual(first);
  expect(JSON.stringify(items)).toBe(before);
  expect(first.outfits).toHaveLength(3);
  expect(new Set(first.outfits.map((outfit) => outfit.id)).size).toBe(3);
});

test.each([[[]], [[top]], [[bottom]]])('insufficient wardrobe never fabricates an outfit', (items) => {
  expect(run(items).outfits).toEqual([]);
  expect(run(items).message).toMatch(/Add/);
});

test('one pair returns one result; duplicates cannot add a second top or bottom', () => {
  const result = run([top, top, bottom, bottom]);
  expect(result.outfits).toHaveLength(1);
  expect(result.outfits[0].clothingIds).toEqual(['top', 'bottom']);
});

test('formal filters sporty core items and explains how to recover', () => {
  const result = run([{ ...top, style: 'sporty' }, bottom], { occasion: 'formal' });
  expect(result.outfits).toEqual([]);
  expect(result.message).toContain('topwear');
});

test('footwear preference selects only compatible requested shoes or omits footwear', () => {
  const sneakers = make('sneakers', 'footwear');
  const boots = make('boots', 'footwear', { itemType: 'boots' });
  expect(run([top, bottom, sneakers, boots], { footwear: 'boots' }).outfits[0].clothingIds).toContain('boots');
  const outfit = run([top, bottom, sneakers], { footwear: 'boots' }).outfits[0];
  expect(outfit.clothingIds).toEqual(['top', 'bottom']);
  expect(outfit.reasons.join(' ')).toMatch(/footwear was omitted/);
  expect(outfit.score).toBe(100);
});

test('cold layers and accessories are bounded; winter coats stay out of hot outfits', () => {
  const extra = [make('coat', 'outerwear', { seasons: ['winter'] }), make('coat2', 'outerwear', { seasons: ['winter'] }), make('bag', 'accessory'), make('watch', 'accessory')];
  const cold = run([top, bottom, ...extra], { weather: 'cold' }).outfits[0];
  expect(cold.items.filter((item) => item.category === 'outerwear')).toHaveLength(1);
  expect(cold.items.filter((item) => item.category === 'accessory')).toHaveLength(1);
  expect(run([top, bottom, ...extra], { weather: 'hot' }).outfits[0].items.some((item) => item.category === 'outerwear')).toBe(false);
});

test('rainy explanations never promise waterproofing', () => {
  const outfit = run([top, bottom], { weather: 'rainy' }).outfits[0];
  expect(outfit.reasons).toContain('Season labels do not establish water resistance; no rain protection is assumed.');
  expect(outfit.breakdown.weather).toBe(16);
});

test.each([[0, 0], [3, 0], [3.01, 5], [7, 5], [7.01, 10]])('repeat at %s days yields %s points', (days, points) => {
  expect(repetitionScore(['top', 'bottom'], historyAt(days), now)).toBe(points);
});

test('repetition uses exact ID sets and ignores invalid/future timestamps', () => {
  expect(repetitionScore(['bottom', 'top'], historyAt(1), now)).toBe(0);
  expect(repetitionScore(['bottom', 'top', 'shoe'], historyAt(1), now)).toBe(10);
  expect(repetitionScore(['top', 'bottom'], [...historyAt(-1), { items: [top, bottom], wornAt: 'invalid' }], now)).toBe(10);
  expect(combinationKey(['a/b', 'c'])).not.toBe(combinationKey(['a', 'b/c']));
});

test('recent wear changes ranking predictably while keeping low/repeated options', () => {
  const items = [top, bottom, { ...top, id: 'top2' }];
  const first = run(items).outfits[0];
  const result = run(items, {}, historyAt(1, first.items));
  expect(result.outfits[0].id).not.toBe(first.id);
  expect(result.outfits.find((outfit) => outfit.id === first.id).score).toBe(first.score - 10);
  const repeated = run([top, bottom], {}, historyAt(1)).outfits[0];
  expect(repeated.score).toBe(90);
});

test('unknown attributes and lower-scoring combinations remain explainable and bounded', () => {
  const unknown = [{ ...top, color: 'unknown', style: 'unknown', seasons: null }, { ...bottom, style: 'ethnic', seasons: ['winter'] }];
  const outfit = run(unknown, { style: 'formal', weather: 'hot' }).outfits[0];
  expect(Number.isInteger(outfit.score)).toBe(true);
  expect(outfit.score).toBeGreaterThanOrEqual(0);
  expect(outfit.score).toBeLessThan(60);
  expect(outfit.reasons.join(' ')).toContain('lower-scoring');
});

test('all supported preferences keep component limits and one required item per category', () => {
  for (const occasion of occasions) for (const condition of weather) for (const style of ['any', ...styles]) {
    const result = run([top, bottom], { occasion, weather: condition, style });
    for (const outfit of result.outfits) {
      expect(outfit.score).toBe(Object.values(outfit.breakdown).reduce((a, b) => a + b, 0));
      expect(outfit.score).toBeLessThanOrEqual(100);
      expect(outfit.score).toBeGreaterThanOrEqual(0);
      expect(outfit.items.filter((item) => item.category === 'topwear')).toHaveLength(1);
      expect(outfit.items.filter((item) => item.category === 'bottomwear')).toHaveLength(1);
    }
  }
});

test('large wardrobe uses a disclosed bounded search', () => {
  const items = Array.from({ length: 100 }, (_, index) => [make(`top${index}`, 'topwear'), make(`bottom${index}`, 'bottomwear')]).flat();
  const result = run(items);
  expect(result.limited).toBe(true);
  expect(result.evaluated).toBe(CATEGORY_LIMIT ** 2);
  expect(result.outfits).toHaveLength(3);
});

test('malformed route values normalize to safe visible defaults', () => {
  expect(normalizePreferences({ occasion: ['formal'], weather: 'storm', style: 'invalid', footwear: 3 })).toEqual({ occasion: 'college', weather: 'normal', style: 'any', footwear: 'any' });
});

test('scoreOutfit rejects a missing required category', () => {
  expect(() => scoreOutfit([top], normalizePreferences({}), [], now)).toThrow('top and a bottom');
});
