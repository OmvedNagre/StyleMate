import { useState } from 'react';
import { router } from 'expo-router';
import { Alert, Text, View } from 'react-native';
import { Screen, Button, Choices, StateCard, ui } from '../../components/ui';
import { styles } from '../../constants/wardrobeOptions';
import { useDemo } from '../../demo/DemoContext';
export default function ProfileScreen() {
  const demo = useDemo();
  const [preview, setPreview] = useState('none');
  const confirm = (clear = false) => Alert.alert(clear ? 'Empty the demo wardrobe?' : 'Restore the sample collection?', 'This resets sample pieces, favorites, history, and preferences. Your own photo pieces stay in the current session.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Continue', onPress: clear ? demo.clear : demo.reset }]);
  return <Screen title="Made for you." subtitle="Your wardrobe. Your rhythm. No account needed.">
    <Button title={`Saved outfits · ${demo.saved ? 1 : 0}`} secondary onPress={() => router.push('/outfits/saved')} />
    <Button title={`Outfit history · ${demo.history.length}`} secondary onPress={() => router.push('/outfits/history')} />
    <Choices title="Default style · this session" values={['any', ...styles]} selected={demo.preferredStyle} onSelect={demo.setPreferredStyle} />
    <Text style={ui.caption}>Used when Discover first opens. Existing selections in an open Discover screen stay unchanged.</Text>
    <View style={ui.card}><Text style={ui.heading}>A more considered everyday.</Text><Text style={ui.body}>StyleMate helps you rediscover the pieces you own. The planned app keeps your wardrobe on-device and explains outfit suggestions through simple rules.</Text><Text style={ui.caption}>Version 0.1.0 · Phase 2 photo preview</Text></View>
    <Text style={ui.heading}>Explore the prototype</Text>
    <Button title="Restore demo collection" secondary onPress={() => confirm()} />
    <Button title="Hide sample pieces" secondary onPress={() => confirm(true)} />
    <Choices title="UI state preview" values={['none', 'loading', 'error']} selected={preview} onSelect={setPreview} />
    {preview === 'loading' && <StateCard kind="loading" title="Loading state preview" description="This is a visual demonstration; no request is running." action="Close preview" onAction={() => setPreview('none')} />}
    {preview === 'error' && <StateCard kind="error" title="Error state preview" description="A recoverable error would appear here. Your demo data is unaffected." action="Dismiss preview" onAction={() => setPreview('none')} />}
  </Screen>;
}
