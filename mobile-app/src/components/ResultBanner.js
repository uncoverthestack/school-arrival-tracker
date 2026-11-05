import { View, Text, StyleSheet } from 'react-native'
import Svg, { Path, Circle } from 'react-native-svg'
import { useTheme } from '../theme/ThemeContext'

function BannerIcon({ state, color }) {
  if (state === 'success') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24">
        <Path d="M5 13l4 4L19 7" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </Svg>
    )
  }
  if (state === 'warning') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24">
        <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={2} fill="none" />
        <Path d="M12 7v5l3.5 2" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </Svg>
    )
  }
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path
        d="M12 9v4m0 4h.01M10.29 3.86l-8.18 14.18A2 2 0 0 0 3.82 21h16.36a2 2 0 0 0 1.71-2.96L13.71 3.86a2 2 0 0 0-3.42 0Z"
        stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
    </Svg>
  )
}

// Ported from admin-portal/app/gate/components/ResultBanner.js.
export function ResultBanner({ state, message }) {
  const theme = useTheme()
  const { colors, radii, spacing, type } = theme
  const palette = {
    success: { bg: colors.successContainer, fg: colors.onSuccessContainer },
    warning: { bg: colors.warningContainer, fg: colors.onWarningContainer },
    error: { bg: colors.errorContainer, fg: colors.onErrorContainer },
  }[state]

  return (
    <View style={[styles.container, { backgroundColor: palette.bg, borderRadius: radii.md, paddingHorizontal: spacing[16], paddingVertical: spacing[12] }]}>
      <BannerIcon state={state} color={palette.fg} />
      <Text style={[type.titleMedium, { color: palette.fg, fontWeight: '500' }]}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, maxWidth: 440, alignSelf: 'center' },
})
