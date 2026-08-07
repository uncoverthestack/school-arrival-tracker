import Link from 'next/link'
import { SiYoutube, SiInstagram, SiX, SiFacebook, SiTiktok } from 'react-icons/si'
import { RequestDemoButton } from '../RequestDemoButton'
import { RollingText } from '../RollingText'

// Only Instagram has a real account so far — the rest stay href="#" until they exist.
const SOCIAL_LINKS = [
  { name: 'YouTube', Icon: SiYoutube, url: '#' },
  { name: 'Instagram', Icon: SiInstagram, url: 'https://www.instagram.com/childmap_technologies?utm_source=qr' },
  { name: 'X', Icon: SiX, url: '#' },
  { name: 'Facebook', Icon: SiFacebook, url: '#' },
  { name: 'TikTok', Icon: SiTiktok, url: '#' },
]

function FooterLinkColumn({ title, children }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="mb-2 text-xs tracking-widest text-[#5b9fe3] uppercase font-semibold">
        {title}
      </div>
      {children}
    </div>
  )
}

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-white/10 bg-[#101010]">
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 gap-12 border-b border-white/10 pb-14 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col items-start lg:col-span-5 lg:pr-8">
            <h3 className="mb-6 text-2xl md:text-3xl font-bold tracking-tight text-white text-balance">
              Real-time school arrival &amp; departure tracking.
            </h3>
            <p className="mb-8 max-w-sm text-sm leading-relaxed text-white/50 text-pretty">
              Replace the paper logbook with instant gate check-ins, live dashboards, and SMS alerts parents actually see.
            </p>
            <RequestDemoButton className="group inline-flex w-fit items-center justify-center rounded-full bg-[#1d6fc4] text-white px-8 py-3.5 text-sm font-semibold shadow-sm transition-colors hover:bg-[#1d6fc4]/90 active:scale-[0.97]">
              <RollingText>Request Demo</RollingText>
            </RequestDemoButton>
          </div>

          <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:col-span-7 lg:pl-8">
            <FooterLinkColumn title="PRODUCT">
              <a href="#features" className="text-sm text-white/50 hover:text-white transition-colors">Features</a>
              <a href="#why-us" className="text-sm text-white/50 hover:text-white transition-colors">Why Childmap</a>
              <a href="#pricing" className="text-sm text-white/50 hover:text-white transition-colors">Pricing</a>
            </FooterLinkColumn>

            <FooterLinkColumn title="COMPANY">
              <Link href="/about" className="text-sm text-white/50 hover:text-white transition-colors">About Us</Link>
              <Link href="/privacy" className="text-sm text-white/50 hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-sm text-white/50 hover:text-white transition-colors">Terms</Link>
            </FooterLinkColumn>

            <FooterLinkColumn title="ACCOUNT">
              <Link href="/login" className="text-sm text-white/50 hover:text-white transition-colors">Login</Link>
              <Link href="/signup" className="text-sm text-white/50 hover:text-white transition-colors">Create Account</Link>
            </FooterLinkColumn>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-8 pt-10 lg:flex-row lg:items-center">
          <div className="flex items-center gap-3">
            <img src="/brand/childmap-icon-256.png" alt="" width={28} height={28} className="size-7 shrink-0" />
            <span className="font-sans text-lg font-bold tracking-tight text-white">Childmap</span>
          </div>

          <div className="flex items-center gap-3">
            {SOCIAL_LINKS.map(s => (
              <a
                key={s.name}
                href={s.url}
                target={s.url === '#' ? undefined : '_blank'}
                rel={s.url === '#' ? undefined : 'noopener noreferrer'}
                aria-label={s.name}
                className="flex h-9 w-9 items-center justify-center border border-white/10 bg-white/[0.02] text-white/50 transition-all hover:border-white/30 hover:text-white"
              >
                <s.Icon size={15} aria-hidden="true" />
              </a>
            ))}
          </div>

          <p className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} Childmap. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
