import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bookmark, Shirt, Sparkles } from 'lucide-react-native';
import { theme } from '../constants/theme';
import { Button, ui } from './ui';

const slides = [
  { Icon: Shirt, title: 'Build your wardrobe', body: 'Add photos of the pieces you own and find them by category.' },
  { Icon: Sparkles, title: 'Find your next outfit', body: 'Choose an occasion, weather, and style to see outfits made from your clothes.' },
  { Icon: Bookmark, title: 'Keep your favorite looks', body: 'Save combinations you love and track what you wear.' },
];

/** @param {{onFinish: () => Promise<void>}} props */
export default function Onboarding({ onFinish }) {
  const { width } = useWindowDimensions();
  const pager = useRef(/** @type {import('react').ComponentRef<typeof ScrollView> | null} */ (null));
  const [page, setPage] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const finishing = useRef(false);
  const finish = async () => {
    if (finishing.current) return;
    finishing.current = true;
    setBusy(true);
    setError(false);
    try { await onFinish(); }
    catch { setError(true); finishing.current = false; setBusy(false); }
  };
  /** @param {number} index */
  const go = (index) => {
    setPage(index);
    pager.current?.scrollTo({ x: index * width, animated: true });
  };
  return <SafeAreaView style={ui.screen} edges={['top', 'bottom']}>
    <View style={styles.header}>
      <Text style={ui.label}>StyleMate</Text>
      <Pressable accessibilityRole="button" disabled={busy} onPress={finish} style={styles.skip}><Text style={ui.label}>Skip</Text></Pressable>
    </View>
    <ScrollView key={width} ref={pager} horizontal pagingEnabled contentOffset={{ x: page * width, y: 0 }} showsHorizontalScrollIndicator={false}
      onMomentumScrollEnd={(event) => setPage(Math.max(0, Math.min(2, Math.round(event.nativeEvent.contentOffset.x / width))))}>
      {slides.map(({ Icon, title, body }, index) => <ScrollView key={title} style={{ width }} contentContainerStyle={styles.slide}
        accessibilityElementsHidden={page !== index} importantForAccessibility={page === index ? 'auto' : 'no-hide-descendants'}>
        <View style={styles.art}><Icon size={88} strokeWidth={1.2} color={theme.colors.brand} /></View>
        <Text accessibilityRole="header" style={ui.title}>{title}</Text>
        <Text style={ui.body}>{body}</Text>
      </ScrollView>)}
    </ScrollView>
    <View style={styles.footer}>
      <View style={styles.dots}>
        {slides.map(({ title }, index) => <Pressable key={title} accessibilityRole="button" accessibilityLabel={`Slide ${index + 1} of 3`} accessibilityState={{ selected: page === index }} onPress={() => go(index)} style={styles.dotTarget}>
          <View style={[styles.dot, page === index && styles.active]} />
        </Pressable>)}
      </View>
      {error && <Text accessibilityRole="alert" style={ui.error}>Could not save your progress. Try again.</Text>}
      <Button title={page === 2 ? 'Start for free' : 'Next'} disabled={busy} onPress={() => page === 2 ? finish() : go(page + 1)} />
    </View>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24 },
  skip: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 12 },
  slide: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 16 },
  art: { minHeight: 148, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.tint },
  footer: { padding: 24, gap: 8 },
  dots: { flexDirection: 'row', justifyContent: 'center' },
  dotTarget: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  dot: { height: 8, width: 8, borderRadius: 4, backgroundColor: theme.colors.border },
  active: { width: 22, backgroundColor: theme.colors.brand },
});
