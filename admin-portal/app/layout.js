import './globals.css'
import { getAdminSession } from '@/lib/session'
import { SiteNav } from './_components/SiteNav'

export const metadata = {
  title: 'School Arrival Tracker',
  description: 'Real-time school gate arrival dashboard with parent notifications',
}

export default async function RootLayout({ children }) {
  const session = await getAdminSession()

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-950">

        <SiteNav schoolId={session.schoolId} schoolName={session.schoolName} />

        <main className="flex-1">{children}</main>

      </body>
    </html>
  )
}
