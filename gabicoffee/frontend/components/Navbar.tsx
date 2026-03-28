'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { useLang } from '@/context/LanguageContext'
import { useT } from '@/lib/translations'
import TransitionLink from '@/components/TransitionLink'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const pathname = usePathname()
  const { openCart, totalItems } = useCart()
  const { lang, toggle } = useLang()
  const t = useT(lang)

  // Secret admin trigger: click logo 5 times within 3 seconds
  const clickCountRef = useRef(0)
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const adminTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleLogoClick = () => {
    clickCountRef.current += 1
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current)
    clickTimerRef.current = setTimeout(() => { clickCountRef.current = 0 }, 3000)

    if (clickCountRef.current >= 5) {
      clickCountRef.current = 0
      setShowAdmin(true)
      if (adminTimerRef.current) clearTimeout(adminTimerRef.current)
      adminTimerRef.current = setTimeout(() => setShowAdmin(false), 8000)
    }
  }

  const links = [
    { href: '/',          label: t.nav.home      },
    { href: '/menu',      label: t.nav.menu      },
    { href: '/about',     label: t.nav.about     },
    { href: '/contact',   label: t.nav.contact   },
  ]

  return (
    <header
      className="sticky top-0 z-50 shadow-lg"
      style={{
        backgroundImage: 'url(/navbar-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* dark overlay so text stays readable */}
      <div style={{ background: 'rgba(15,6,2,0.52)' }}>
      <nav className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo + Language toggle (left side) */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center" onClick={handleLogoClick}>
            <img
              src="/logo.png"
              alt="גבריאלס' קפה"
              style={{
                height: '64px',
                width: 'auto',
                mixBlendMode: 'screen',
                filter: 'brightness(1.15) contrast(1.05)',
                objectFit: 'contain',
              }}
            />
          </Link>
          <button
            onClick={toggle}
            className="hidden md:block text-white hover:text-amber-300 text-sm border border-white/50 hover:border-amber-300 rounded-full px-3 py-2 transition-colors font-bold tracking-wide bg-black/20"
            title={lang === 'he' ? 'Switch to English' : 'עבור לעברית'}
          >
            {lang === 'he' ? '🌐 EN' : '🌐 עב'}
          </button>
        </div>

        {/* Desktop links */}
        <ul className="hidden md:flex gap-8">
          {links.map(({ href, label }) => (
            <li key={href}>
              <TransitionLink
                href={href}
                className={`text-base font-bold transition-colors duration-200 drop-shadow ${
                  pathname === href
                    ? 'text-amber-300 border-b-2 border-amber-300 pb-0.5'
                    : 'text-cream hover:text-amber-300'
                }`}
              >
                {label}
              </TransitionLink>
            </li>
          ))}
        </ul>

        {/* Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {/* Secret admin link — visible only after logo clicked 5× */}
          {showAdmin && (
            <Link
              href="/admin"
              className="text-amber-300 hover:text-amber-200 text-sm border border-amber-400/50 rounded-full px-3 py-1.5 transition-all bg-black/30 animate-pulse"
              title="ניהול"
            >
              🔐
            </Link>
          )}

          {/* Cart button */}
          <button onClick={openCart} className="relative btn-primary text-sm py-2 px-5">
            {t.nav.cart}
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black rounded-full w-5 h-5 flex items-center justify-center shadow">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Hamburger */}
        <button
          className="md:hidden text-white text-2xl focus:outline-none font-bold"
          onClick={() => setOpen(!open)}
          aria-label="תפריט ניווט"
        >
          {open ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-coffee-900/90 px-4 pb-4 flex flex-col gap-3">
          {links.map(({ href, label }) => (
            <TransitionLink
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`text-base py-2 border-b border-coffee-700 ${
                pathname === href ? 'text-coffee-300 font-semibold' : 'text-coffee-100'
              }`}
            >
              {label}
            </TransitionLink>
          ))}
          <button
            onClick={() => { setOpen(false); toggle() }}
            className="text-center text-coffee-300 border border-coffee-600 rounded-full py-2 text-sm font-bold"
          >
            {lang === 'he' ? '🌐 Switch to English' : '🌐 עבור לעברית'}
          </button>
          <Link
            href="/menu"
            onClick={() => setOpen(false)}
            className="btn-primary text-center mt-2 text-sm"
          >
            {t.nav.order}
          </Link>
          <button
            onClick={() => { setOpen(false); openCart() }}
            className="relative btn-primary text-center text-sm py-2"
          >
            {t.nav.cart}
            {totalItems > 0 && (
              <span className="mr-1 bg-red-500 text-white text-xs font-black rounded-full px-1.5 py-0.5">
                {totalItems}
              </span>
            )}
          </button>
          {showAdmin && (
            <Link
              href="/admin"
              onClick={() => { setOpen(false); setShowAdmin(false) }}
              className="text-center text-amber-300 border border-amber-500/50 rounded-full py-2 text-sm animate-pulse"
            >
              🔐 ניהול
            </Link>
          )}
        </div>
      )}
      </div>
    </header>
  )
}
