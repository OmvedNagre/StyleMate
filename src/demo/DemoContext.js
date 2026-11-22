import { createContext, useContext, useRef, useState } from 'react';
import { persistImage, removeImage } from '../services/imageService';
import { sampleClothing } from './data';

/** @typedef {import('./data').Clothing} Clothing */
/** @typedef {{id: string, wornAt: string, items: Clothing[]}} WearEntry */
/** @typedef {{items: Clothing[], saved: boolean, history: WearEntry[], worn: boolean, preferredStyle: string, setPreferredStyle: (value: string) => void, saveItem: (item: Clothing) => Promise<void>, deleteItem: (id: string) => Promise<void>, toggleSaved: () => void, markWorn: (items: Clothing[]) => void, reset: () => void, clear: () => void}} DemoState */
const DemoContext = createContext(/** @type {DemoState | null} */ (null));

/** @param {{children: import('react').ReactNode}} props */
export function DemoProvider({ children }) {
  const [items, setItems] = useState(sampleClothing);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState(/** @type {WearEntry[]} */ ([]));
  const [preferredStyle, setPreferredStyle] = useState('any');
  const [worn, setWorn] = useState(false);
  const wearLock = useRef(false);
  const reset = () => { setItems((current) => [...current.filter((item) => item.imageUri || !item.id.startsWith('demo-')), ...sampleClothing.filter((sample) => !current.some((item) => item.id === sample.id && item.imageUri))]); setSaved(false); setHistory([]); setWorn(false); wearLock.current = false; setPreferredStyle('any'); };
  return <DemoContext.Provider value={{ items, saved, history, worn, preferredStyle, setPreferredStyle,
    saveItem: async (item) => {
      const previous = items.find((entry) => entry.id === item.id);
      let imageUri = item.imageUri;
      if (imageUri && imageUri !== previous?.imageUri) {
        imageUri = await persistImage(imageUri);
        try { if (previous?.imageUri) await removeImage(previous.imageUri); }
        catch { await removeImage(imageUri); throw new Error('Could not replace the old photo. Please try again.'); }
      }
      const stored = { ...item, imageUri };
      setItems((current) => current.some((entry) => entry.id === item.id) ? current.map((entry) => entry.id === item.id ? stored : entry) : [stored, ...current]);
    },
    deleteItem: async (id) => {
      const item = items.find((entry) => entry.id === id);
      if (item?.imageUri) await removeImage(item.imageUri);
      setItems((current) => current.filter((entry) => entry.id !== id));
    },
    toggleSaved: () => setSaved((value) => !value),
    markWorn: (outfitItems) => {
      if (wearLock.current) return;
      wearLock.current = true;
      setHistory((current) => [{ id: `wear-${Date.now()}`, wornAt: new Date().toISOString(), items: outfitItems.map((item) => ({ ...item, seasons: [...item.seasons] })) }, ...current]);
      setWorn(true);
    },
    reset, clear: () => { reset(); setItems((current) => current.filter((item) => item.imageUri || !item.id.startsWith('demo-'))); },
  }}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const state = useContext(DemoContext);
  if (!state) throw new Error('Demo screens require DemoProvider.');
  return state;
}
