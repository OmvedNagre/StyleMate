import { useLocalSearchParams, router } from 'expo-router';
import { Text, View } from 'react-native';
import { Screen, StateCard, ui } from '../../components/ui';
import OutfitCard from '../../components/OutfitCard';
import { useDemo } from '../../demo/DemoContext';
import { sampleOutfit } from '../../demo/data';
import { label } from '../../constants/wardrobeOptions';
export default function ResultsScreen() {
  const params = useLocalSearchParams();
  const { items } = useDemo();
  const available = sampleOutfit.clothingIds.every((id) => items.some((item) => item.id === id));
  return <Screen back title="Your outfit edit." subtitle="One sample look. A preview of what is to come.">
    <View style={ui.card}><Text style={ui.label}>Your selected preferences</Text>{['occasion', 'weather', 'style', 'footwear'].map((key) => <Text key={key} style={ui.body}>{label(key)}: {label(String(params[key] ?? ({ occasion: 'college', weather: 'normal', style: 'any', footwear: 'any' })[key]))}</Text>)}<Text style={ui.caption}>Preferences are displayed only. This fixed example and its score are not calculated from your choices or edits.</Text></View>
    {available ? <OutfitCard /> : <StateCard title="The sample look is incomplete" description="Restore the original demo pieces in Profile to explore this fixed example. Real outfit generation comes in Phase 4." action="Open Profile" onAction={() => router.push('/profile')} />}
  </Screen>;
}
