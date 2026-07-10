import './globals.css'
import { getAdminSession } from '@/lib/session'
import NavBar from './NavBar'

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
        <NavBar schoolId={session.schoolId} schoolName={session.schoolName} />
        <main className="flex-1 min-w-0">{children}</main>
      </body>
    </html>
  )
}
