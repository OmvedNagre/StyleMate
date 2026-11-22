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
  return <Screen title="Wear what you love." subtitle="Less deciding. More feeling like yourself.">
    <View style={ui.card}><Text style={ui.caption}>YOUR COLLECTION</Text><Text style={ui.heading}>{items.length} pieces. Endless possibility.</Text><Button title="Generate an outfit" onPress={() => router.push('/discover')} /></View>
    <Text accessibilityRole="header" style={ui.heading}>Recently added</Text>
    {items.length ? <ClothingGrid items={items.slice(0, 2)} /> : <StateCard title="A wardrobe waiting for you" description="Take a photo or choose one from your gallery." action="Add a piece" onAction={() => router.push('/clothing/add')} />}
    {suggestion ? <View style={ui.card}><Text style={ui.caption}>A STARTING POINT · COLLEGE / NORMAL WEATHER</Text><Text style={ui.heading}>{suggestion.name}</Text><Text style={ui.body}>Score {suggestion.score}/100, based on your saved attributes and recent wear.</Text><Button title="View suggested outfits" secondary onPress={() => router.push({ pathname: '/outfits/results', params: { style: preferredStyle } })} /></View> : <StateCard title="Build your collection" description={results.message} action="Open wardrobe" onAction={() => router.push('/wardrobe')} />}
  </Screen>;
}
