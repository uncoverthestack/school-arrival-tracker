'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

function pad(n) { return String(n).padStart(2, '0') }

export function AttendanceSettings({ arrivalCutoffHour, arrivalCutoffMinute, departureCutoffHour, departureCutoffMinute }) {
  const router = useRouter()
  const [arrivalTime, setArrivalTime] = useState(`${pad(arrivalCutoffHour)}:${pad(arrivalCutoffMinute)}`)
  const [departureTime, setDepartureTime] = useState(`${pad(departureCutoffHour)}:${pad(departureCutoffMinute)}`)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  async function handleSave(e) {
    e.preventDefault()
    setError('')
    setSaved(false)
    setSaving(true)

    const [arrivalHour, arrivalMinute] = arrivalTime.split(':').map(Number)
    const [departureHour, departureMinute] = departureTime.split(':').map(Number)

    const res = await fetch('/api/settings/attendance', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        arrivalCutoffHour: arrivalHour,
        arrivalCutoffMinute: arrivalMinute,
        departureCutoffHour: departureHour,
        departureCutoffMinute: departureMinute,
      })
    })
    const data = await res.json()
    setSaving(false)

    if (!res.ok) { setError(data.error ?? 'Something went wrong'); return }
    setSaved(true)
    router.refresh()
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm text-on-surface-variant mb-1">Arrival cutoff time</label>
        <p className="text-xs text-on-surface-variant mb-1.5">Alerts a parent if their child hasn't checked in by this time.</p>
        <input
          type="time"
          value={arrivalTime}
          onChange={e => { setArrivalTime(e.target.value); setSaved(false) }}
          required
          className="w-40 bg-surface-container border border-outline-variant rounded-xl px-4 py-2.5 outline-none focus:border-primary"
        />
      </div>

      <div>
        <label className="block text-sm text-on-surface-variant mb-1">Departure cutoff time</label>
        <p className="text-xs text-on-surface-variant mb-1.5">Alerts a parent if their child checked in but hasn't checked out by this time.</p>
        <input
          type="time"
          value={departureTime}
          onChange={e => { setDepartureTime(e.target.value); setSaved(false) }}
          required
          className="w-40 bg-surface-container border border-outline-variant rounded-xl px-4 py-2.5 outline-none focus:border-primary"
        />
      </div>

      {error && <p className="text-error text-sm">{error}</p>}
      {saved && <p className="text-success text-sm">Saved.</p>}

      <button
        type="submit"
        disabled={saving}
        className="self-start px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold disabled:opacity-50 transition-opacity hover:opacity-90"
      >
        {saving ? 'Saving…' : 'Save'}
      </button>
    </form>
  )
}
