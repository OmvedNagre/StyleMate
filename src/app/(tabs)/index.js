import { profile } from '../../constants/profile';
import { router } from 'expo-router';
import { useReferenceTime } from '../../hooks/useReferenceTime';
import { Text, View } from 'react-native';
import { Screen, Button, StateCard, ui } from '../../components/ui';
import { ClothingGrid } from '../../components/ClothingCard';
import { useDemo } from '../../demo/DemoContext';
import { generateOutfits } from '../../utils/recommendationEngine';
export default function HomeScreen() {
  const { items, history, preferredStyle } = useDemo();
  const now = useReferenceTime(history);
  const results = generateOutfits(items, { occasion: 'college', weather: 'normal', style: preferredStyle, footwear: 'any' }, history, now);
  const suggestion = results.outfits[0];
  return <Screen title={`Hi, ${profile.name}`} subtitle="What are you wearing today?">
    <View style={ui.card}><Button title="Find an outfit" onPress={() => router.push('/discover')} /><Button title="Add clothing" secondary onPress={() => router.push('/clothing/add')} /></View>
    {suggestion ? <View style={ui.card}><Text style={ui.label}>Suggested outfit</Text><Text style={ui.heading}>{suggestion.name}</Text><Text style={ui.body}>{suggestion.score}/100 · College · Normal weather</Text><ClothingGrid items={suggestion.items.slice(0, 2)} /><Button title="View suggested outfits" secondary onPress={() => router.push({ pathname: '/outfits/results', params: { style: preferredStyle } })} /></View> : <StateCard title="Build your collection" description={results.message} action="Open wardrobe" onAction={() => router.push('/wardrobe')} />}
    {!!items.length && <View style={ui.section}><Text accessibilityRole="header" style={ui.heading}>Recently added</Text><ClothingGrid items={items.slice(0, 2)} /></View>}
  </Screen>;
}
