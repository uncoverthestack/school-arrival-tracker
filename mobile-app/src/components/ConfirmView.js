import { View, Text, Pressable, StyleSheet } from 'react-native'
import { IdCard } from './IdCard'
import { StudentDetails } from './StudentDetails'
import { useTheme } from '../theme/ThemeContext'

// Ported from admin-portal/app/gate/components/ConfirmView.js.
export function ConfirmView({ student, code, codePrefix, onConfirm, onCancel }) {
  const theme = useTheme()
  const { colors, radii, spacing, type } = theme
  const displayCode = codePrefix ? `${codePrefix}-${code}` : code

  return (
    <View style={{ alignItems: 'center', gap: spacing[24] }}>
      <View style={{ alignItems: 'center', gap: spacing[4] }}>
        <Text style={[type.headlineSmall, { color: colors.onSurface }]}>Is this the right student?</Text>
        <Text style={[type.bodyLarge, { color: colors.onSurfaceVariant }]}>Code {displayCode} matched one student</Text>
      </View>

      <IdCard variant="photo" photoUrl={student.photoUrl} studentName={student.name} />

      <StudentDetails
        name={student.name}
        fields={[
          { label: 'CLASS', value: student.studentClass ?? '—' },
          { label: 'STUDENT ID', value: student.studentId ?? '—' },
          { label: 'ENTERED CODE', value: displayCode },
        ]}
      />

      <View style={{ alignItems: 'center', gap: spacing[12] }}>
        <Pressable onPress={onConfirm} style={[styles.confirmBtn, { backgroundColor: colors.primary, borderRadius: radii.sm }]}>
          <Text style={[type.labelLarge, { color: colors.onPrimary }]}>Check in {student.name?.split(' ')[0]}</Text>
        </Pressable>
        <Pressable onPress={onCancel}>
          <Text style={[type.labelLarge, { color: colors.primary }]}>Not them — re-enter code</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  confirmBtn: { height: 44, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
})
