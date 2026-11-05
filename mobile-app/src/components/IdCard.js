import { View, Image, Text, StyleSheet } from 'react-native'
import { CameraView } from 'expo-camera'
import Svg, { Path, Circle } from 'react-native-svg'
import { useTheme } from '../theme/ThemeContext'

const RETICLE_PATHS = [
  'M4 20V8a4 4 0 0 1 4-4h12',
  'M56 4h12a4 4 0 0 1 4 4v12',
  'M72 56v12a4 4 0 0 1-4 4H56',
  'M20 72H8a4 4 0 0 1-4-4V56',
]

// One ID-card shell reused across every kiosk state — only the inner "photo"
// area content changes: a live camera feed + reticle, a resolved student
// photo, an alert triangle, or a wifi-off icon. Ported from
// admin-portal/app/gate/components/IdCard.js.
export function IdCard({ variant = 'scanning', photoUrl, studentName, elevated = false, onBarcodeScanned }) {
  const theme = useTheme()
  const styles = makeStyles(theme)
  const photoBg = {
    scanning: theme.colors.primaryContainer,
    photo: theme.colors.surfaceContainer,
    error: theme.colors.errorContainer,
    offline: theme.colors.surfaceVariant,
  }[variant]

  return (
    <View style={[styles.shell, elevated && styles.shellElevated]}>
      <Text style={styles.label}>STUDENT</Text>
      <View style={styles.punch} />

      <View style={[styles.photoArea, { backgroundColor: photoBg }]}>
        {variant === 'photo' && (
          photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.photoImage} />
          ) : (
            <View style={styles.photoFallback}>
              <Text style={styles.photoFallbackText}>{studentName?.[0] ?? '?'}</Text>
            </View>
          )
        )}

        {variant === 'scanning' && (
          <>
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={onBarcodeScanned}
            />
            <Svg width={76} height={76} viewBox="0 0 76 76" style={styles.reticle} pointerEvents="none">
              {RETICLE_PATHS.map((d) => (
                <Path key={d} d={d} stroke={theme.colors.onPrimaryContainer} strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.5} />
              ))}
            </Svg>
          </>
        )}

        {variant === 'error' && (
          <Svg width={88} height={88} viewBox="0 0 24 24" style={styles.centerIcon}>
            <Path d="M10.29 3.86l-8.18 14.18A2 2 0 0 0 3.82 21h16.36a2 2 0 0 0 1.71-2.96L13.71 3.86a2 2 0 0 0-3.42 0Z" fill={theme.colors.error} />
            <Path d="M12 9.5v3.25M12 15.75h.01" stroke={theme.colors.onError} strokeWidth={1.75} strokeLinecap="round" />
          </Svg>
        )}

        {variant === 'offline' && (
          <Svg width={92} height={92} viewBox="0 0 24 24" style={styles.centerIcon}>
            <Path
              d="M2 8.82a15.9 15.9 0 0 1 4.17-2.65M12 20h.01M8.5 16.43a6.5 6.5 0 0 1 7 0M5.3 12.9a11 11 0 0 1 3.7-2.16M15 10.74a11 11 0 0 1 3.7 2.16M9.9 6.34A15.9 15.9 0 0 1 12 6.16c2.45 0 4.78.55 6.87 1.53"
              stroke={theme.colors.onSurfaceVariant} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none"
            />
            <Path d="M2 2l20 20" stroke={theme.colors.onSurfaceVariant} strokeWidth={1.8} strokeLinecap="round" />
          </Svg>
        )}
      </View>
    </View>
  )
}

function makeStyles(theme) {
  const { colors, radii } = theme
  return StyleSheet.create({
    shell: {
      width: 300, height: 360,
      backgroundColor: colors.surfaceContainerLowest,
      borderWidth: 1, borderColor: colors.outlineVariant,
      borderRadius: radii.lg,
      shadowColor: '#000', shadowOpacity: 0.15, shadowOffset: { width: 0, height: 1 }, shadowRadius: 6, elevation: 2,
    },
    shellElevated: { shadowOpacity: 0.25, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 6 },
    label: { position: 'absolute', left: 18, top: 22, fontSize: 11, letterSpacing: 0.5, fontWeight: '500', color: colors.onSurfaceVariant },
    punch: { position: 'absolute', left: 142, top: 18, width: 16, height: 16, borderRadius: 8, backgroundColor: colors.surfaceDim },
    photoArea: {
      position: 'absolute', left: 14, top: 46, width: 272, height: 300,
      borderRadius: radii.md, overflow: 'hidden', alignItems: 'center', justifyContent: 'center',
    },
    photoImage: { width: '100%', height: '100%' },
    photoFallback: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
    photoFallbackText: { fontSize: 64, fontWeight: '700', color: colors.onPrimaryContainer, opacity: 0.4 },
    reticle: { position: 'absolute', left: '50%', top: '50%', marginLeft: -38, marginTop: -38 },
    centerIcon: { position: 'absolute', left: '50%', top: '50%', marginLeft: -44, marginTop: -44 },
  })
}
