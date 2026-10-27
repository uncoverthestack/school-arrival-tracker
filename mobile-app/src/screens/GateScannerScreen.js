import { View, SafeAreaView, StyleSheet } from 'react-native'
import { useScanFlow } from '../hooks/useScanFlow'
import { useTheme } from '../theme/ThemeContext'
import { KioskHeader } from '../components/KioskHeader'
import { KioskFooter } from '../components/KioskFooter'
import { ModePickerView } from '../components/ModePickerView'
import { ScannerView } from '../components/ScannerView'
import { CodeEntryView } from '../components/CodeEntryView'
import { ConfirmView } from '../components/ConfirmView'
import { ResultScreen } from '../components/ResultScreen'
import { OfflineScreen } from '../components/OfflineScreen'

// Ported from admin-portal/app/gate/GateScanner.js's footerNote().
function footerNote({ online, view, result }) {
  if (!online) return 'not syncing'
  if (view === 'pick') return 'ready for next student'
  if (view === 'scan') return 'hold card to the reader'
  if (view === 'confirm') return 'confirm to check in'
  if (view === 'result' && result) {
    if (result.state === 'success') return 'clears in 5s…'
    if (result.state === 'warning') return 'no new alert sent'
    if (result.state === 'error') return result.returnTo === 'code' ? 'back to keypad…' : 'returning to scanner…'
  }
  return ''
}

// Ported from admin-portal/app/gate/GateScanner.js's composition/view-switch.
export function GateScannerScreen({ onRequestSetup }) {
  const theme = useTheme()
  const {
    view, scanType, confirmTarget, result, arrivals, scanning, clock, online,
    enterPickView, enterCodeView, backToScanner, submitCode, confirmCheckIn, cancelConfirm, directScan,
    toggleScanType,
  } = useScanFlow()

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <KioskHeader
        title="Gate Scanner"
        scanType={scanType}
        online={online}
        time={clock}
        onToggleScanType={toggleScanType}
        onTitleLongPress={onRequestSetup}
      />

      <View style={styles.main}>
        {!online ? (
          <OfflineScreen />
        ) : view === 'pick' ? (
          <ModePickerView onCardScan={backToScanner} onCodeEntry={enterCodeView} />
        ) : view === 'scan' ? (
          <ScannerView onBack={enterPickView} onBarcodeScanned={(e) => directScan(e.data, 'scan')} />
        ) : view === 'code' ? (
          <CodeEntryView onSubmit={submitCode} onBack={enterPickView} scanning={scanning} />
        ) : view === 'confirm' && confirmTarget ? (
          <ConfirmView
            student={confirmTarget.student}
            code={confirmTarget.code}
            codePrefix={confirmTarget.codePrefix}
            onConfirm={confirmCheckIn}
            onCancel={cancelConfirm}
          />
        ) : view === 'result' && result ? (
          <ResultScreen result={result} />
        ) : null}
      </View>

      <KioskFooter count={arrivals.length} note={footerNote({ online, view, result })} arrivals={arrivals} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  main: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 24 },
})
