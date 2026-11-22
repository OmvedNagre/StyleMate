import { router, useLocalSearchParams } from 'expo-router';
import ClothingForm from '../../components/ClothingForm';
import { Screen, StateCard } from '../../components/ui';
import { useDemo } from '../../demo/DemoContext';
export default function EditClothingScreen() {
  const { id } = useLocalSearchParams();
  const item = useDemo().items.find((entry) => entry.id === id);
  return item ? <ClothingForm key={item.id} item={item} /> : <Screen back title="Piece unavailable."><StateCard kind="error" title="This piece is no longer here" description="The demo may have been reset or the piece removed." action="Open wardrobe" onAction={() => router.replace('/wardrobe')} /></Screen>;
}
