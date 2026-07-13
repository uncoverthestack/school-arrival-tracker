import './globals.css'
import { getAdminSession } from '@/lib/session'
<<<<<<< HEAD
import NavBar from './NavBar'
=======
import { SiteNav } from './_components/SiteNav'
>>>>>>> frontend/ui-changes

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
      <body className="min-h-full flex flex-col bg-gray-950">
<<<<<<< HEAD
        <NavBar schoolId={session.schoolId} schoolName={session.schoolName} />
        <main className="flex-1 min-w-0">{children}</main>
=======

        <SiteNav schoolId={session.schoolId} schoolName={session.schoolName} />

        <main className="flex-1">{children}</main>

>>>>>>> frontend/ui-changes
      </body>
    </html>
  )
}
