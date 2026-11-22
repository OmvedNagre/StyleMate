import { useRef, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Text, View } from 'react-native';
import { Screen, StateCard, Button, ui } from '../../components/ui';
import { ClothingImage } from '../../components/ClothingCard';
import { useDemo } from '../../demo/DemoContext';
import { label } from '../../constants/wardrobeOptions';
export default function ClothingDetailsScreen() {
  const { id } = useLocalSearchParams();
  const demo = useDemo();
  const removing = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const item = demo.items.find((entry) => entry.id === id);
  if (!item) return <Screen back title="Piece unavailable."><StateCard kind="error" title="We could not find this piece" description="It may have been removed or the demo reset." action="Open wardrobe" onAction={() => router.replace('/wardrobe')} /></Screen>;
  const remove = () => Alert.alert('Remove this piece?', 'Its app-managed photo will be removed (cleanup retries later if needed). The original gallery photo is untouched. History keeps its text snapshot.', [
    { text: 'Keep piece', style: 'cancel' },
    { text: 'Remove', style: 'destructive', onPress: async () => {
      if (removing.current) return;
      removing.current = true; setBusy(true); setError('');
      try { await demo.deleteItem(item.id); router.replace('/wardrobe'); }
      catch { setError('Could not remove this piece from storage. Please try again.'); }
      finally { removing.current = false; setBusy(false); }
    } },
  ]);
  return <Screen back title={item.name} subtitle={`${label(item.category)} / ${label(item.itemType)}`}>
    <ClothingImage image={item.image} imageUri={item.imageUri} />
    <View style={ui.card}>{[['Color', item.color], ['Style', item.style], ['Pattern', item.pattern], ['Seasons', item.seasons.map(label).join(', ')]].map(([key, value]) => <View key={key} style={ui.section}><Text style={ui.caption}>{key}</Text><Text style={ui.label}>{label(value)}</Text></View>)}</View>
    <Text accessibilityLiveRegion="polite" style={ui.error}>{error}</Text>
    <Button title="Edit piece" disabled={busy} onPress={() => router.push({ pathname: '/clothing/edit', params: { id: item.id } })} />
    <Button title={busy ? "Removing…" : "Remove piece"} disabled={busy} danger onPress={remove} />
  </Screen>;
}
