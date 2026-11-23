import { useRef, useState } from 'react';
import { router } from 'expo-router';
import { Alert, Linking, Text, TextInput, View } from 'react-native';
import { Button, Choices, Screen, ui } from './ui';
import { ClothingImage } from './ClothingCard';
import { categories, colors, label, patterns, seasons, styles, types } from '../constants/wardrobeOptions';
import { suggestTags, taggingAvailable } from '../services/tagSuggestions';
import { pickImage } from '../services/imageService';
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
  const image = item?.image ?? '';
  const [imageUri, setImageUri] = useState(item?.imageUri ?? '');
  const [busy, setBusy] = useState(false);
  const [suggestion, setSuggestion] = useState(/** @type {Awaited<ReturnType<typeof suggestTags>> | null} */ (null));
  const [tagging, setTagging] = useState(false);
  const tagLock = useRef(false);
  const [error, setError] = useState('');
  const picking = useRef(false);
  const [showDetails, setShowDetails] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const saving = useRef(false);
  const errors = { name: !name.trim(), image: !imageUri && !image, seasons: !selectedSeasons.length, itemType: !types[category]?.includes(itemType) };
  const save = async () => {
    setSubmitted(true);
    if (Object.values(errors).some(Boolean) || saving.current || picking.current || tagLock.current) return;
    saving.current = true;
    setBusy(true);
    setError('');
    const id = item?.id ?? `clothing-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    try {
      await demo.saveItem({ id, name: name.trim(), category, itemType, color, style, pattern, seasons: selectedSeasons, image, imageUri });
      router.replace({ pathname: '/clothing/[id]', params: { id } });
    } catch {
      setError('Could not save this piece or its photo. Check device storage and try again.');
      saving.current = false;
    } finally { setBusy(false); }
  };
  /** @param {'camera' | 'gallery'} source */
  const choosePhoto = async (source) => {
    if (picking.current || saving.current || tagLock.current) return;
    picking.current = true;
    setBusy(true);
    setError('');
    try {
      const result = await pickImage(source);
      if (result.status === 'denied') Alert.alert('Camera access needed', 'Allow camera access in Settings to take a clothing photo. You can also choose one from the gallery.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => { Linking.openSettings().catch(() => setError('Open your device Settings manually to allow camera access.')); } },
      ]);
      if (result.status === 'selected' && result.uri) { setImageUri(result.uri); setSuggestion(null); }
    } catch { setError('Could not open or read a photo. Check access in device Settings, or try another photo.'); }
    finally { picking.current = false; setBusy(false); }
  };
  const requestTags = async () => {
    if (!imageUri || tagLock.current || saving.current || picking.current) return;
    tagLock.current = true;
    setTagging(true);
    setError('');
    setSuggestion(null);
    try {
      const tags = await suggestTags(imageUri);
      if (Object.values(tags).some(Boolean)) setSuggestion(tags);
      else setError('No clear tags found. You can continue manually.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not suggest tags. Continue manually.');
    } finally { tagLock.current = false; setTagging(false); }
  };
  const applyTags = () => {
    if (!suggestion) return;
    if (suggestion.category) {
      if (suggestion.category !== category) setItemType(suggestion.itemType ?? '');
      else if (suggestion.itemType) setItemType(suggestion.itemType);
      setCategory(suggestion.category);
    }
    if (suggestion.color) setColor(suggestion.color);
    if (suggestion.pattern) setPattern(suggestion.pattern);
    if (suggestion.pattern) setShowDetails(true);
    setSuggestion(null);
  };
  return <Screen back title={item ? 'Refine your piece.' : 'A new addition.'} subtitle="Give a favorite piece a place in your wardrobe.">
    <Text style={ui.label}>Photo *</Text>
    {imageUri || image ? <ClothingImage image={image} imageUri={imageUri} /> : <View style={ui.card}><Text style={ui.body}>Take a photo or choose one from your gallery.</Text></View>}
    <Button title="Take Photo" secondary disabled={busy || tagging} onPress={() => choosePhoto('camera')} />
    <Button title="Choose from Gallery" secondary disabled={busy || tagging} onPress={() => choosePhoto('gallery')} />
    {taggingAvailable && !!imageUri && <View style={ui.card}>
      <Text style={ui.body}>Suggest tags sends this photo to Google Gemini. Use garment-only photos for the trial.</Text>
      <Button title={tagging ? 'Checking photo…' : 'Suggest tags'} secondary disabled={busy || tagging} onPress={requestTags} />
      {suggestion && <View style={ui.section}>
        <Text style={ui.label}>Review suggested tags</Text>
        <Text style={ui.body}>{[suggestion.category, suggestion.itemType, suggestion.color, suggestion.pattern].filter((value) => !!value).map(label).join(' · ')}</Text>
        <Button title="Apply suggestions" onPress={applyTags} />
        <Button title="Discard" secondary onPress={() => setSuggestion(null)} />
      </View>}
    </View>}
    {submitted && errors.image && <Text accessibilityRole="alert" style={ui.error}>Choose a clothing photo.</Text>}
    <View style={ui.section}><Text style={ui.label}>Clothing name *</Text><TextInput accessibilityLabel="Clothing name" value={name} onChangeText={setName} placeholder="e.g. My everyday shirt" maxLength={80} style={ui.input} returnKeyType="done" />
      {submitted && errors.name && <Text accessibilityRole="alert" style={ui.error}>Enter a name for this piece.</Text>}</View>
    <Choices title="Category *" values={categories} selected={category} onSelect={(value) => { setCategory(value); setItemType(types[value][0]); }} />
    <Choices title="Item type *" values={types[category]} selected={itemType} onSelect={setItemType} />
    {submitted && errors.itemType && <Text accessibilityRole="alert" style={ui.error}>Choose an item type.</Text>}
    <Choices title="Primary color *" values={colors} selected={color} onSelect={setColor} />
    {!item && <Button title={showDetails ? 'Hide extra details' : 'Edit style, pattern and seasons'} secondary onPress={() => setShowDetails(!showDetails)} />}
    {(item || showDetails) && <View style={ui.section}>
    <Choices title="Style *" values={styles} selected={style} onSelect={setStyle} />
    <Choices title="Pattern" values={patterns} selected={pattern} onSelect={setPattern} />
    <Choices title="Seasons * · select one or more" values={seasons} selected={selectedSeasons} onSelect={(value) => setSeasons((current) => current.includes(value) ? current.filter((season) => season !== value) : [...current, value])} />
    </View>}
    {submitted && errors.seasons && <Text accessibilityRole="alert" style={ui.error}>Choose at least one season.</Text>}
    {submitted && Object.values(errors).some(Boolean) && <Text accessibilityRole="alert" style={ui.error}>Review the highlighted fields above.</Text>}
    <Text style={ui.caption}>Photos and clothing details are saved privately on this device.</Text>
    <Text accessibilityLiveRegion="polite" style={ui.error}>{error}</Text>
    <Button title={busy ? 'Please wait…' : item ? 'Update piece' : 'Add to wardrobe'} disabled={busy || tagging} onPress={save} />
  </Screen>;
}
