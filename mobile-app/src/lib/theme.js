// Ported from gate-app/theme.css (Material 3 token set) — keep in sync if the web
// kiosk's design system changes.

export const lightColors = {
  primary: '#185fa5', onPrimary: '#ffffff', primaryContainer: '#ecf2f7', onPrimaryContainer: '#061829',
  secondary: '#3e5c7e', onSecondary: '#ffffff', secondaryContainer: '#dfe4e9', onSecondaryContainer: '#101720',
  tertiary: '#2e6b6b', onTertiary: '#ffffff', tertiaryContainer: '#eef3f3', onTertiaryContainer: '#0c1b1b',
  error: '#a32d2d', onError: '#ffffff', errorContainer: '#f0dcdc', onErrorContainer: '#a32d2d',
  success: '#3b6d11', onSuccess: '#ffffff', successContainer: '#eff3eb', onSuccessContainer: '#1e3709',
  warning: '#854f0b', onWarning: '#ffffff', warningContainer: '#f5f0eb', onWarningContainer: '#432806',
  background: '#fcfcfc', onBackground: '#181816',
  surface: '#fcfcfc', onSurface: '#181816',
  surfaceVariant: '#e2e3e4', onSurfaceVariant: '#424548',
  surfaceDim: '#dcdcda', surfaceBright: '#fafaf9',
  surfaceContainerLowest: '#ffffff', surfaceContainerLow: '#f4f4f3', surfaceContainer: '#efefee',
  surfaceContainerHigh: '#e9e9e8', surfaceContainerHighest: '#e4e4e2',
  outline: '#6e7378', outlineVariant: '#e2e3e4',
  inverseSurface: '#30302c', inverseOnSurface: '#f1f1f1', inversePrimary: '#b2cae1',
}

export const darkColors = {
  primary: '#b2cae1', onPrimary: '#0c3053', primaryContainer: '#0c3053', onPrimaryContainer: '#ecf2f7',
  secondary: '#bfc9d4', onSecondary: '#1f2e3f', secondaryContainer: '#1f2e3f', onSecondaryContainer: '#eff1f4',
  tertiary: '#b9cece', onTertiary: '#173636', tertiaryContainer: '#173636', onTertiaryContainer: '#eef3f3',
  error: '#e0b9b9', onError: '#521717', errorContainer: '#521717', onErrorContainer: '#f7eded',
  success: '#beceb0', onSuccess: '#1e3709', successContainer: '#1e3709', onSuccessContainer: '#eff3eb',
  warning: '#d6c4ae', onWarning: '#432806', warningContainer: '#432806', onWarningContainer: '#f5f0eb',
  background: '#181816', onBackground: '#e4e4e2',
  surface: '#181816', onSurface: '#e4e4e2',
  surfaceVariant: '#424548', onSurfaceVariant: '#c5c7c9',
  surfaceDim: '#0e0e0d', surfaceBright: '#3a3935',
  surfaceContainerLowest: '#0a0a09', surfaceContainerLow: '#181816', surfaceContainer: '#1d1d1b',
  surfaceContainerHigh: '#292826', surfaceContainerHighest: '#353431',
  outline: '#8b8f93', outlineVariant: '#424548',
  inverseSurface: '#e4e4e2', inverseOnSurface: '#30302c', inversePrimary: '#185fa5',
}

export const spacing = { 0: 0, 4: 4, 8: 8, 12: 12, 16: 16, 20: 20, 24: 24, 32: 32, 40: 40, 48: 48, 56: 56, 64: 64 }

export const radii = { xs: 4, sm: 8, md: 12, lg: 16, xl: 28, full: 999 }

export const fontFamily = 'Manrope_400Regular'

// M3 type scale — { fontSize, lineHeight, letterSpacing, fontFamily }. Only the
// levels the kiosk actually uses; weight is expressed via the font family name
// (Manrope_700Bold etc.) rather than fontWeight, since Manrope is loaded as
// distinct weighted families via @expo-google-fonts.
export const type = {
  headlineLarge: { fontSize: 32, lineHeight: 40, letterSpacing: 0, fontFamily: 'Manrope_400Regular' },
  headlineMedium: { fontSize: 28, lineHeight: 36, letterSpacing: 0, fontFamily: 'Manrope_400Regular' },
  headlineMediumEmph: { fontSize: 28, lineHeight: 36, letterSpacing: 0, fontFamily: 'Manrope_700Bold' },
  headlineSmall: { fontSize: 24, lineHeight: 32, letterSpacing: 0, fontFamily: 'Manrope_400Regular' },
  titleLarge: { fontSize: 22, lineHeight: 28, letterSpacing: 0, fontFamily: 'Manrope_400Regular' },
  titleMedium: { fontSize: 16, lineHeight: 24, letterSpacing: 0.15, fontFamily: 'Manrope_500Medium' },
  titleSmall: { fontSize: 14, lineHeight: 20, letterSpacing: 0.1, fontFamily: 'Manrope_500Medium' },
  bodyLarge: { fontSize: 16, lineHeight: 24, letterSpacing: 0.5, fontFamily: 'Manrope_400Regular' },
  bodyMedium: { fontSize: 14, lineHeight: 20, letterSpacing: 0.25, fontFamily: 'Manrope_400Regular' },
  bodySmall: { fontSize: 12, lineHeight: 16, letterSpacing: 0.4, fontFamily: 'Manrope_400Regular' },
  labelLarge: { fontSize: 14, lineHeight: 20, letterSpacing: 0.1, fontFamily: 'Manrope_500Medium' },
  labelMedium: { fontSize: 12, lineHeight: 16, letterSpacing: 0, fontFamily: 'Manrope_500Medium' },
  labelSmall: { fontSize: 11, lineHeight: 16, letterSpacing: 0.5, fontFamily: 'Manrope_500Medium' },
}

export function themeFor(scheme) {
  const colors = scheme === 'dark' ? darkColors : lightColors
  return { colors, spacing, radii, type }
}
