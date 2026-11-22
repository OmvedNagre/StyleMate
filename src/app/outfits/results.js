import { useReferenceTime } from '../../hooks/useReferenceTime';
import { useLocalSearchParams, router } from 'expo-router';
import { Text, View } from 'react-native';
import { Screen, StateCard, ui } from '../../components/ui';
import OutfitCard from '../../components/OutfitCard';
import { useDemo } from '../../demo/DemoContext';
import { generateOutfits } from '../../utils/recommendationEngine';
import { normalizePreferences } from '../../utils/compatibility';
import { label } from '../../constants/wardrobeOptions';
export default function ResultsScreen() {
  const params = useLocalSearchParams();
  const { items, history } = useDemo();
  const preferences = normalizePreferences(params);
  const { occasion, weather, style, footwear } = preferences;
  const now = useReferenceTime(history);
  const results = generateOutfits(items, { occasion, weather, style, footwear }, history, now);
  return <Screen back title="Your outfit edit." subtitle="Made from what you own. Explained, piece by piece.">
    <View style={ui.card}><Text style={ui.label}>Your selected preferences</Text>{Object.entries(preferences).map(([key, value]) => <Text key={key} style={ui.body}>{label(key)}: {label(value)}</Text>)}<Text style={ui.caption}>Scores are simple wardrobe heuristics, not fashion facts. {results.evaluated} combinations evaluated.</Text></View>
    {results.limited && <Text style={ui.caption}>Large wardrobe: this search considers up to 40 eligible pieces per category in stable ID order. These are the best of the evaluated combinations.</Text>}
    {results.outfits.length ? results.outfits.map((outfit) => <OutfitCard key={outfit.id} outfit={outfit} />) : <StateCard title="A few more pieces to work with" description={results.message} action="Open wardrobe" onAction={() => router.push('/wardrobe')} />}
  </Screen>;
}
