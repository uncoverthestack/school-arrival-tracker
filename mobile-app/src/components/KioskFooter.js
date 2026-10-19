import { View, Text, Image, ScrollView, StyleSheet } from 'react-native'
import { useTheme } from '../theme/ThemeContext'

// Ported from admin-portal/app/gate/components/KioskFooter.js.
export function KioskFooter({ count, note, arrivals }) {
  const theme = useTheme()
  const { colors, spacing, radii, type } = theme

  return (
    <View style={[styles.footer, { borderTopColor: colors.outlineVariant }]}>
      <View style={[styles.summaryRow, { paddingHorizontal: spacing[16], paddingVertical: spacing[16] }]}>
        <View style={styles.countRow}>
          <Text style={[type.titleMedium, { color: colors.onSurface }]}>{count}</Text>
          <Text style={[type.bodyLarge, { color: colors.onSurfaceVariant }]}>checked in today</Text>
        </View>
        <Text style={[type.labelLarge, { color: colors.onSurfaceVariant }]}>{note}</Text>
      </View>

      <View style={{ paddingHorizontal: spacing[16], paddingBottom: spacing[16] }}>
        <Text style={[type.labelMedium, { color: colors.onSurfaceVariant, marginBottom: spacing[12], textTransform: 'uppercase' }]}>
          Today's log
        </Text>

        {arrivals.length === 0 ? (
          <Text style={[type.bodyMedium, { color: colors.onSurfaceVariant, textAlign: 'center', paddingVertical: spacing[24] }]}>
            No scans yet this session
          </Text>
        ) : (
          <ScrollView style={{ maxHeight: 256 }}>
            {arrivals.map((a, i) => (
              <View key={i} style={[styles.row, { backgroundColor: colors.surfaceContainer, borderRadius: radii.md, marginBottom: spacing[8] }]}>
                <View style={styles.rowLeft}>
                  {a.photoUrl ? (
                    <Image source={{ uri: a.photoUrl }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: colors.surfaceContainerHigh }]}>
                      <Text style={[type.titleMedium, { color: colors.onSurfaceVariant, fontWeight: '700' }]}>{a.name?.[0]}</Text>
                    </View>
                  )}
                  <View>
                    <Text style={[type.labelLarge, { color: colors.onSurface }]}>{a.name}</Text>
                    <Text style={[type.bodySmall, { color: colors.onSurfaceVariant }]}>
                      {a.studentClass}{a.studentId ? ` · ${a.studentId}` : ''}
                    </Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <View
                    style={[
                      styles.typePill,
                      { backgroundColor: a.type === 'arrival' ? colors.successContainer : colors.tertiaryContainer },
                    ]}
                  >
                    <Text style={[type.labelSmall, { color: a.type === 'arrival' ? colors.onSuccessContainer : colors.onTertiaryContainer, fontWeight: '700' }]}>
                      {a.type === 'arrival' ? '↓ In' : '↑ Out'}
                    </Text>
                  </View>
                  <Text style={[type.bodySmall, { color: colors.onSurfaceVariant, marginTop: spacing[4] }]}>{a.time}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  footer: { borderTopWidth: 1 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  countRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  typePill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
})
