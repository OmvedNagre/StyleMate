import { router } from 'expo-router';
import { Screen, StateCard } from '../../components/ui';
import OutfitCard from '../../components/OutfitCard';
import { useDemo } from '../../demo/DemoContext';
export default function SavedScreen() {
  const { saved } = useDemo();
  return <Screen back title="Keep a good look." subtitle="Your favorites, ready for another day.">{saved ? <OutfitCard /> : <StateCard title="A place for your favorites" description="Save the sample outfit to try this view. Demo favorites last only for this session." action="Explore Discover" onAction={() => router.push('/discover')} />}</Screen>;
}
