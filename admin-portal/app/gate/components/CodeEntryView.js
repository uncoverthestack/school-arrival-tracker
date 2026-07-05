'use client'

import { useState } from 'react'

const CODE_LENGTH = 6
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

const keyClass =
  'w-24 h-[72px] rounded-md bg-surface-container border border-outline-variant ' +
  'text-[24px] leading-8 text-on-surface flex items-center justify-center cursor-pointer'

export function CodeEntryView({ onSubmit, onBack, scanning }) {
  const [digits, setDigits] = useState([])

  const press = (d) => {
    setDigits(prev => (prev.length < CODE_LENGTH ? [...prev, d] : prev))
  }
  const backspace = () => setDigits(prev => prev.slice(0, -1))
  const clear = () => setDigits([])

  const submit = (e) => {
    e.preventDefault()
    if (digits.length !== CODE_LENGTH) return
    const code = digits.join('')
    setDigits([])
    onSubmit(code)
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-10 max-w-full">
      <div className="flex flex-col items-start gap-4 w-[280px] text-left">
        <p className="text-headline-small text-on-surface">Enter student code</p>
        <p className="text-body-large tracking-[0.5px] text-on-surface-variant">For a lost or damaged card</p>

        <form onSubmit={submit} className="flex flex-col gap-4 w-full">
          <div className="flex gap-2">
            {Array.from({ length: CODE_LENGTH }).map((_, i) => (
              <div
                key={i}
                className="w-16 h-20 flex items-center justify-center rounded-md bg-surface-container-lowest border border-outline-variant text-[36px] leading-[44px] text-on-surface"
              >
                {digits[i] ?? ''}
              </div>
            ))}
          </div>
          <button
            type="submit"
            disabled={digits.length !== CODE_LENGTH || scanning}
            className="h-11 px-5 rounded-sm bg-primary text-on-primary font-medium text-label-large tracking-[0.1px] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue →
          </button>
        </form>

        <button
          type="button"
          onClick={onBack}
          className="self-center text-label-large font-medium tracking-[0.1px] text-primary bg-transparent border-none cursor-pointer p-0"
        >
          Use card instead
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {KEYS.map((n) => (
          <button key={n} type="button" onClick={() => press(n)} className={keyClass}>
            {n}
          </button>
        ))}
        <button type="button" onClick={clear} aria-label="Clear" className={keyClass}>✕</button>
        <button type="button" onClick={() => press('0')} className={keyClass}>0</button>
        <button type="button" onClick={backspace} aria-label="Backspace" className={keyClass}>⌫</button>
      </div>
    </div>
  )
}
