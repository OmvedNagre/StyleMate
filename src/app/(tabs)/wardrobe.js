import { useState } from 'react';
import { router } from 'expo-router';
import { Screen, Button, Choices, StateCard } from '../../components/ui';
import { ClothingGrid } from '../../components/ClothingCard';
import { categories } from '../../constants/wardrobeOptions';
import { useDemo } from '../../demo/DemoContext';

export default function WardrobeScreen() {
  const { items } = useDemo();
  const [category, setCategory] = useState('all');
  const visible = items.filter((item) => category === 'all' || category === item.category);
  return <Screen title="Wardrobe" subtitle={`${items.length} pieces`}>
    <Button title="+ Add a piece" onPress={() => router.push('/clothing/add')} />
    <Choices title="Browse by category" values={['all', ...categories]} selected={category} onSelect={setCategory} />
    {visible.length ? <ClothingGrid items={visible} /> : <StateCard title="A little room for something you love" description="There are no pieces in this view." action="Add a piece" onAction={() => router.push('/clothing/add')} />}
  </Screen>;
}
