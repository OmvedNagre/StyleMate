import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Screen, StateCard, ui } from '../../components/ui';
import { GarmentArt } from '../../components/ClothingCard';
import { useDemo } from '../../demo/DemoContext';
export default function HistoryScreen() {
  const { history, items } = useDemo();
  return <Screen back title="Worn & remembered." subtitle="A little record of your everyday style.">{history.length ? history.map((entry) => <View key={entry.id} style={ui.card}><Text style={ui.heading}>Quiet essentials</Text><Text style={ui.body}>{new Date(entry.wornAt).toLocaleString()}</Text><Text style={ui.caption}>DEMO SNAPSHOT · As marked in this session</Text>{entry.items.map((item) => <View key={item.id} style={ui.section}><GarmentArt image={item.image} /><Text style={ui.label}>{item.name}</Text>{!items.some((current) => current.id === item.id) && <Text style={ui.caption}>No longer in your demo wardrobe</Text>}</View>)}</View>) : <StateCard title="Your story starts with a look" description="Mark the sample outfit as worn to add a temporary entry here." action="View sample outfit" onAction={() => router.push('/outfits/results')} />}</Screen>;
}
