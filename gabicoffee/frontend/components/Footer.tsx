'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Settings {
  address: string
  phone: string
  email: string
  hours: { days: string; hours: string }[]
}

const DEFAULT: Settings = {
  address: 'רוטשילד 55, תל אביב',
  phone:   '052-5961616',
  email:   'hello@gabrielscoffee.co.il',
  hours: [
    { days: 'ראשון – חמישי', hours: '07:00 – 22:00' },
    { days: 'שישי',          hours: '07:00 – 17:00' },
    { days: 'שבת',           hours: '08:00 – 20:00' },
  ],
}

export default function Footer() {
  const [s, setS] = useState<Settings>(DEFAULT)
  const pathname = usePathname()

  useEffect(() => {
    fetch('http://localhost:8001/settings')
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
          <p className="text-sm leading-relaxed text-coffee-300">
            מקום שבו כל כוס קפה היא חוויה.
            קפה איכותי, מאפים טריים ואווירה חמימה מחכים לכם.
          </p>
        </div>

        {/* Links */}
        <div>
          <h3 className="font-bold text-cream mb-3">ניווט מהיר</h3>
          <ul className="space-y-2 text-sm">
            {[
              { href: '/',        label: 'דף הבית' },
              { href: '/menu',    label: 'מוצרים'  },
              { href: '/about',   label: 'אודות'   },
              { href: '/contact', label: 'צור קשר' },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="hover:text-coffee-300 transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact — fetched live from API */}
        <div>
          <h3 className="font-bold text-cream mb-3">צרו קשר</h3>
          <ul className="space-y-2 text-sm text-coffee-300">
            <li>📍 {s.address}</li>
            <li>📞 {s.phone}</li>
            <li>✉️ {s.email}</li>
            {s.hours.map(h => (
              <li key={h.days}>🕗 {h.days} {h.hours}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-coffee-800 pt-4 text-center text-xs text-coffee-400">
        © {new Date().getFullYear()} גבריאלס&apos; קפה. כל הזכויות שמורות.
      </div>
    </footer>
  )
}
