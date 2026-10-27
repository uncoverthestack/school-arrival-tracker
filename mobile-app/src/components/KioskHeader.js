import { View, Text, Pressable, StyleSheet } from 'react-native'
import { useTheme } from '../theme/ThemeContext'

// Ported from admin-portal/app/gate/components/KioskHeader.js — the web
// version also links back to /  (the admin dashboard); that has no equivalent
// on a dedicated kiosk device, so it's dropped here. Long-pressing the title
// re-opens setup, since mobile has no `?key=` URL fallback like the web page.
export function KioskHeader({ title, scanType, online, time, onToggleScanType, onTitleLongPress }) {
  const theme = useTheme()
  const { colors, spacing, type } = theme
  const pillColors = scanType === 'arrival'
    ? { bg: colors.successContainer, fg: colors.onSuccessContainer }
    : { bg: colors.tertiaryContainer, fg: colors.onTertiaryContainer }

  return (
    <View style={[styles.container, { borderBottomColor: colors.outlineVariant, paddingHorizontal: spacing[16], paddingVertical: spacing[16] }]}>
      <Pressable onLongPress={onTitleLongPress} delayLongPress={2000}>
        <Text style={[type.titleLarge, { color: colors.onSurface }]}>{title}</Text>
      </Pressable>

      <View style={styles.right}>
        <Pressable onPress={onToggleScanType} style={[styles.pill, { backgroundColor: pillColors.bg }]}>
          <View style={[styles.dot, { backgroundColor: pillColors.fg }]} />
          <Text style={[type.labelLarge, { color: pillColors.fg }]}>{scanType === 'arrival' ? 'Arrival' : 'Departure'}</Text>
        </Pressable>

        <View style={styles.status}>
          <View style={[styles.dot, { backgroundColor: online ? colors.success : colors.error }]} />
          <Text style={[type.titleMedium, { color: colors.onSurfaceVariant }]}>{online ? 'online' : 'offline'}</Text>
          <Text style={[type.bodyLarge, { color: colors.outline }]}>·</Text>
          <Text style={[type.titleMedium, { color: colors.onSurfaceVariant }]}>{time}</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 28, paddingHorizontal: 12, borderRadius: 999 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
})
