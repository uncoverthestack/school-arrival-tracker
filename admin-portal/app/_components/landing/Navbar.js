'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { RequestDemoButton } from '../RequestDemoButton'
import { RollingText } from '../RollingText'
import logoIcon from '@/public/brand/childmap-icon-256.png'

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#why-us', label: 'Why Childmap' },
  { href: '#pricing', label: 'Pricing' },
]

// No hamburger — everything visible at every size. A primary bar (logo left,
// actions right) plus a secondary nav band on mobile, same two-band pattern
// used site-wide. Starts transparent over the dark hero (light text for
// contrast), then flips to an opaque white bar with dark text once scrolled
// past it — the bar's own colors have to track that, not just its background.
export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      data-theme={scrolled ? 'light' : undefined}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b ${
        scrolled ? 'bg-white/90 backdrop-blur-md border-outline-variant' : 'bg-transparent border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between py-4 md:grid md:grid-cols-[1fr_auto_1fr]">
          <Link href="/" className="flex items-center gap-2.5 group md:justify-self-start">
            <Image src={logoIcon} alt="" width={34} height={34} className="size-8.5 shrink-0" />
            <span className={`font-bold text-base ${scrolled ? 'text-on-surface' : 'text-white'}`}>Childmap</span>
          </Link>

          <nav className={`hidden md:flex items-center gap-8 text-sm font-medium md:justify-self-center ${scrolled ? 'text-on-surface-variant' : 'text-white/70'}`}>
            {NAV_LINKS.map(link => (
              <a key={link.href} href={link.href} className={`transition-colors ${scrolled ? 'hover:text-on-surface' : 'hover:text-white'}`}>
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-5 md:justify-self-end">
            <Link
              href="/login"
              className={`group text-sm font-medium transition-colors ${scrolled ? 'text-on-surface-variant hover:text-on-surface' : 'text-white/70 hover:text-white'}`}
            >
              <RollingText>Login</RollingText>
            </Link>
            <RequestDemoButton className="group inline-flex h-10 items-center rounded-full bg-[#1d6fc4] text-white font-semibold px-6 text-sm shadow-sm hover:bg-[#1d6fc4]/90 transition-all active:scale-[0.97]">
              <RollingText>Request Demo</RollingText>
            </RequestDemoButton>
          </div>
        </div>

        <nav
          className={`md:hidden flex flex-wrap items-center justify-center gap-x-6 gap-y-1.5 border-t py-2.5 text-sm font-medium ${
            scrolled ? 'border-outline-variant text-on-surface-variant' : 'border-white/10 text-white/70'
          }`}
        >
          {NAV_LINKS.map(link => (
            <a key={link.href} href={link.href} className={`transition-colors ${scrolled ? 'hover:text-on-surface' : 'hover:text-white'}`}>
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
