import { useState, useEffect, useRef, useCallback } from 'react'
import { scanCard, lookupStudent } from '../lib/apiClient'
import { useNetworkStatus } from './useNetworkStatus'
import { deriveScanType, currentLagosClock } from '../lib/time'

// Drives the whole kiosk: which screen is showing, the arrival/departure pill
// (derived from time by default, but staff can tap it to override — useful
// for early pickups, late arrivals, or demos outside normal hours), and the
// code-entry confirm step. Ported from
// admin-portal/app/gate/lib/useScanFlow.js — only the I/O boundaries changed
// (apiClient instead of server actions, NetInfo instead of navigator.onLine,
// CameraView's conditional mount instead of html5-qrcode's imperative
// start/stop). Everything else — the state machine itself — is unchanged.
export function useScanFlow() {
  const [view, setView] = useState('pick') // 'pick' | 'scan' | 'code' | 'confirm' | 'result'
  const [scanType, setScanType] = useState(deriveScanType)
  const [confirmTarget, setConfirmTarget] = useState(null) // { student, code, codePrefix }
  const [result, setResult] = useState(null)
  const [arrivals, setArrivals] = useState([])
  const [scanning, setScanning] = useState(false)
  const [clock, setClock] = useState('')
  const online = useNetworkStatus()

  const scanTypeRef = useRef(scanType)
  const lastScannedRef = useRef(null)
  const resultTimerRef = useRef(null)
  const priorViewRef = useRef('code')
  // Once staff manually flips the pill, stop the clock-based tick from
  // silently reverting it back — the override holds for the rest of the
  // app session. A fresh app launch resumes automatic mode.
  const manualOverrideRef = useRef(false)

  useEffect(() => { scanTypeRef.current = scanType }, [scanType])

  useEffect(() => {
    const tick = () => {
      if (!manualOverrideRef.current) setScanType(deriveScanType())
      setClock(currentLagosClock())
    }
    tick()
    const id = setInterval(tick, 30000)
    return () => clearInterval(id)
  }, [])

  const toggleScanType = useCallback(() => {
    manualOverrideRef.current = true
    setScanType(t => t === 'arrival' ? 'departure' : 'arrival')
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
      data = await scanCard(id, scanTypeRef.current)
    } catch {
      setScanning(false)
      showResult({ state: 'error', student: null, message: 'Could not reach the server — try again' }, returnTo)
      return
    }
    setScanning(false)

    if (data.error === 'unauthorized') {
      showResult({ state: 'error', student: null, message: 'Invalid school key — check setup' }, returnTo)
      return
    }
    if (data.error === 'not_found') {
      showResult({ state: 'error', student: null, message: `Card not recognised: ${id}` }, returnTo)
      return
    }
    if (data.error === 'unverified') {
      showResult({ state: 'warning', student: data.student, message: data.message }, returnTo)
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
  }, [showResult])

  const enterPickView = useCallback(() => setView('pick'), [])
  const enterCodeView = useCallback(() => setView('code'), [])
  const backToScanner = useCallback(() => setView('scan'), [])

  const submitCode = useCallback(async (code) => {
    const trimmed = code.trim()
    if (!trimmed) return

    setScanning(true)
    let data
    try {
      data = await lookupStudent(trimmed)
    } catch {
      setScanning(false)
      showResult({ state: 'error', student: null, message: 'Could not reach the server — try again' }, 'code')
      return
    }
    setScanning(false)

    if (data.error === 'unauthorized') {
      showResult({ state: 'error', student: null, message: 'Invalid school key — check setup' }, 'code')
      return
    }
    if (data.error === 'not_found') {
      showResult({ state: 'error', student: null, message: 'Code not found — check the digits and try again' }, 'code')
      return
    }
    setConfirmTarget({ student: data.student, code: trimmed, codePrefix: data.codePrefix })
    setView('confirm')
  }, [showResult])

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
    enterPickView, enterCodeView, backToScanner, submitCode, confirmCheckIn, cancelConfirm,
    directScan: handleScan, toggleScanType
  }
}
