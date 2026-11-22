import { router } from 'expo-router';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';
import { label } from '../constants/wardrobeOptions';

/** @param {{children: import('react').ReactNode, title: string, subtitle?: string, back?: boolean}} props */
export function Screen({ children, title, subtitle, back = false }) {
  return <SafeAreaView style={ui.screen} edges={back ? ['top', 'left', 'right', 'bottom'] : ['top', 'left', 'right']}>
    <KeyboardAvoidingView style={ui.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={ui.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        {back && <Button title="‹ Back" secondary onPress={() => router.canGoBack() ? router.back() : router.replace('/')} />}
        <Text style={ui.eyebrow}>STYLEMATE / YOUR EVERYDAY EDIT</Text>
        <Text accessibilityRole="header" style={ui.title}>{title}</Text>
        {subtitle && <Text style={ui.body}>{subtitle}</Text>}
        <View style={ui.notice}><Text style={ui.caption}>PHASE 2 PREVIEW · Sample illustrations are demo data. Your photos stay on-device, but clothing records reset on restart until Phase 3.</Text></View>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

/** @param {{title: string, onPress: () => void, secondary?: boolean, disabled?: boolean, danger?: boolean}} props */
export function Button({ title, onPress, secondary = false, disabled = false, danger = false }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [ui.button, secondary && ui.secondary, danger && ui.dangerButton, (pressed || disabled) && ui.dim]}>
    <Text style={[ui.buttonText, secondary && ui.secondaryText, danger && ui.dangerText]}>{title}</Text>
  </Pressable>;
}

/** @param {{title: string, values: string[], selected: string | string[], onSelect: (value: string) => void}} props */
export function Choices({ title, values, selected, onSelect }) {
  return <View style={ui.section}><Text accessibilityRole="header" style={ui.label}>{title}</Text><View style={ui.wrap}>
    {values.map((value) => {
      const active = Array.isArray(selected) ? selected.includes(value) : selected === value;
      return <Pressable key={value} accessibilityRole="button" accessibilityLabel={`${title}: ${label(value)}`} accessibilityState={{ selected: active }} onPress={() => onSelect(value)} style={[ui.chip, active && ui.selectedChip]}>
        <Text style={[ui.caption, active && ui.selectedText]}>{label(value)}</Text>
      </Pressable>;
    })}
  </View></View>;
}

/** @param {{kind?: 'empty' | 'loading' | 'error', title: string, description: string, action?: string, onAction?: () => void}} props */
export function StateCard({ kind = 'empty', title, description, action, onAction }) {
  return <View style={ui.card} accessibilityLiveRegion="polite">
    {kind === 'loading' && <ActivityIndicator accessibilityLabel="Loading demo preview" color={theme.colors.accent} />}
    <Text accessibilityRole="header" style={ui.heading}>{title}</Text>
    <Text style={ui.body}>{description}</Text>
    {action && onAction && <Button title={action} onPress={onAction} secondary />}
  </View>;
}

export const ui = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.space.xl, gap: theme.space.xl, flexGrow: 1, maxWidth: 680, width: '100%', alignSelf: 'center' },
  eyebrow: { color: theme.colors.textSecondary, fontSize: theme.font.caption, letterSpacing: 1.5, marginTop: theme.space.sm },
  title: { color: theme.colors.textPrimary, fontSize: theme.font.heading, fontWeight: '600', letterSpacing: -1 },
  heading: { color: theme.colors.textPrimary, fontSize: theme.font.subheading, fontWeight: '500' },
  body: { color: theme.colors.textSecondary, fontSize: theme.font.body, lineHeight: 25 },
  caption: { color: theme.colors.textSecondary, fontSize: theme.font.caption, lineHeight: 19 },
  label: { color: theme.colors.textPrimary, fontSize: theme.font.body, fontWeight: '600' },
  notice: { borderLeftWidth: 2, borderColor: theme.colors.accent, paddingLeft: theme.space.md },
  card: { padding: theme.space.xl, backgroundColor: theme.colors.surface, borderRadius: theme.radius.card, gap: theme.space.lg },
  section: { gap: theme.space.md },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.space.sm },
  button: { minHeight: 48, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.textPrimary, borderRadius: theme.radius.control, padding: theme.space.lg },
  buttonText: { color: theme.colors.surface, fontSize: theme.font.body, fontWeight: '600', textAlign: 'center' },
  secondary: { borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  secondaryText: { color: theme.colors.textPrimary },
  dangerButton: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.danger },
  dangerText: { color: theme.colors.danger },
  dim: { opacity: 0.55 },
  chip: { minHeight: 44, paddingVertical: theme.space.md, paddingHorizontal: theme.space.lg, borderRadius: theme.radius.control, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, justifyContent: 'center' },
  selectedChip: { backgroundColor: theme.colors.textPrimary, borderColor: theme.colors.textPrimary },
  selectedText: { color: theme.colors.surface },
  input: { backgroundColor: theme.colors.surface, color: theme.colors.textPrimary, padding: theme.space.lg, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.control, fontSize: theme.font.body, minHeight: 52 },
  error: { color: theme.colors.danger, fontSize: theme.font.body },
});
