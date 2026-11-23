import { useState } from 'react';
import { router } from 'expo-router';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Screen, Button, Choices, ui } from '../../components/ui';
import { profile } from '../../constants/profile';
import { theme } from '../../constants/theme';
import { styles } from '../../constants/wardrobeOptions';
import { useDemo } from '../../demo/DemoContext';
export default function ProfileScreen() {
  const demo = useDemo();
  const [error, setError] = useState('');
  /** @param {() => Promise<void>} action */
  const perform = async (action) => { setError(''); try { await action(); } catch { setError('Could not save the change. Please try again.'); } };
  const stats = [
    { label: 'Clothing added', value: demo.items.filter((item) => item.imageUri).length },
    { label: 'Saved outfits', value: demo.savedOutfits.length },
    { label: 'Wears logged', value: demo.history.length },
  ];
  const confirm = (clear = false) => Alert.alert(clear ? 'Empty the demo wardrobe?' : 'Restore the sample collection?', 'This changes only sample illustrations. Photo pieces, favorites, and history are preserved. Adding samples does not replace existing edits.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Continue', onPress: () => perform(clear ? demo.clear : demo.reset) }]);
  return <Screen title="Profile">
    <View style={ui.card}>
      <View style={profileStyles.avatar}><Text style={ui.heading}>{profile.initial}</Text></View>
      <Text style={ui.heading}>{profile.name}</Text>
      <Text style={ui.body}>{profile.gender} · Local profile</Text>
      <View style={ui.wrap}>
        {stats.map(({ label, value }) => <View key={label} style={profileStyles.stat}>
          <Text style={ui.heading}>{value}</Text><Text style={ui.caption}>{label}</Text>
        </View>)}
      </View>
    </View>
    <Button title={`Saved outfits · ${demo.savedOutfits.length}`} secondary onPress={() => router.push('/outfits/saved')} />
    <Button title={`Outfit history · ${demo.history.length}`} secondary onPress={() => router.push('/outfits/history')} />
    <Choices title="Default style" values={['any', ...styles]} selected={demo.preferredStyle} onSelect={(value) => perform(() => demo.setPreferredStyle(value))} />
    <Text style={ui.caption}>Used when Discover first opens. Existing selections in an open Discover screen stay unchanged.</Text>
    <Text accessibilityLiveRegion="polite" style={ui.error}>{error}</Text>
    <Text style={ui.heading}>Sample wardrobe</Text>
    <Button title="Add sample pieces" secondary onPress={() => confirm()} />
    <Button title="Hide sample pieces" secondary onPress={() => confirm(true)} />
  </Screen>;
}

const profileStyles = StyleSheet.create({
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.tint },
  stat: { flexGrow: 1, minWidth: 94, gap: 4, padding: 12, borderRadius: 12, backgroundColor: theme.colors.tint },
});
