export const categories = ['topwear', 'bottomwear', 'footwear', 'accessory', 'outerwear'];
/** @type {Record<string, string[]>} */
export const types = {
  topwear: ['tShirt', 'shirt', 'polo', 'sweater', 'hoodie'],
  bottomwear: ['jeans', 'trousers', 'chinos', 'shorts', 'joggers'],
  footwear: ['sneakers', 'formalShoes', 'boots', 'sandals'],
  accessory: ['watch', 'belt', 'cap', 'bag'],
  outerwear: ['jacket', 'coat', 'overshirt'],
};
export const colors = ['black', 'white', 'grey', 'navy', 'blue', 'lightBlue', 'beige', 'brown', 'cream', 'olive', 'green', 'red', 'maroon', 'pink', 'yellow', 'other'];
export const styles = ['casual', 'smartCasual', 'formal', 'sporty', 'ethnic', 'versatile'];
export const patterns = ['plain', 'striped', 'checked', 'printed', 'textured', 'other'];
export const seasons = ['summer', 'winter', 'monsoon', 'allSeason'];
export const occasions = ['college', 'casual', 'formal', 'party', 'outing'];
export const weather = ['hot', 'normal', 'cold', 'rainy'];
/** @param {string} value */
export const label = (value) => value.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase());
