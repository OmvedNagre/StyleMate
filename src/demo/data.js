/** @typedef {{ id: string, name: string, category: string, itemType: string, color: string, style: string, pattern: string, seasons: string[], image: string, imageUri?: string }} Clothing */
/** @type {Clothing[]} */
export const sampleClothing = [
  { id: 'demo-shirt', name: 'The everyday shirt', category: 'topwear', itemType: 'shirt', color: 'cream', style: 'smartCasual', pattern: 'plain', seasons: ['allSeason'], image: 'shirt' },
  { id: 'demo-chinos', name: 'Weekend chinos', category: 'bottomwear', itemType: 'chinos', color: 'olive', style: 'smartCasual', pattern: 'plain', seasons: ['allSeason'], image: 'trousers' },
  { id: 'demo-knit', name: 'Soft navy knit', category: 'topwear', itemType: 'sweater', color: 'navy', style: 'casual', pattern: 'textured', seasons: ['winter'], image: 'knit' },
  { id: 'demo-jeans', name: 'Straight-leg denim', category: 'bottomwear', itemType: 'jeans', color: 'blue', style: 'casual', pattern: 'plain', seasons: ['allSeason'], image: 'jeans' },
  { id: 'demo-shoes', name: 'Clean white sneakers', category: 'footwear', itemType: 'sneakers', color: 'white', style: 'versatile', pattern: 'plain', seasons: ['allSeason'], image: 'shoes' },
];
