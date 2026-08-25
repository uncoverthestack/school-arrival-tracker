import { createContext, useContext, useMemo } from 'react'
import { useColorScheme } from 'react-native'
import { themeFor } from '../lib/theme'

const ThemeContext = createContext(themeFor('light'))

export function ThemeProvider({ children }) {
  const scheme = useColorScheme()
  const theme = useMemo(() => themeFor(scheme), [scheme])
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
