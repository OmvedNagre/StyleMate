import { useState } from 'react';
import { router } from 'expo-router';
import { Text } from 'react-native';
import { Screen, Button, Choices, ui } from '../../components/ui';
import { occasions, weather, styles } from '../../constants/wardrobeOptions';
import { useDemo } from '../../demo/DemoContext';

export default function DiscoverScreen() {
  const demo = useDemo();
  const [occasion, setOccasion] = useState('college');
  const [condition, setCondition] = useState('normal');
  const [style, setStyle] = useState(demo.preferredStyle);
  const [footwear, setFootwear] = useState('any');
  return <Screen title="Dress for your day." subtitle="A few small choices. A look that feels like you.">
    <Choices title="Where are you headed?" values={occasions} selected={occasion} onSelect={setOccasion} />
    <Choices title="Weather · selected by you" values={weather} selected={condition} onSelect={setCondition} />
    <Choices title="Your preferred style" values={['any', ...styles]} selected={style} onSelect={setStyle} />
    <Choices title="Footwear" values={['any', 'sneakers', 'formalShoes', 'boots', 'sandals']} selected={footwear} onSelect={setFootwear} />
    <Text style={ui.caption}>Find up to three combinations from your wardrobe, scored locally using occasion, color, weather, style, and recent wear.</Text>
    <Button title="Generate outfits" onPress={() => router.push({ pathname: '/outfits/results', params: { occasion, weather: condition, style, footwear } })} />
  </Screen>;
}
