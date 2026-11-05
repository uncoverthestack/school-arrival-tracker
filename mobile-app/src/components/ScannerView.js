import { useEffect } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { useCameraPermissions } from 'expo-camera'
import { IdCard } from './IdCard'
import { useTheme } from '../theme/ThemeContext'

// Ported from admin-portal/app/gate/components/ScannerView.js. Unlike the
// web's html5-qrcode, expo-camera's onBarcodeScanned fires repeatedly while a
// code sits in frame with no built-in debounce — the 3s lastScannedRef lock
// in useScanFlow's handleScan is what prevents duplicate scanCard calls here,
// so it's load-bearing, not just ported for parity.
export function ScannerView({ onBack, onBarcodeScanned }) {
  const theme = useTheme()
  const { colors, type, spacing } = theme
  const [permission, requestPermission] = useCameraPermissions()

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission()
    }
  }, [permission])

  if (!permission || !permission.granted) {
    return (
      <View style={{ alignItems: 'center', gap: spacing[16] }}>
        <Text style={[type.headlineSmall, { color: colors.onSurface, textAlign: 'center' }]}>Camera access needed</Text>
        <Text style={[type.bodyLarge, { color: colors.onSurfaceVariant, textAlign: 'center' }]}>
          Gate Scanner needs the camera to scan student ID QR codes
        </Text>
        <Pressable onPress={requestPermission}>
          <Text style={[type.labelLarge, { color: colors.primary }]}>Grant camera access</Text>
        </Pressable>
        <Pressable onPress={onBack}>
          <Text style={[type.labelLarge, { color: colors.onSurfaceVariant }]}>← Change method</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={{ alignItems: 'center', gap: spacing[24] }}>
      <IdCard variant="scanning" onBarcodeScanned={onBarcodeScanned} />
      <Text style={[type.headlineLarge, { color: colors.onSurface }]}>Ready to scan</Text>
      <Text style={[type.bodyLarge, { color: colors.onSurfaceVariant }]}>Hold your ID card to the reader</Text>
      <Pressable onPress={onBack}>
        <Text style={[type.labelLarge, { color: colors.primary }]}>← Change method</Text>
      </Pressable>
    </View>
  )
}
