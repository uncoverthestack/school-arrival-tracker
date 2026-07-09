import { IdCard } from './IdCard'

export function ScannerView({ onEnterCode, onFaceScan }) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <IdCard variant="scanning" />
      <p className="text-headline-large text-on-surface">Ready to scan</p>
      <p className="text-body-large tracking-[0.5px] text-on-surface-variant">Hold your ID card to the reader</p>
      <div className="flex flex-col items-center gap-2">
        <p className="flex items-center gap-1 text-body-medium tracking-[0.25px] text-on-surface-variant">
          Card won&apos;t scan?
          <button
            type="button"
            onClick={onEnterCode}
            className="text-label-large font-medium tracking-[0.1px] text-primary bg-transparent border-none cursor-pointer p-0"
          >
            Enter code →
          </button>
        </p>
        <button
          type="button"
          onClick={onFaceScan}
          className="text-label-large font-medium tracking-[0.1px] text-primary bg-transparent border-none cursor-pointer p-0"
        >
          Use face scan →
        </button>
      </div>
    </div>
  )
}
