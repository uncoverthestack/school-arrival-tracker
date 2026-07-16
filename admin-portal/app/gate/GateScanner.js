'use client'

import { useState, useEffect } from 'react'
import { useScanFlow } from './lib/useScanFlow'
import { KioskHeader } from './components/KioskHeader'
import { KioskFooter } from './components/KioskFooter'
import { IdCard } from './components/IdCard'
import { ResultBanner } from './components/ResultBanner'
import { StudentDetails } from './components/StudentDetails'
import { ModePickerView } from './components/ModePickerView'
import { ScannerView } from './components/ScannerView'
import { CodeEntryView } from './components/CodeEntryView'
import { ConfirmView } from './components/ConfirmView'
import { FaceScanView } from './components/FaceScanView'

function footerNote({ online, view, result }) {
  if (!online) return 'not syncing'
  if (view === 'pick') return 'ready for next student'
  if (view === 'scan') return 'hold card to the reader'
  if (view === 'face') return 'watching for faces…'
  if (view === 'confirm') return 'confirm to check in'
  if (view === 'result' && result) {
    if (result.state === 'success') return 'clears in 5s…'
    if (result.state === 'warning') return 'no new alert sent'
    if (result.state === 'error') return result.returnTo === 'code' ? 'back to keypad…' : 'returning to scanner…'
  }
  return ''
}

function OfflineScreen() {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <ResultBanner state="warning" message="Offline — check-ins aren't being recorded" />
      <IdCard variant="offline" elevated />
      <div className="flex flex-col items-center gap-3">
        <p className="text-headline-medium font-bold text-on-surface">No connection</p>
        <p className="text-body-large tracking-[0.5px] text-on-surface-variant">
          Check-ins aren&apos;t sending — switch to the paper list
        </p>
      </div>
    </div>
  )
}

function ResultScreen({ result }) {
  const student = result.student

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <ResultBanner state={result.state} message={result.message} />
      <IdCard variant={student ? 'photo' : 'error'} photoUrl={student?.photoUrl} studentName={student?.name} />

      {student ? (
        <StudentDetails
          name={student.name}
          fields={[
            { label: 'CLASS', value: student.studentClass ?? '—' },
            { label: 'STUDENT ID', value: student.studentId ?? '—' },
            {
              label: result.eventType === 'departure' ? 'DEPARTED' : 'ARRIVED',
              value: result.time ?? '—',
              accent: true
            }
          ]}
        />
      ) : (
        <div className="flex flex-col items-center gap-3">
          <p className="text-headline-medium font-bold text-on-surface">
            {result.returnTo === 'code' ? 'Code not found' : 'Card not recognised'}
          </p>
          <p className="text-body-large tracking-[0.5px] text-on-surface-variant">
            {result.returnTo === 'code'
              ? 'No student matches that code. Re-enter the code, or use the card.'
              : 'Ask the student to rescan, or see the front office'}
          </p>
        </div>
      )}
    </div>
  )
}

export function GateScanner({ schoolKey }) {
  const {
    view, scanType, confirmTarget, result, arrivals, scanning, clock, online,
    enterPickView, enterCodeView, enterFaceView, backToScanner, submitCode, confirmCheckIn, cancelConfirm, directScan,
    toggleScanType
  } = useScanFlow(schoolKey)

  // Follow the OS light/dark preference. Scoped to this wrapper's
  // [data-theme] attribute (not document.documentElement) so it can't
  // affect the rest of admin-portal.
  const [theme, setTheme] = useState('light')
  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = (e) => setTheme(e.matches ? 'dark' : 'light')
    apply(query)
    query.addEventListener('change', apply)
    return () => query.removeEventListener('change', apply)
  }, [])

  return (
    <div data-theme={theme} className="font-kiosk min-h-screen flex flex-col bg-surface text-on-surface">
      <KioskHeader title="Gate Scanner" scanType={scanType} online={online} time={clock} onToggleScanType={toggleScanType} />

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        {!online ? (
          <OfflineScreen />
        ) : view === 'pick' ? (
          <ModePickerView
            onCardScan={backToScanner}
            onCodeEntry={enterCodeView}
            onFaceScan={enterFaceView}
          />
        ) : view === 'scan' ? (
          <ScannerView onBack={enterPickView} />
        ) : view === 'face' ? (
          <FaceScanView
            schoolKey={schoolKey}
            onScan={(code) => directScan(code, 'face')}
            onEnterCode={enterPickView}
          />
        ) : view === 'code' ? (
          <CodeEntryView onSubmit={submitCode} onBack={enterPickView} scanning={scanning} />
        ) : view === 'confirm' && confirmTarget ? (
          <ConfirmView
            student={confirmTarget.student}
            code={confirmTarget.code}
            onConfirm={confirmCheckIn}
            onCancel={cancelConfirm}
          />
        ) : view === 'result' && result ? (
          <ResultScreen result={result} />
        ) : null}
      </main>

      <KioskFooter count={arrivals.length} note={footerNote({ online, view, result })} arrivals={arrivals} />
    </div>
  )
}
