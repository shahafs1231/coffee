'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLang } from '@/context/LanguageContext'
import { useT } from '@/lib/translations'

const DAYS_EN: Record<string, string> = {
  'ראשון, שלישי – חמישי': 'Sun, Tue–Thu',
  'שני': 'Monday',
  'שישי': 'Friday',
  'ראשון – חמישי': 'Sun–Thu',
}
function translateDay(d: string, lang: string) { return lang === 'en' ? (DAYS_EN[d] ?? d) : d }
function translateHr(h: string, lang: string) { return lang === 'en' && h === 'סגור' ? 'Closed' : h }

interface Settings {
  address: string
  phone: string
  email: string
  hours: { days: string; hours: string }[]
}

const DEFAULT: Settings = {
  address: 'רוטשילד 55, ראשון לציון',
  phone:   '052-5961616',
  email:   'hello@gabrielscoffee.co.il',
  hours: [
    { days: 'ראשון, שלישי – חמישי', hours: '09:30–14:30 | 16:30–20:00' },
    { days: 'שני',                   hours: 'סגור' },
    { days: 'שישי',                  hours: '09:30–14:00' },
  ],
}

export default function Footer() {
  const [s, setS] = useState<Settings>(DEFAULT)
  const pathname = usePathname()
  const { lang } = useLang()
  const t = useT(lang)

  const navLinks = [
    { href: '/',        label: t.nav.home    },
    { href: '/menu',    label: t.nav.menu    },
    { href: '/about',   label: t.nav.about   },
    { href: '/contact', label: t.nav.contact },
  ]

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

  useEffect(() => {
    fetch(`${API}/settings`)
      .then(r => r.json())
      .then(data => setS(data))
      .catch(() => {})
  }, [pathname])

  return (
    <footer className="bg-coffee-950 text-coffee-200 pt-12 pb-6">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">☕</span>
            <span className="text-xl font-bold text-cream">גבריאלס&apos; קפה</span>
          </div>
          <p className="text-sm leading-relaxed text-coffee-300">{t.footer.tagline}</p>
        </div>

        {/* Links */}
        <div>
          <h3 className="font-bold text-cream mb-3">{t.footer.quickNav}</h3>
          <ul className="space-y-2 text-sm">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="hover:text-coffee-300 transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-bold text-cream mb-3">{t.footer.contactTitle}</h3>
          <ul className="space-y-2 text-sm text-coffee-300">
            <li>📍 {s.address}</li>
            <li>📞 {s.phone}</li>
            <li>✉️ {s.email}</li>
            {s.hours.map(h => (
              <li key={h.days}>🕗 {translateDay(h.days, lang)} {translateHr(h.hours, lang)}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-coffee-800 pt-4 text-center text-xs text-coffee-400">
        {t.footer.copyright}
      </div>
    </footer>
  )
}
