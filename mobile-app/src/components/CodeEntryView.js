import { useState } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { useTheme } from '../theme/ThemeContext'

const CODE_LENGTH = 6
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

// Ported from admin-portal/app/gate/components/CodeEntryView.js. The web
// version lays the info block and keypad out side by side (built for a wide
// kiosk/desktop screen) — on a narrow phone in portrait that doesn't fit, so
// this stacks everything vertically and centered instead.
export function CodeEntryView({ onSubmit, onBack, scanning }) {
  const theme = useTheme()
  const { colors, radii, spacing, type } = theme
  const [digits, setDigits] = useState([])

  const press = (d) => setDigits(prev => (prev.length < CODE_LENGTH ? [...prev, d] : prev))
  const backspace = () => setDigits(prev => prev.slice(0, -1))
  const clear = () => setDigits([])

  const submit = () => {
    if (digits.length !== CODE_LENGTH) return
    const code = digits.join('')
    setDigits([])
    onSubmit(code)
  }

  const keyStyle = { backgroundColor: colors.surfaceContainer, borderColor: colors.outlineVariant, borderRadius: radii.md }

  return (
    <View style={styles.container}>
      <Text style={[type.headlineSmall, { color: colors.onSurface, textAlign: 'center' }]}>Enter student code</Text>
      <Text style={[type.bodyLarge, { color: colors.onSurfaceVariant, textAlign: 'center' }]}>For a lost or damaged card</Text>

      <View style={styles.digitRow}>
        {Array.from({ length: CODE_LENGTH }).map((_, i) => (
          <View key={i} style={[styles.digitCell, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant, borderRadius: radii.md }]}>
            <Text style={[type.headlineSmall, { color: colors.onSurface }]}>{digits[i] ?? ''}</Text>
          </View>
        ))}
      </View>

      <Pressable
        onPress={submit}
        disabled={digits.length !== CODE_LENGTH || scanning}
        style={[styles.continueBtn, { backgroundColor: colors.primary, borderRadius: radii.sm }, (digits.length !== CODE_LENGTH || scanning) && styles.disabled]}
      >
        <Text style={[type.labelLarge, { color: colors.onPrimary }]}>Continue →</Text>
      </Pressable>

      <Pressable onPress={onBack}>
        <Text style={[type.labelLarge, { color: colors.primary }]}>← Change method</Text>
      </Pressable>

      <View style={styles.keypad}>
        {KEYS.map((n) => (
          <Pressable key={n} onPress={() => press(n)} style={[styles.key, keyStyle]}>
            <Text style={[type.headlineSmall, { color: colors.onSurface }]}>{n}</Text>
          </Pressable>
        ))}
        <Pressable onPress={clear} style={[styles.key, keyStyle]}>
          <Text style={[type.headlineSmall, { color: colors.onSurface }]}>✕</Text>
        </Pressable>
        <Pressable onPress={() => press('0')} style={[styles.key, keyStyle]}>
          <Text style={[type.headlineSmall, { color: colors.onSurface }]}>0</Text>
        </Pressable>
        <Pressable onPress={backspace} style={[styles.key, keyStyle]}>
          <Text style={[type.headlineSmall, { color: colors.onSurface }]}>⌫</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 16, width: '100%' },
  digitRow: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  digitCell: { width: 40, height: 52, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  continueBtn: { height: 44, paddingHorizontal: 40, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.4 },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', width: 260, gap: 12, justifyContent: 'center', marginTop: 8 },
  key: { width: 76, height: 60, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
})
