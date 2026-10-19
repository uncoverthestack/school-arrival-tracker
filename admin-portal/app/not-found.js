import Link from 'next/link'

export const metadata = {
  title: 'Page Not Found',
}

export default function NotFound() {
  return (
    <div data-theme="light" className="min-h-screen flex flex-col items-center justify-center gap-4 bg-surface text-on-surface font-kiosk px-4 text-center">
      <p className="text-label-large font-bold tracking-[0.5px] text-primary">404</p>
      <h1 className="text-headline-large font-bold text-on-surface">Page not found</h1>
      <p className="text-body-medium tracking-[0.1px] text-on-surface-variant max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
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
