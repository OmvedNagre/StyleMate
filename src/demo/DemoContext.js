import { createContext, useContext, useRef, useState } from 'react';
import { sampleClothing } from './data';

/** @typedef {import('./data').Clothing} Clothing */
/** @typedef {{id: string, wornAt: string, items: Clothing[]}} WearEntry */
/** @typedef {{items: Clothing[], saved: boolean, history: WearEntry[], worn: boolean, preferredStyle: string, setPreferredStyle: (value: string) => void, saveItem: (item: Clothing) => void, deleteItem: (id: string) => void, toggleSaved: () => void, markWorn: (items: Clothing[]) => void, reset: () => void, clear: () => void}} DemoState */
const DemoContext = createContext(/** @type {DemoState | null} */ (null));

/** @param {{children: import('react').ReactNode}} props */
export function DemoProvider({ children }) {
  const [items, setItems] = useState(sampleClothing);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState(/** @type {WearEntry[]} */ ([]));
  const [preferredStyle, setPreferredStyle] = useState('any');
  const [worn, setWorn] = useState(false);
  const wearLock = useRef(false);
  const reset = () => { setItems(sampleClothing); setSaved(false); setHistory([]); setWorn(false); wearLock.current = false; setPreferredStyle('any'); };
  return <DemoContext.Provider value={{ items, saved, history, worn, preferredStyle, setPreferredStyle,
    saveItem: (item) => setItems((current) => current.some((entry) => entry.id === item.id) ? current.map((entry) => entry.id === item.id ? item : entry) : [item, ...current]),
    deleteItem: (id) => setItems((current) => current.filter((entry) => entry.id !== id)),
    toggleSaved: () => setSaved((value) => !value),
    markWorn: (outfitItems) => {
      if (wearLock.current) return;
      wearLock.current = true;
      setHistory((current) => [{ id: `wear-${Date.now()}`, wornAt: new Date().toISOString(), items: outfitItems.map((item) => ({ ...item, seasons: [...item.seasons] })) }, ...current]);
      setWorn(true);
    },
    reset, clear: () => { reset(); setItems([]); },
  }}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const state = useContext(DemoContext);
  if (!state) throw new Error('Demo screens require DemoProvider.');
  return state;
}
