import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { theme } from '../constants/theme';
import { label } from '../constants/wardrobeOptions';
import { ui } from './ui';

/** @type {Record<string, string>} */
const swatches = { shirt: '#DED5C2', trousers: '#73765C', knit: '#3C4A60', jeans: '#61788F', shoes: '#E6E2DA' };
/** Offline native illustrations, explicitly labeled instead of posing as clothing photos.
 * @param {{image: string}} props */
export function GarmentArt({ image }) {
  const color = swatches[image];
  const trousers = image === 'trousers' || image === 'jeans';
  return <View style={styles.art} accessibilityLabel={color ? `Sample ${image} illustration` : 'Image unavailable'}>
    {color ? <View style={styles.drawing} accessible={false} importantForAccessibility="no-hide-descendants">
      {trousers ? <><View style={[styles.waist, { backgroundColor: color }]} /><View style={[styles.leg, { left: '23%', backgroundColor: color }]} /><View style={[styles.leg, { right: '23%', backgroundColor: color }]} /></>
        : image === 'shoes' ? <><View style={[styles.shoe, { backgroundColor: color }]} /><View style={[styles.sole]} /></>
          : <><View style={[styles.sleeve, { left: '9%', transform: [{ rotate: '25deg' }], backgroundColor: color }]} /><View style={[styles.sleeve, { right: '9%', transform: [{ rotate: '-25deg' }], backgroundColor: color }]} /><View style={[styles.torso, { backgroundColor: color }]} /><View style={styles.neck} /><View style={styles.seam} /></>}
    </View> : <Text style={ui.body}>Image unavailable</Text>}
    <Text style={ui.caption}>SAMPLE ILLUSTRATION</Text>
  </View>;
}
/** @param {{item: import('../demo/data').Clothing}} props */
export function ClothingCard({ item }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`View ${item.name}`} onPress={() => router.push({ pathname: '/clothing/[id]', params: { id: item.id } })} style={styles.card}>
    <GarmentArt image={item.image} /><Text style={ui.label}>{item.name}</Text><Text style={ui.caption}>{label(item.category)} · {label(item.color)}</Text>
  </Pressable>;
}
/** @param {{items: import('../demo/data').Clothing[]}} props */
export function ClothingGrid({ items }) {
  const { width, fontScale } = useWindowDimensions();
  const singleColumn = width < 350 || fontScale > 1.4;
  return <View style={styles.grid}>{items.map((item) => <View key={item.id} style={{ width: singleColumn ? '100%' : '47%' }}><ClothingCard item={item} /></View>)}</View>;
}
const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: theme.space.xl },
  card: { gap: theme.space.sm },
  art: { backgroundColor: theme.colors.border, borderRadius: theme.radius.card, padding: theme.space.md, alignItems: 'center', justifyContent: 'center', minHeight: 180, gap: theme.space.sm },
  drawing: { width: '100%', maxWidth: 260, height: 150 },
  torso: { position: 'absolute', width: '48%', height: '72%', top: '18%', left: '26%', borderRadius: 5 },
  sleeve: { position: 'absolute', width: '28%', height: '30%', top: '18%', borderRadius: 4 },
  neck: { position: 'absolute', width: '18%', height: '12%', top: '13%', left: '41%', borderBottomLeftRadius: 15, borderBottomRightRadius: 15, backgroundColor: theme.colors.border },
  seam: { position: 'absolute', width: 1, height: '55%', top: '32%', left: '50%', backgroundColor: theme.colors.border },
  waist: { position: 'absolute', width: '54%', height: '22%', top: '10%', left: '23%', borderRadius: 4 },
  leg: { position: 'absolute', width: '23%', height: '65%', top: '25%', borderRadius: 3 },
  shoe: { position: 'absolute', width: '75%', height: '30%', top: '40%', left: '12%', borderTopLeftRadius: 10, borderTopRightRadius: 35 },
  sole: { position: 'absolute', width: '77%', height: '6%', top: '69%', left: '11%', backgroundColor: theme.colors.surface, borderRadius: 4 },
});
