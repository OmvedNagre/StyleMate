import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Screen, StateCard, ui } from '../../components/ui';
import { ClothingImage } from '../../components/ClothingCard';
import { useDemo } from '../../demo/DemoContext';
export default function HistoryScreen() {
  const { history, items } = useDemo();
  return <Screen back title="Worn & remembered." subtitle="A little record of your everyday style.">{history.length ? history.map((entry) => <View key={entry.id} style={ui.card}><Text style={ui.heading}>Worn outfit</Text><Text style={ui.body}>{new Date(entry.wornAt).toLocaleString()}</Text><Text style={ui.caption}>OUTFIT SNAPSHOT · Saved on this device</Text>{entry.items.map((item) => <View key={item.id} style={ui.section}><ClothingImage image={item.image} imageUri={item.imageUri} /><Text style={ui.label}>{item.name}</Text>{!items.some((current) => current.id === item.id) && <Text style={ui.caption}>No longer in your wardrobe</Text>}</View>)}</View>) : <StateCard title="Your story starts with a look" description="Mark an outfit as worn to add a saved entry here." action="Generate an outfit" onAction={() => router.push('/discover')} />}</Screen>;
}
