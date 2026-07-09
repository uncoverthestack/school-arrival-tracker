import { IdCard } from './IdCard'

export function ScannerView({ onBack }) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <IdCard variant="scanning" />
      <p className="text-headline-large text-on-surface">Ready to scan</p>
      <p className="text-body-large tracking-[0.5px] text-on-surface-variant">Hold your ID card to the reader</p>
      <button
        type="button"
        onClick={onBack}
        className="text-label-large font-medium tracking-[0.1px] text-primary bg-transparent border-none cursor-pointer p-0"
      >
        ← Change method
      </button>
    </div>
  )
}
