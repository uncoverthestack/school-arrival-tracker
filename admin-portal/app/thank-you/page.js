import Link from 'next/link'

export const metadata = {
  title: 'Thank You',
}

export default function ThankYouPage() {
  return (
    <div data-theme="light" className="min-h-screen flex flex-col items-center justify-center gap-4 bg-surface text-on-surface font-kiosk px-4 text-center">
      <div className="w-14 h-14 rounded-full bg-success-container flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 12l5 5L20 6" stroke="var(--color-on-success-container)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h1 className="text-headline-large font-bold text-on-surface">Request received</h1>
      <p className="text-body-medium tracking-[0.1px] text-on-surface-variant max-w-sm">
        Thanks for your interest in Childmap — we will contact you as soon as possible.
      </p>
      <Link
        href="/"
        className="mt-4 h-11 px-6 rounded-sm bg-primary text-on-primary font-medium text-label-large tracking-[0.1px] inline-flex items-center justify-center focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        ← Back home
      </Link>
    </div>
  )
}
