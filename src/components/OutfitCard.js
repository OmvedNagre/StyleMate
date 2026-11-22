import { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { useDemo } from '../demo/DemoContext';
import { ClothingGrid } from './ClothingCard';
import { Button, ui } from './ui';

/** @param {{outfit: import('../utils/recommendationEngine').Outfit}} props */
export default function OutfitCard({ outfit }) {
  const demo = useDemo();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const lock = useRef(false);
  /** @param {() => Promise<void>} action */
  const perform = async (action) => {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError('');
    try { await action(); } catch { setError('Could not store this change. Please try again.'); }
    finally { lock.current = false; setBusy(false); }
  };
  const items = outfit.clothingIds.flatMap((id) => demo.items.filter((item) => item.id === id));
  const complete = items.length === outfit.clothingIds.length;
  const saved = demo.savedOutfits.some((entry) => entry.id === outfit.id);
  const worn = demo.wornIds.includes(outfit.id);
  return <View style={ui.card}>
    <Text style={ui.caption}>{outfit.legacy ? 'LEGACY SAMPLE · ILLUSTRATIVE SCORE' : 'RULE-BASED OUTFIT · SCORED AT GENERATION'}</Text>
    <Text accessibilityRole="header" style={ui.heading}>{outfit.name}</Text>
    <Text style={ui.label}>Score · {outfit.score}/100</Text>
    <ClothingGrid items={items} />
    {!complete && <Text style={ui.error}>An item in this outfit is no longer available. You can remove it from favorites or generate a new outfit.</Text>}
    <Text style={ui.caption}>Score and explanations are a snapshot. Regenerate after changing clothing attributes.</Text>
    {outfit.reasons.map((reason) => <Text key={reason} style={ui.body}>{reason}</Text>)}
    <Text accessibilityLiveRegion="polite" style={ui.error}>{error}</Text>
    <Button title={saved ? 'Remove from favorites' : 'Save outfit'} onPress={() => perform(() => demo.toggleSaved(outfit))} disabled={busy} secondary />
    <Button title={worn ? 'Marked worn this session' : 'Mark as worn'} disabled={busy || worn || !complete || outfit.legacy} onPress={() => perform(() => demo.markWorn({ ...outfit, items }))} />
  </View>;
}
