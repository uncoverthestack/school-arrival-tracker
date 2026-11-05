'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { getFaceDescriptors } from '@/app/actions/scan'

const MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights'

// Module-level cache so models only load once per browser session, even
// if FaceScanView mounts/unmounts multiple times during a kiosk shift.
let cachedFaceApi = null

async function getFaceApi() {
  if (!cachedFaceApi) {
    cachedFaceApi = await import('face-api.js')
  }
  const fa = cachedFaceApi
  if (!fa.nets.tinyFaceDetector.isLoaded) {
    await Promise.all([
      fa.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      fa.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
      fa.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ])
  }
  return fa
}

export function FaceScanView({ onScan, onEnterCode }) {
  const videoRef = useRef(null)
  const [status, setStatus] = useState('loading') // loading | ready | no-students | error
  const [loadMsg, setLoadMsg] = useState('Loading face models…')
  const matcherRef = useRef(null)
  const streamRef = useRef(null)
  const loopRef = useRef(null)
  const lastMatchRef = useRef(null)
  const cancelledRef = useRef(false)

  const stopCamera = useCallback(() => {
    clearTimeout(loopRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }, [])

  useEffect(() => {
    cancelledRef.current = false

    async function init() {
      try {
        setStatus('loading')
        setLoadMsg('Loading face models…')
        const faceapi = await getFaceApi()
        if (cancelledRef.current) return

        setLoadMsg('Loading student faces…')
        const { students = [] } = await getFaceDescriptors()
        if (cancelledRef.current) return

        if (students.length === 0) {
          setStatus('no-students')
          return
        }

        const labeled = students.map(s => {
          const arr = new Float32Array(JSON.parse(s.faceDescriptor))
          return new faceapi.LabeledFaceDescriptors(s.id, [arr])
        })
        matcherRef.current = {
          matcher: new faceapi.FaceMatcher(labeled, 0.55),
          byId: Object.fromEntries(students.map(s => [s.id, s]))
        }

        setLoadMsg('Starting camera…')
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'user' }, width: { ideal: 640 }, height: { ideal: 480 } }
        })
        if (cancelledRef.current) { stream.getTracks().forEach(t => t.stop()); return }

        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        setStatus('ready')

        async function detect() {
          if (cancelledRef.current || !videoRef.current || !matcherRef.current) return
          try {
            const det = await faceapi
              .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
              .withFaceLandmarks(true)
              .withFaceDescriptor()

            if (det) {
              const match = matcherRef.current.matcher.findBestMatch(det.descriptor)
              if (match.label !== 'unknown') {
                const student = matcherRef.current.byId[match.label]
                const now = Date.now()
                const last = lastMatchRef.current
                // Debounce: same student can't re-trigger within 4 seconds
                if (!last || last.id !== student.id || now - last.time > 4000) {
                  lastMatchRef.current = { id: student.id, time: now }
                  onScan(student.code)
                }
              }
            }
          } catch (_) {}
          loopRef.current = setTimeout(detect, 600)
        }

        detect()
      } catch (err) {
        console.error('FaceScanView:', err)
        if (!cancelledRef.current) setStatus('error')
      }
    }

    init()
    return () => {
      cancelledRef.current = true
      stopCamera()
    }
  }, [onScan, stopCamera])

  return (
    <div className="flex flex-col items-center gap-6 text-center max-w-xs w-full">
      <p className="text-headline-small text-on-surface">Face Scan</p>

      {status === 'loading' && (
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-body-medium tracking-[0.25px] text-on-surface-variant">{loadMsg}</p>
        </div>
      )}

      {status === 'no-students' && (
        <p className="text-body-large tracking-[0.5px] text-on-surface-variant">
          No students have a face enrolled yet. Go to the Students page to add face IDs.
        </p>
      )}

      {status === 'error' && (
        <p className="text-body-large tracking-[0.5px] text-error">
          Camera or face detection unavailable on this device.
        </p>
      )}

      {/* Camera feed — hidden while loading so video element is always in DOM */}
      <div
        className={`relative w-full rounded-2xl overflow-hidden bg-surface-container ${status === 'ready' ? 'block' : 'hidden'}`}
        style={{ aspectRatio: '3/4' }}
      >
        <video ref={videoRef} muted playsInline className="w-full h-full object-cover" />
        {/* Oval guide frame */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-40 h-52 border-2 border-primary/70 rounded-full" />
        </div>
        <p className="absolute bottom-3 left-0 right-0 text-center text-xs text-white/60">
          Position face inside the oval
        </p>
      </div>

      <button
        type="button"
        onClick={onEnterCode}
        className="text-label-large font-medium tracking-[0.1px] text-primary bg-transparent border-none cursor-pointer p-0"
      >
        ← Change method
      </button>
    </div>
  )
}
