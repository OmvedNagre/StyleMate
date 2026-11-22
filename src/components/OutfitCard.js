import { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { sampleOutfit } from '../demo/data';
import { useDemo } from '../demo/DemoContext';
import { ClothingGrid } from './ClothingCard';
import { Button, ui } from './ui';

export default function OutfitCard() {
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
  const items = sampleOutfit.clothingIds.flatMap((id) => demo.items.filter((item) => item.id === id));
  const complete = items.length === sampleOutfit.clothingIds.length;
  return <View style={ui.card}>
    <Text style={ui.caption}>FIXED LAYOUT EXAMPLE · NOT A GENERATED RESULT</Text>
    <Text accessibilityRole="header" style={ui.heading}>{sampleOutfit.name}</Text>
    <Text style={ui.label}>Example score · {sampleOutfit.score}/100</Text>
    <ClothingGrid items={items} />
    {!complete && <Text style={ui.error}>An item in this sample outfit was removed. Restore demo data from Profile to see the full look.</Text>}
    <Text style={ui.caption}>Illustrative explanations, unchanged by edits or preferences:</Text>
    {sampleOutfit.reasons.map((reason) => <Text key={reason} style={ui.body}>{reason}</Text>)}
    <Text accessibilityLiveRegion="polite" style={ui.error}>{error}</Text>
    <Button title={demo.saved ? 'Remove from demo favorites' : 'Save demo outfit'} onPress={() => perform(demo.toggleSaved)} disabled={busy} secondary />
    <Button title={demo.worn ? 'Marked worn in this demo' : 'Mark demo outfit as worn'} disabled={busy || demo.worn || !complete} onPress={() => perform(() => demo.markWorn(items))} />
  </View>;
}
