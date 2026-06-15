import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: "School Arrival Tracker",
  description: "Real-time school gate arrival dashboard with parent notifications",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-950">

        <nav className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center gap-6">
          <span className="text-white font-bold text-sm tracking-wide">SchoolPass</span>
          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/gate"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Gate Scanner
          </Link>
        </nav>

        <main className="flex-1">{children}</main>

      </body>
    </html>
  );
}
