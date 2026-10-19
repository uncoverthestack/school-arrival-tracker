import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '../theme/ThemeContext'

// name + a row of label/value fields (CLASS / STUDENT ID / ARRIVED, or
// CLASS / STUDENT ID / ENTERED CODE on the confirm screen). Ported from
// admin-portal/app/gate/components/StudentDetails.js.
export function StudentDetails({ name, fields }) {
  const theme = useTheme()
  const { colors, type, spacing } = theme

  return (
    <View style={{ alignItems: 'center', gap: spacing[12] }}>
      <Text style={[type.headlineMediumEmph, { color: colors.onSurface }]}>{name}</Text>
      <View style={styles.row}>
        {fields.map((field, i) => (
          <View key={field.label} style={styles.fieldRow}>
            {i > 0 && <View style={[styles.divider, { backgroundColor: colors.outlineVariant }]} />}
            <View style={styles.field}>
              <Text style={[type.labelSmall, { color: colors.onSurfaceVariant }]}>{field.label}</Text>
              <Text style={[type.labelLarge, { color: field.accent ? colors.primary : colors.onSurface }]}>{field.value}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 22 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: 22 },
  divider: { width: 1, height: 30 },
  field: { alignItems: 'center', gap: 3 },
})
