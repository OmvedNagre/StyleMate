import { useRef, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useDemo } from '../demo/DemoContext';
import { router } from 'expo-router';
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
  const complete = items.length === outfit.clothingIds.length && items.filter((item) => item.category === 'topwear').length === 1 && items.filter((item) => item.category === 'bottomwear').length === 1;
  const saved = demo.savedOutfits.some((entry) => entry.id === outfit.id);
  const lastWear = demo.history.find((entry) => entry.outfitId === outfit.id);
  const worn = !!lastWear || demo.wornIds.includes(outfit.id);
  const missing = outfit.clothingIds.filter((id) => !items.some((item) => item.id === id));
  const recordWear = () => {
    const action = () => perform(() => demo.markWorn({ ...outfit, items }, worn));
    if (worn) Alert.alert('Wear this outfit again?', 'This adds a new history entry dated now. The previous entry stays unchanged.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Record another wear', onPress: action }]);
    else action();
  };
  return <View style={ui.card}>
    <Text style={ui.caption}>{outfit.legacy ? 'LEGACY SAMPLE · ILLUSTRATIVE SCORE' : 'RULE-BASED OUTFIT · SCORED AT GENERATION'}</Text>
    <Text accessibilityRole="header" style={ui.heading}>{outfit.name}</Text>
    <Text style={ui.label}>Score · {outfit.score}/100</Text>
    <ClothingGrid items={items} />
    {missing.map((id) => <Text key={id} style={ui.body}>{outfit.items.find((item) => item.id === id)?.name ?? 'A saved piece'} · No longer in your wardrobe</Text>)}
    {lastWear && <Text style={ui.caption}>Last worn: {new Date(lastWear.wornAt).toLocaleString()}</Text>}
    {!complete && <Text style={ui.error}>An item in this outfit is no longer available or its category has changed. You can remove it from favorites or generate a new outfit.</Text>}
    <Text style={ui.caption}>Score and explanations are a snapshot. Regenerate after changing clothing attributes.</Text>
    {outfit.reasons.map((reason) => <Text key={reason} style={ui.body}>{reason}</Text>)}
    <Button title="Generate fresh suggestions" secondary onPress={() => router.push('/discover')} />
    <Text accessibilityLiveRegion="polite" style={ui.error}>{error}</Text>
    <Button title={saved ? 'Remove from favorites' : 'Save outfit'} onPress={() => perform(() => demo.toggleSaved(outfit))} disabled={busy} secondary />
    <Button title={worn ? 'Wear again…' : 'Mark as worn'} disabled={busy || !complete || outfit.legacy} onPress={recordWear} />
  </View>;
}
