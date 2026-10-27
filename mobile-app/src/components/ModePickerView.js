import { View, Text, Pressable, StyleSheet } from 'react-native'
import Svg, { Rect, Circle } from 'react-native-svg'
import { useTheme } from '../theme/ThemeContext'

function CardIcon({ color }) {
  return (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={4} y={10} width={32} height={20} rx={3} stroke={color} strokeWidth={2} fill="none" />
      <Circle cx={13} cy={20} r={4} stroke={color} strokeWidth={2} fill="none" />
      <Rect x={20} y={16} width={10} height={2} rx={1} fill={color} />
      <Rect x={20} y={20} width={7} height={2} rx={1} fill={color} />
    </Svg>
  )
}

function KeypadIcon({ color }) {
  const dots = [[10, 10], [20, 10], [30, 10], [10, 20], [20, 20], [30, 20], [10, 30], [20, 30], [30, 30]]
  return (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      {dots.map(([cx, cy], i) => <Circle key={i} cx={cx} cy={cy} r={3} fill={color} />)}
    </Svg>
  )
}

// Card / Code only — Face Scan is deferred (browser-only face-api.js, no
// direct RN equivalent). Ported from
// admin-portal/app/gate/components/ModePickerView.js.
const OPTIONS = [
  { key: 'card', Icon: CardIcon, title: 'ID Card', desc: 'Hold your card to the reader' },
  { key: 'code', Icon: KeypadIcon, title: 'Enter Code', desc: 'Type your 6-digit student code' },
]

export function ModePickerView({ onCardScan, onCodeEntry }) {
  const theme = useTheme()
  const { colors, radii, spacing, type } = theme
  const handlers = { card: onCardScan, code: onCodeEntry }

  return (
    <View style={{ alignItems: 'center', gap: spacing[40], width: '100%', maxWidth: 640 }}>
      <View style={{ alignItems: 'center' }}>
        <Text style={[type.headlineMediumEmph, { color: colors.onSurface }]}>Check in</Text>
        <Text style={[type.bodyLarge, { color: colors.onSurfaceVariant, marginTop: spacing[4] }]}>Choose how you'd like to verify</Text>
      </View>

      <View style={styles.grid}>
        {OPTIONS.map(({ key, Icon, title, desc }) => (
          <Pressable
            key={key}
            onPress={handlers[key]}
            style={({ pressed }) => [
              styles.tile,
              { backgroundColor: colors.surfaceContainer, borderColor: colors.outlineVariant, borderRadius: radii.lg },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Icon color={colors.primary} />
            <Text style={[type.titleMedium, { color: colors.onSurface, fontWeight: '600', marginTop: spacing[16] }]}>{title}</Text>
            <Text style={[type.bodySmall, { color: colors.onSurfaceVariant, marginTop: spacing[4], textAlign: 'center' }]}>{desc}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', gap: 16, width: '100%' },
  tile: { flex: 1, alignItems: 'center', padding: 24, borderWidth: 1 },
})
