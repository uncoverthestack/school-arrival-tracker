import './globals.css'
import { getAdminSession } from '@/lib/session'
import { SiteNav } from './_components/SiteNav'
import { themeInitScript } from '@/lib/theme'

export const metadata = {
  title: 'SchoolPass — School Arrival Tracker',
  description: 'Real-time school gate arrival dashboard with parent notifications',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default async function RootLayout({ children }) {
  const session = await getAdminSession()

  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="theme-auto min-h-full flex flex-col bg-surface text-on-surface">
        <SiteNav schoolId={session.schoolId} schoolName={session.schoolName} />
        <main className="flex-1 min-w-0">{children}</main>
      </body>
    </html>
  )
}
