import { View, Text } from 'react-native'
import { ResultBanner } from './ResultBanner'
import { IdCard } from './IdCard'
import { useTheme } from '../theme/ThemeContext'

// Ported from the OfflineScreen defined inline in
// admin-portal/app/gate/GateScanner.js. No local queue-and-sync — matches
// the web version's deliberate choice to block rather than silently queue
// check-ins (avoids stale/out-of-order parent notifications).
export function OfflineScreen() {
  const theme = useTheme()
  const { colors, spacing, type } = theme

  return (
    <View style={{ alignItems: 'center', gap: spacing[24] }}>
      <ResultBanner state="warning" message="Offline — check-ins aren't being recorded" />
      <IdCard variant="offline" elevated />
      <View style={{ alignItems: 'center', gap: spacing[12] }}>
        <Text style={[type.headlineMediumEmph, { color: colors.onSurface }]}>No connection</Text>
        <Text style={[type.bodyLarge, { color: colors.onSurfaceVariant, textAlign: 'center' }]}>
          Check-ins aren't sending — switch to the paper list
        </Text>
      </View>
    </View>
  )
}
