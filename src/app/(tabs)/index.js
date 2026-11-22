import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Screen, Button, StateCard, ui } from '../../components/ui';
import { ClothingGrid } from '../../components/ClothingCard';
import { useDemo } from '../../demo/DemoContext';
import { sampleOutfit } from '../../demo/data';

export default function HomeScreen() {
  const { items } = useDemo();
  const hasExample = sampleOutfit.clothingIds.every((id) => items.some((item) => item.id === id));
  return <Screen title="Wear what you love." subtitle="Less deciding. More feeling like yourself.">
    <View style={ui.card}><Text style={ui.caption}>YOUR COLLECTION</Text><Text style={ui.heading}>{items.length} demo pieces. Endless possibility.</Text><Button title="Explore an outfit preview" onPress={() => router.push('/discover')} /></View>
    <Text accessibilityRole="header" style={ui.heading}>Recently added</Text>
    {items.length ? <ClothingGrid items={items.slice(0, 2)} /> : <StateCard title="A wardrobe waiting for you" description="Try the clothing form with a sample illustration." action="Add a demo piece" onAction={() => router.push('/clothing/add')} />}
    {hasExample ? <View style={ui.card}><Text style={ui.caption}>THE SAMPLE EDIT</Text><Text style={ui.heading}>Quiet essentials</Text><Text style={ui.body}>Cream, olive, and a little everyday ease. A fixed example for exploring the outfit layout.</Text><Button title="View sample outfit" secondary onPress={() => router.push('/outfits/results')} /></View> : <StateCard title="Build your collection" description="The fixed outfit preview needs its original sample pieces. Restore them in Profile or keep exploring the clothing form." action="Open Profile" onAction={() => router.push('/profile')} />}
  </Screen>;
}
