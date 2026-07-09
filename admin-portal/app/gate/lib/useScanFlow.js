'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { scanCard, lookupStudent } from '@/app/actions/scan'

// Before this hour (school's local time) it's arrival, at/after it's departure.
const ARRIVAL_CUTOFF_HOUR = 12

function currentLagosHour() {
  return Number(new Date().toLocaleString('en-GB', {
    timeZone: 'Africa/Lagos', hour: 'numeric', hour12: false
  }))
}

function deriveScanType() {
  return currentLagosHour() < ARRIVAL_CUTOFF_HOUR ? 'arrival' : 'departure'
}

function currentLagosClock() {
  return new Date().toLocaleTimeString('en-GB', {
    timeZone: 'Africa/Lagos', hour: 'numeric', minute: '2-digit'
  })
}

// Drives the whole kiosk: which screen is showing, the arrival/departure
// pill (derived from time, not a manual toggle), the QR camera lifecycle,
// and the code-entry confirm step. QR scans call scanCard directly (no
// confirm); manual codes go through lookupStudent -> confirm -> scanCard.
export function useScanFlow(schoolKey) {
  const [view, setView] = useState('scan') // 'scan' | 'code' | 'face' | 'confirm' | 'result'
  const [scanType, setScanType] = useState(deriveScanType)
  const [confirmTarget, setConfirmTarget] = useState(null) // { student, code }
  const [result, setResult] = useState(null)
  const [arrivals, setArrivals] = useState([])
  const [scanning, setScanning] = useState(false)
  const [clock, setClock] = useState('')
  const [online, setOnline] = useState(true)

  const scanTypeRef = useRef(scanType)
  const lastScannedRef = useRef(null)
  const resultTimerRef = useRef(null)
  const qrScannerRef = useRef(null)
  const priorViewRef = useRef('scan')

  useEffect(() => { scanTypeRef.current = scanType }, [scanType])

  // Recompute arrival/departure and the header clock from the school's local time.
  useEffect(() => {
    const tick = () => {
      setScanType(deriveScanType())
      setClock(currentLagosClock())
    }
    tick()
    const id = setInterval(tick, 30000)
    return () => clearInterval(id)
  }, [])

  // Real connectivity check — the "offline" screen isn't just decorative.
  useEffect(() => {
    setOnline(navigator.onLine)
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  const showResult = useCallback((data, returnTo) => {
    priorViewRef.current = returnTo
    setResult({ ...data, returnTo })
    setView('result')
    clearTimeout(resultTimerRef.current)
    resultTimerRef.current = setTimeout(() => {
      setResult(null)
      setView(priorViewRef.current)
    }, 5000)
  }, [])

  const handleScan = useCallback(async (cardId, returnTo = 'scan') => {
    const id = cardId.trim()
    if (!id || lastScannedRef.current === id) return
    lastScannedRef.current = id
    setTimeout(() => { lastScannedRef.current = null }, 3000)

    setScanning(true)
    let data
    try {
      data = await scanCard(id, scanTypeRef.current, schoolKey)
    } catch (err) {
      console.error(err)
      setScanning(false)
      showResult({ state: 'error', student: null, message: 'Could not reach the server — try again' }, returnTo)
      return
    }
    setScanning(false)

    if (data.error === 'unauthorized') {
      showResult({ state: 'error', student: null, message: 'Invalid school key — check the URL' }, returnTo)
      return
    }
    if (data.error === 'not_found') {
      showResult({ state: 'error', student: null, message: `Card not recognised: ${id}` }, returnTo)
      return
    }
    if (data.duplicate) {
      showResult({ state: 'warning', student: data.student, time: data.time, message: data.message }, returnTo)
      return
    }
    if (data.success) {
      showResult({ state: 'success', student: data.student, time: data.time, message: data.message, eventType: scanTypeRef.current }, returnTo)
      setArrivals(prev => [{ ...data.student, time: data.time, type: scanTypeRef.current }, ...prev])
    }
  }, [schoolKey, showResult])

  // QR scanner — same start/stop lifecycle as the original page.js, just keyed
  // off `view === 'scan'` instead of a `mode` toggle. Skipped while offline
  // since GateScanner renders the "No connection" screen instead of the
  // camera in that case (no #qr-reader element to attach to).
  useEffect(() => {
    if (view !== 'scan' || !online) return
    let scanner

    import('html5-qrcode').then(({ Html5Qrcode }) => {
      scanner = new Html5Qrcode('qr-reader')
      scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decoded) => handleScan(decoded, 'scan'),
        () => {}
      ).then(() => {
        qrScannerRef.current = scanner
      }).catch(console.warn)
    })

    return () => {
      qrScannerRef.current?.stop().catch(() => {})
      qrScannerRef.current = null
    }
  }, [view, online, handleScan])

  const enterCodeView = useCallback(() => setView('code'), [])
  const enterFaceView = useCallback(() => setView('face'), [])
  const backToScanner = useCallback(() => setView('scan'), [])

  const submitCode = useCallback(async (code) => {
    const trimmed = code.trim()
    if (!trimmed) return

    setScanning(true)
    let data
    try {
      data = await lookupStudent(trimmed, schoolKey)
    } catch (err) {
      console.error(err)
      setScanning(false)
      showResult({ state: 'error', student: null, message: 'Could not reach the server — try again' }, 'code')
      return
    }
    setScanning(false)

    if (data.error === 'unauthorized') {
      showResult({ state: 'error', student: null, message: 'Invalid school key — check the URL' }, 'code')
      return
    }
    if (data.error === 'not_found') {
      showResult({ state: 'error', student: null, message: 'Code not found — check the digits and try again' }, 'code')
      return
    }
    setConfirmTarget({ student: data.student, code: trimmed })
    setView('confirm')
  }, [schoolKey, showResult])

  const confirmCheckIn = useCallback(() => {
    if (!confirmTarget) return
    handleScan(confirmTarget.code, 'code')
    setConfirmTarget(null)
  }, [confirmTarget, handleScan])

  const cancelConfirm = useCallback(() => {
    setConfirmTarget(null)
    setView('code')
  }, [])

  return {
    view, scanType, confirmTarget, result, arrivals, scanning, clock, online,
    enterCodeView, enterFaceView, backToScanner, submitCode, confirmCheckIn, cancelConfirm,
    directScan: handleScan
  }
}
