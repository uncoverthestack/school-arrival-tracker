function CardIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <rect x="4" y="10" width="32" height="20" rx="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="13" cy="20" r="4" stroke="currentColor" strokeWidth="2" />
      <rect x="20" y="16" width="10" height="2" rx="1" fill="currentColor" />
      <rect x="20" y="20" width="7" height="2" rx="1" fill="currentColor" />
    </svg>
  )
}

function KeypadIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      {[
        [10,10],[20,10],[30,10],
        [10,20],[20,20],[30,20],
        [10,30],[20,30],[30,30],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="3" fill="currentColor" />
      ))}
    </svg>
  )
}

function FaceIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="2" />
      <circle cx="15" cy="17" r="2" fill="currentColor" />
      <circle cx="25" cy="17" r="2" fill="currentColor" />
      <path d="M14 25 Q20 30 26 25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  )
}

const OPTIONS = [
  {
    key: 'card',
    Icon: CardIcon,
    title: 'ID Card',
    desc: 'Tap or hold your card to the reader',
  },
  {
    key: 'code',
    Icon: KeypadIcon,
    title: 'Enter Code',
    desc: 'Type your 6-digit student code',
  },
  {
    key: 'face',
    Icon: FaceIcon,
    title: 'Face Scan',
    desc: 'Look at the camera to be recognised',
  },
]

export function ModePickerView({ onCardScan, onCodeEntry, onFaceScan }) {
  const handlers = { card: onCardScan, code: onCodeEntry, face: onFaceScan }

  return (
    <div className="flex flex-col items-center gap-10 text-center w-full max-w-2xl">
      <div>
        <p className="text-headline-medium font-bold text-on-surface">Check in</p>
        <p className="text-body-large tracking-[0.5px] text-on-surface-variant mt-1">
          Choose how you&apos;d like to verify
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 w-full">
        {OPTIONS.map(({ key, Icon, title, desc }) => (
          <button
            key={key}
            type="button"
            onClick={handlers[key]}
            className={
              'flex flex-col items-center gap-4 p-6 rounded-2xl ' +
              'bg-surface-container border border-outline-variant ' +
              'hover:bg-surface-container-high hover:border-primary ' +
              'active:scale-95 transition-all cursor-pointer text-center'
            }
          >
            <span className="text-primary">
              <Icon />
            </span>
            <div>
              <p className="text-title-medium font-semibold text-on-surface">{title}</p>
              <p className="text-body-small tracking-[0.4px] text-on-surface-variant mt-1">{desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
