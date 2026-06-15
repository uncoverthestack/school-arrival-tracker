'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { scanCard } from '@/app/actions/scan'

export default function GatePage() {
  const [mode, setMode] = useState('qr')
  const [scanType, setScanType] = useState('arrival')
  const [result, setResult] = useState(null)
  const [arrivals, setArrivals] = useState([])
  const [scanning, setScanning] = useState(false)
  const [today, setToday] = useState('')

  const scanTypeRef = useRef(scanType)
  const lastScannedRef = useRef(null)
  const resultTimerRef = useRef(null)
  const qrScannerRef = useRef(null)
  const rfidInputRef = useRef(null)
  const rfidBufferRef = useRef('')
  const rfidFlushRef = useRef(null)

  useEffect(() => { scanTypeRef.current = scanType }, [scanType])

  useEffect(() => {
    setToday(new Date().toLocaleDateString('en-GB', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      timeZone: 'Africa/Lagos'
    }))
  }, [])

  const showResult = useCallback((data) => {
    setResult(data)
    clearTimeout(resultTimerRef.current)
    resultTimerRef.current = setTimeout(() => setResult(null), 5000)
  }, [])

  const handleScan = useCallback(async (cardId) => {
    const id = cardId.trim()
    if (!id || lastScannedRef.current === id) return
    lastScannedRef.current = id
    setTimeout(() => { lastScannedRef.current = null }, 3000)

    setScanning(true)
    const data = await scanCard(id, scanTypeRef.current)
    setScanning(false)

    if (data.error === 'not_found') {
      showResult({ state: 'error', icon: '❌', student: null, message: `Card not recognised: ${id}` })
      return
    }
    if (data.duplicate) {
      showResult({ state: 'warning', icon: '⚠️', student: data.student, message: data.message })
      return
    }
    if (data.success) {
      showResult({ state: 'success', icon: scanTypeRef.current === 'arrival' ? '✅' : '🚪', student: data.student, message: data.message })
      setArrivals(prev => [{ ...data.student, time: data.time, type: scanTypeRef.current }, ...prev])
    }
  }, [showResult])

  // ── QR scanner ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (mode !== 'qr') return
    let scanner

    import('html5-qrcode').then(({ Html5Qrcode }) => {
      scanner = new Html5Qrcode('qr-reader')
      scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        handleScan,
        () => {}
      ).then(() => {
        qrScannerRef.current = scanner
      }).catch(console.warn)
    })

    return () => {
      qrScannerRef.current?.stop().catch(() => {})
      qrScannerRef.current = null
    }
  }, [mode, handleScan])

  // ── RFID HID: keep input focused, capture keystrokes ─────────────────────────
  useEffect(() => {
    if (mode !== 'rfid') return
    const input = rfidInputRef.current
    if (!input) return
    input.focus()
    const refocus = () => setTimeout(() => input.focus(), 80)
    input.addEventListener('blur', refocus)
    return () => input.removeEventListener('blur', refocus)
  }, [mode])

  const handleRFIDKey = useCallback((e) => {
    if (e.key === 'Enter') {
      const cardId = rfidBufferRef.current
      rfidBufferRef.current = ''
      clearTimeout(rfidFlushRef.current)
      if (rfidInputRef.current) rfidInputRef.current.value = ''
      if (cardId) handleScan(cardId)
      return
    }
    if (e.key.length === 1) {
      rfidBufferRef.current += e.key
      clearTimeout(rfidFlushRef.current)
      // Auto-flush after 100 ms for readers that don't send Enter
      rfidFlushRef.current = setTimeout(() => {
        const cardId = rfidBufferRef.current
        rfidBufferRef.current = ''
        if (rfidInputRef.current) rfidInputRef.current.value = ''
        if (cardId) handleScan(cardId)
      }, 100)
    }
  }, [handleScan])

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 pb-12">
      <div className="max-w-lg mx-auto">

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Gate Scanner</h1>
          <p className="text-gray-400 text-sm mt-1">{today}</p>
        </div>

        {/* Mode toggle */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {[['qr', '📷 Camera (QR)'], ['rfid', '📡 RFID Scanner']].map(([m, label]) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`py-3 rounded-xl text-sm font-semibold border-2 transition-colors ${
                mode === m
                  ? 'border-indigo-500 bg-indigo-950 text-white'
                  : 'border-gray-700 bg-gray-900 text-gray-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Arrival / Departure toggle */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          {[['arrival', '↓ Arrival'], ['departure', '↑ Departure']].map(([t, label]) => (
            <button
              key={t}
              type="button"
              onClick={() => setScanType(t)}
              className={`py-3 rounded-xl text-sm font-semibold border-2 transition-colors ${
                scanType === t
                  ? 'border-green-500 bg-green-950 text-white'
                  : 'border-gray-700 bg-gray-900 text-gray-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* QR camera */}
        {mode === 'qr' && (
          <div className="bg-gray-900 rounded-2xl p-3 mb-4 overflow-hidden">
            <div id="qr-reader" className="w-full rounded-xl overflow-hidden" />
          </div>
        )}

        {/* RFID HID input */}
        {mode === 'rfid' && (
          <div className="bg-gray-900 rounded-2xl p-10 mb-4 text-center border-2 border-dashed border-gray-700">
            <div className="text-5xl mb-3">📡</div>
            <p className="text-gray-400 mb-4 text-sm">Ready — tap card on reader</p>
            <input
              ref={rfidInputRef}
              type="text"
              onKeyDown={handleRFIDKey}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-center text-gray-400 text-sm outline-none focus:border-indigo-500"
              placeholder="Waiting for card..."
              readOnly
            />
          </div>
        )}

        {/* Processing indicator */}
        {scanning && (
          <div className="text-center text-gray-400 text-sm mb-4 animate-pulse">
            Checking card…
          </div>
        )}

        {/* Scan result with student photo */}
        {result && (
          <div className={`rounded-2xl p-6 mb-5 text-center transition-all ${
            result.state === 'success' ? 'bg-green-950 border-2 border-green-500' :
            result.state === 'warning' ? 'bg-yellow-950 border-2 border-yellow-500' :
            'bg-red-950 border-2 border-red-500'
          }`}>
            {result.student?.photoUrl ? (
              <img
                src={result.student.photoUrl}
                alt={result.student.name}
                className="w-24 h-24 rounded-full object-cover mx-auto mb-3 border-4 border-white/20"
              />
            ) : (
              <div className="text-5xl mb-3">{result.icon}</div>
            )}
            {result.student && (
              <>
                <p className="text-xl font-bold">{result.student.name}</p>
                <p className="text-gray-300 text-sm mb-2">{result.student.studentClass}</p>
              </>
            )}
            <p className="text-sm opacity-80">{result.message}</p>
          </div>
        )}

        {/* Today's arrivals log */}
        <h2 className="text-gray-400 text-xs uppercase tracking-widest mb-3">Today&apos;s Log</h2>
        {arrivals.length === 0 ? (
          <p className="text-gray-600 text-sm text-center py-10">No scans yet this session</p>
        ) : (
          <div className="space-y-2">
            {arrivals.map((a, i) => (
              <div key={i} className="bg-gray-900 rounded-xl px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {a.photoUrl ? (
                    <img src={a.photoUrl} alt={a.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-lg shrink-0">
                      {a.name?.[0]}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold">{a.name}</p>
                    <p className="text-xs text-gray-500">{a.studentClass}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    a.type === 'arrival' ? 'bg-green-900 text-green-400' : 'bg-blue-900 text-blue-400'
                  }`}>
                    {a.type === 'arrival' ? '↓ In' : '↑ Out'}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
