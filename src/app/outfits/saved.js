import { router } from 'expo-router';
import { Screen, StateCard } from '../../components/ui';
import OutfitCard from '../../components/OutfitCard';
import { useDemo } from '../../demo/DemoContext';
export default function SavedScreen() {
  const { savedOutfits } = useDemo();
  return <Screen back title="Keep a good look." subtitle="Your favorites, ready for another day.">{savedOutfits.length ? savedOutfits.map((outfit) => <OutfitCard key={outfit.id} outfit={outfit} />) : <StateCard title="A place for your favorites" description="Save a generated outfit to find it here. Favorites are saved on this device." action="Explore Discover" onAction={() => router.push('/discover')} />}</Screen>;
}
