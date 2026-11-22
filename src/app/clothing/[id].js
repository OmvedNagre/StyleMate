import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Text, View } from 'react-native';
import { Screen, StateCard, Button, ui } from '../../components/ui';
import { GarmentArt } from '../../components/ClothingCard';
import { useDemo } from '../../demo/DemoContext';
import { label } from '../../constants/wardrobeOptions';
export default function ClothingDetailsScreen() {
  const { id } = useLocalSearchParams();
  const demo = useDemo();
  const item = demo.items.find((entry) => entry.id === id);
  if (!item) return <Screen back title="Piece unavailable."><StateCard kind="error" title="We could not find this piece" description="It may have been removed or the demo reset." action="Open wardrobe" onAction={() => router.replace('/wardrobe')} /></Screen>;
  const remove = () => Alert.alert('Remove this demo piece?', 'This only changes the current demo session. History keeps its snapshot.', [
    { text: 'Keep piece', style: 'cancel' },
    { text: 'Remove', style: 'destructive', onPress: () => { demo.deleteItem(item.id); router.replace('/wardrobe'); } },
  ]);
  return <Screen back title={item.name} subtitle={`${label(item.category)} / ${label(item.itemType)}`}>
    <GarmentArt image={item.image} />
    <View style={ui.card}>{[['Color', item.color], ['Style', item.style], ['Pattern', item.pattern], ['Seasons', item.seasons.map(label).join(', ')]].map(([key, value]) => <View key={key} style={ui.section}><Text style={ui.caption}>{key}</Text><Text style={ui.label}>{label(value)}</Text></View>)}</View>
    <Button title="Edit demo piece" onPress={() => router.push({ pathname: '/clothing/edit', params: { id: item.id } })} />
    <Button title="Remove demo piece" danger onPress={remove} />
  </Screen>;
}
