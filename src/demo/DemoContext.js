import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { persistImage, removeImage } from '../services/imageService';
import { getRepository } from '../services/database';
import { Screen, StateCard } from '../components/ui';

/** @typedef {import('./data').Clothing} Clothing */
/** @typedef {{id: string, wornAt: string, items: Clothing[], outfitId?: string}} WearEntry */
/** @typedef {import('../utils/recommendationEngine').Outfit} Outfit */
/** @typedef {{items: Clothing[], savedOutfits: Outfit[], history: WearEntry[], preferredStyle: string}} StoredState */
/** @typedef {StoredState & {wornIds: string[], setPreferredStyle: (value: string) => Promise<void>, saveItem: (item: Clothing) => Promise<void>, deleteItem: (id: string) => Promise<void>, toggleSaved: (outfit: Outfit) => Promise<void>, markWorn: (outfit: Outfit, repeat?: boolean) => Promise<void>, reset: () => Promise<void>, clear: () => Promise<void>}} WardrobeState */
const DemoContext = createContext(/** @type {WardrobeState | null} */ (null));

/** Historical name retained for route compatibility; state is now backed by SQLite.
 * @param {{children: import('react').ReactNode}} props */
export function DemoProvider({ children }) {
  const [state, setState] = useState(/** @type {StoredState} */ ({ items: [], savedOutfits: [], history: [], preferredStyle: 'any' }));
  const current = useRef(state);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [wornIds, setWornIds] = useState(/** @type {string[]} */ ([]));
  const wearLock = useRef(new Set());
  const queue = useRef(Promise.resolve());
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const repository = await getRepository();
        await repository.cleanup(removeImage);
        const loaded = await repository.load();
        if (active) { current.current = loaded; setState(loaded); setReady(true); }
      } catch { if (active) setError('Could not open your wardrobe. Your stored data has not been reset. Retry to open it again.'); }
    })();
    return () => { active = false; };
  }, [attempt]);
  /** Serialize mutations so rapid actions cannot overwrite newer state.
   * @param {(repository: Awaited<ReturnType<typeof getRepository>>) => Promise<void>} action */
  const mutate = (action) => {
    const next = queue.current.then(async () => {
      const repository = await getRepository();
      await action(repository);
      // A committed mutation stays committed even if refresh or cleanup fails.
      try { const loaded = await repository.load(); current.current = loaded; setState(loaded); }
      catch { setError('Your change was stored, but the wardrobe could not refresh. Retry to reload it.'); }
      try { await repository.cleanup(removeImage); } catch { /* Durable cleanup queue will retry at launch. */ }
    });
    queue.current = next.catch(() => {});
    return next;
  };
  if (error || !ready) return <Screen title="Your wardrobe."><StateCard kind={error ? 'error' : 'loading'} title={error ? 'Storage needs attention' : 'Opening your collection'} description={error || 'Reading your wardrobe from this device.'} action={error ? 'Retry' : undefined} onAction={error ? () => { setError(''); setReady(false); setAttempt((value) => value + 1); } : undefined} /></Screen>;
  return <DemoContext.Provider value={{ ...state, wornIds,
    saveItem: (item) => mutate(async (repository) => {
      const previous = current.current.items.find((entry) => entry.id === item.id);
      let imageUri = item.imageUri;
      const newPhoto = !!imageUri && imageUri !== previous?.imageUri;
      if (newPhoto && imageUri) imageUri = await persistImage(imageUri);
      try { await repository.saveItem({ ...item, imageUri }); }
      catch (error) {
        if (newPhoto && imageUri) { try { await removeImage(imageUri); } catch { /* An unreferenced copy is safer than deleting the existing photo. */ } }
        throw error;
      }
    }),
    deleteItem: (id) => mutate((repository) => repository.deleteItem(id)),
    toggleSaved: (outfit) => mutate((repository) => repository.setFavorite(outfit, !current.current.savedOutfits.some((entry) => entry.id === outfit.id))),
    setPreferredStyle: (value) => mutate((repository) => repository.setStyle(value)),
    markWorn: async (outfit, repeat = false) => {
      if (wearLock.current.has(outfit.id)) return;
      if (!repeat && current.current.history.some((entry) => entry.outfitId === outfit.id)) return;
      wearLock.current.add(outfit.id);
      const wornAt = new Date().toISOString();
      try {
        await mutate((repository) => repository.markWorn({ id: `wear-${Date.now()}-${Math.random().toString(36).slice(2)}`, wornAt, outfitId: outfit.id, items: outfit.items.map((item) => ({ ...item, seasons: [...item.seasons] })) }, outfit));
        setWornIds((ids) => [...new Set([...ids, outfit.id])]);
      } finally { wearLock.current.delete(outfit.id); }
    },
    reset: () => mutate((repository) => repository.addSamples()),
    clear: () => mutate((repository) => repository.hideSamples()),
  }}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const state = useContext(DemoContext);
  if (!state) throw new Error('Wardrobe screens require DemoProvider.');
  return state;
}
