import { View, Text } from 'react-native'
import { ResultBanner } from './ResultBanner'
import { IdCard } from './IdCard'
import { StudentDetails } from './StudentDetails'
import { useTheme } from '../theme/ThemeContext'

// Ported from the ResultScreen defined inline in
// admin-portal/app/gate/GateScanner.js.
export function ResultScreen({ result }) {
  const theme = useTheme()
  const { colors, spacing, type } = theme
  const student = result.student

  return (
    <View style={{ alignItems: 'center', gap: spacing[24] }}>
      <ResultBanner state={result.state} message={result.message} />
      <IdCard variant={student ? 'photo' : 'error'} photoUrl={student?.photoUrl} studentName={student?.name} />

      {student ? (
        <StudentDetails
          name={student.name}
          fields={[
            { label: 'CLASS', value: student.studentClass ?? '—' },
            { label: 'STUDENT ID', value: student.studentId ?? '—' },
            {
              label: result.eventType === 'departure' ? 'DEPARTED' : 'ARRIVED',
              value: result.time ?? '—',
              accent: true,
            },
          ]}
        />
      ) : (
        <View style={{ alignItems: 'center', gap: spacing[12] }}>
          <Text style={[type.headlineMediumEmph, { color: colors.onSurface, textAlign: 'center' }]}>
            {result.returnTo === 'code' ? 'Code not found' : 'Card not recognised'}
          </Text>
          <Text style={[type.bodyLarge, { color: colors.onSurfaceVariant, textAlign: 'center' }]}>
            {result.returnTo === 'code'
              ? 'No student matches that code. Re-enter the code, or use the card.'
              : 'Ask the student to rescan, or see the front office'}
          </Text>
        </View>
      )}
    </View>
  )
}
