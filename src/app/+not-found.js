import { router } from 'expo-router';
import { Screen, StateCard } from '../components/ui';
export default function NotFoundScreen() {
  return <Screen back title="A little off track."><StateCard kind="error" title="This page could not be found" description="Return to your wardrobe and continue exploring." action="Back to Home" onAction={() => router.replace('/')} /></Screen>;
}
