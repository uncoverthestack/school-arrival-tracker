import { useCallback, useEffect, useState } from 'react'
import { View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import { useFonts, Manrope_400Regular, Manrope_500Medium, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope'
import { ThemeProvider, useTheme } from './src/theme/ThemeContext'
import { getConfig, clearConfig } from './src/lib/config'
import { SetupScreen } from './src/screens/SetupScreen'
import { GateScannerScreen } from './src/screens/GateScannerScreen'

SplashScreen.preventAutoHideAsync()

function Root() {
  const theme = useTheme()
  const [config, setConfig] = useState(undefined) // undefined = loading, null = not set

  useEffect(() => {
    getConfig().then(setConfig)
  }, [])

  if (config === undefined) return null

  if (!config) {
    return <SetupScreen onSaved={() => getConfig().then(setConfig)} />
  }

  // Long-press the header title to re-open setup — there's no `?key=` URL
  // fallback on mobile like the web version has.
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.surface }}>
      <GateScannerScreen onRequestSetup={() => clearConfig().then(() => setConfig(null))} />
    </View>
  )
}

export default function App() {
  const [fontsLoaded] = useFonts({ Manrope_400Regular, Manrope_500Medium, Manrope_700Bold, Manrope_800ExtraBold })

  const onLayout = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync()
  }, [fontsLoaded])

  if (!fontsLoaded) return null

  return (
    <ThemeProvider>
      <View style={{ flex: 1 }} onLayout={onLayout}>
        <Root />
        <StatusBar style="auto" />
      </View>
    </ThemeProvider>
  )
}
