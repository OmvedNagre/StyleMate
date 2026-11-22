import { useRef, useState } from 'react';
import { router } from 'expo-router';
import { Alert, Text, TextInput, View } from 'react-native';
import { Button, Choices, Screen, ui } from './ui';
import { GarmentArt } from './ClothingCard';
import { categories, colors, patterns, seasons, styles, types } from '../constants/wardrobeOptions';
import { useDemo } from '../demo/DemoContext';

/** @param {{item?: import('../demo/data').Clothing}} props */
export default function ClothingForm({ item }) {
  const demo = useDemo();
  const [name, setName] = useState(item?.name ?? '');
  const [category, setCategory] = useState(item?.category ?? 'topwear');
  const [itemType, setItemType] = useState(item?.itemType ?? 'shirt');
  const [color, setColor] = useState(item?.color ?? 'cream');
  const [style, setStyle] = useState(item?.style ?? 'casual');
  const [pattern, setPattern] = useState(item?.pattern ?? 'plain');
  const [selectedSeasons, setSeasons] = useState(item?.seasons ?? ['allSeason']);
  const [image, setImage] = useState(item?.image ?? '');
  const [submitted, setSubmitted] = useState(false);
  const saving = useRef(false);
  const errors = { name: !name.trim(), image: !image, seasons: !selectedSeasons.length };
  const save = () => {
    setSubmitted(true);
    if (Object.values(errors).some(Boolean) || saving.current) return;
    saving.current = true;
    const id = item?.id ?? `demo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    demo.saveItem({ id, name: name.trim(), category, itemType, color, style, pattern, seasons: selectedSeasons, image });
    router.replace({ pathname: '/clothing/[id]', params: { id } });
  };
  const explainPhoto = () => Alert.alert('Photo input comes in Phase 2', 'This UI preview uses sample illustrations. No camera or gallery permission is requested. Choose a sample below to try the form.');
  return <Screen back title={item ? 'Refine your piece.' : 'A new addition.'} subtitle="Give a favorite piece a place in your wardrobe.">
    <Text style={ui.label}>Photo / demo illustration *</Text>
    {image ? <GarmentArt image={image} /> : <View style={ui.card}><Text style={ui.body}>Choose a sample illustration below to preview this piece.</Text></View>}
    <Button title="Take Photo · availability" secondary onPress={explainPhoto} />
    <Button title="Choose from Gallery · availability" secondary onPress={explainPhoto} />
    <Choices title="Use a demo illustration" values={['shirt', 'trousers', 'knit', 'jeans', 'shoes']} selected={image} onSelect={setImage} />
    {submitted && errors.image && <Text accessibilityRole="alert" style={ui.error}>Choose a sample illustration.</Text>}
    <View style={ui.section}><Text style={ui.label}>Clothing name *</Text><TextInput accessibilityLabel="Clothing name" value={name} onChangeText={setName} placeholder="e.g. My everyday shirt" maxLength={80} style={ui.input} returnKeyType="done" />
      {submitted && errors.name && <Text accessibilityRole="alert" style={ui.error}>Enter a name for this piece.</Text>}</View>
    <Choices title="Category *" values={categories} selected={category} onSelect={(value) => { setCategory(value); setItemType(types[value][0]); }} />
    <Choices title="Item type *" values={types[category]} selected={itemType} onSelect={setItemType} />
    <Choices title="Primary color *" values={colors} selected={color} onSelect={setColor} />
    <Choices title="Style *" values={styles} selected={style} onSelect={setStyle} />
    <Choices title="Pattern" values={patterns} selected={pattern} onSelect={setPattern} />
    <Choices title="Seasons * · select one or more" values={seasons} selected={selectedSeasons} onSelect={(value) => setSeasons((current) => current.includes(value) ? current.filter((season) => season !== value) : [...current, value])} />
    {submitted && errors.seasons && <Text accessibilityRole="alert" style={ui.error}>Choose at least one season.</Text>}
    {submitted && Object.values(errors).some(Boolean) && <Text accessibilityRole="alert" style={ui.error}>Check the illustration, name, and season fields above.</Text>}
    <Text style={ui.caption}>All changes are temporary. The illustration is independent of the attributes you select.</Text>
    <Button title={item ? 'Update demo piece' : 'Add to demo wardrobe'} onPress={save} />
  </Screen>;
}
