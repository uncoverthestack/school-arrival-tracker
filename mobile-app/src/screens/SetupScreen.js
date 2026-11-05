import { useState } from 'react'
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native'
import { useTheme } from '../theme/ThemeContext'
import { saveConfig } from '../lib/config'

export function SetupScreen({ initialServerUrl = '', initialSchoolKey = '', onSaved }) {
  const theme = useTheme()
  const [serverUrl, setServerUrl] = useState(initialServerUrl)
  const [schoolKey, setSchoolKey] = useState(initialSchoolKey)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    const trimmedUrl = serverUrl.trim()
    const trimmedKey = schoolKey.trim()
    if (!trimmedUrl || !trimmedKey) {
      setError('Both fields are required')
      return
    }
    if (!/^https?:\/\//i.test(trimmedUrl)) {
      setError('Server URL must start with https://')
      return
    }
    setError('')
    setSaving(true)
    await saveConfig({ serverUrl: trimmedUrl, schoolKey: trimmedKey })
    setSaving(false)
    onSaved()
  }

  const styles = makeStyles(theme)

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>Gate Scanner setup</Text>
      <Text style={styles.subtitle}>Enter your school's admin portal URL and gate API key</Text>

      <View style={styles.field}>
        <Text style={styles.label}>SERVER URL</Text>
        <TextInput
          style={styles.input}
          value={serverUrl}
          onChangeText={setServerUrl}
          placeholder="https://yourschool.example.com"
          placeholderTextColor={theme.colors.onSurfaceVariant}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>GATE API KEY</Text>
        <TextInput
          style={styles.input}
          value={schoolKey}
          onChangeText={setSchoolKey}
          placeholder="School gate key"
          placeholderTextColor={theme.colors.onSurfaceVariant}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.button} onPress={submit} disabled={saving}>
        {saving ? <ActivityIndicator color={theme.colors.onPrimary} /> : <Text style={styles.buttonText}>Save & continue</Text>}
      </Pressable>
    </KeyboardAvoidingView>
  )
}

function makeStyles(theme) {
  const { colors, spacing, radii, type } = theme
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      paddingHorizontal: spacing[32],
      gap: spacing[16],
    },
    title: { ...type.headlineMediumEmph, color: colors.onSurface, textAlign: 'center' },
    subtitle: { ...type.bodyLarge, color: colors.onSurfaceVariant, textAlign: 'center', marginBottom: spacing[16] },
    field: { gap: spacing[8] },
    label: { ...type.labelSmall, color: colors.onSurfaceVariant },
    input: {
      height: 48,
      borderRadius: radii.sm,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      paddingHorizontal: spacing[16],
      color: colors.onSurface,
      ...type.bodyLarge,
    },
    error: { ...type.bodyMedium, color: colors.error, textAlign: 'center' },
    button: {
      height: 44,
      borderRadius: radii.sm,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing[8],
    },
    buttonText: { ...type.labelLarge, color: colors.onPrimary },
  })
}
