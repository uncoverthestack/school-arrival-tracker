export const THEME_STORAGE_KEY = 'schoolpass-theme'

// Inlined into a blocking <script> in the root layout so the theme applies
// before first paint — a useEffect-based approach would flash the wrong
// theme for a frame on every navigation.
export const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    if (stored === 'light' || stored === 'dark') {
      document.documentElement.setAttribute('data-theme', stored);
    }
  } catch (e) {}
})();
`

// 'light' | 'dark' | 'system' — 'system' clears the override and falls back
// to .theme-auto / prefers-color-scheme.
export function setTheme(theme) {
  if (theme === 'system') {
    document.documentElement.removeAttribute('data-theme')
    localStorage.removeItem(THEME_STORAGE_KEY)
  } else {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }
}

export function getStoredTheme() {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return stored === 'light' || stored === 'dark' ? stored : 'system'
  } catch {
    return 'system'
  }
}
