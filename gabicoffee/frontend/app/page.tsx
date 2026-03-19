'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import MenuCard from '@/components/MenuCard'
import { useLang } from '@/context/LanguageContext'
import { useT } from '@/lib/translations'

const DEFAULT_HOURS = [
  { days: 'ראשון, שלישי – חמישי', hours: '09:30–14:30 | 16:30–20:00' },
  { days: 'שני',                   hours: 'סגור' },
  { days: 'שישי',                  hours: '09:30–14:00' },
]

const DAYS_EN: Record<string, string> = {
  'ראשון, שלישי – חמישי': 'Sun, Tue – Thu',
  'שני': 'Monday',
  'שישי': 'Friday',
  'ראשון – חמישי': 'Sun – Thu',
}
function translateDay(d: string, lang: string) { return lang === 'en' ? (DAYS_EN[d] ?? d) : d }
function translateHr(h: string, lang: string) { return lang === 'en' && h === 'סגור' ? 'Closed' : h }

export default function HomePage() {
  const { lang } = useLang()
  const t = useT(lang)

  const [popularItems, setPopularItems] = useState<any[]>([])
  const [hours, setHours] = useState(DEFAULT_HOURS)

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

  useEffect(() => {
    fetch(`${API}/menu/popular`, { cache: 'no-store' })
      .then(r => r.json()).then(setPopularItems).catch(() => {})
    fetch(`${API}/settings`, { cache: 'no-store' })
      .then(r => r.json()).then(d => { if (d?.hours) setHours(d.hours) }).catch(() => {})
  }, [])

  const h = t.home

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative min-h-[100vh] flex items-center justify-center text-center px-4 overflow-hidden">
        <video src="/reel.mp4" autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/55" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="text-7xl mb-6 drop-shadow-lg">☕</div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 leading-tight tracking-tight drop-shadow-lg">
            גבריאלס&apos; קפה
          </h1>
          <p className="text-xl md:text-2xl text-coffee-200 mb-2 font-light drop-shadow">
            {h.subtitle}
          </p>
          <p className="text-base text-coffee-100 mb-10 max-w-xl mx-auto leading-relaxed drop-shadow">
            {h.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/menu" className="btn-primary text-lg px-8 py-4">
              {h.btnPrimary}
            </Link>
            <Link href="/contact"
              className="btn-outline border-white text-white hover:bg-white hover:text-coffee-950 text-lg px-8 py-4">
              {h.btnSecondary}
            </Link>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 0C1200 50 800 60 720 40C640 20 240 50 0 0L0 60Z" fill="#fdf8f3" />
          </svg>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-16 bg-cream">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {h.features.map((f, i) => (
              <div key={i} className="p-6">
                <div className="text-5xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-bold text-coffee-900 mb-2">{f.title}</h3>
                <p className="text-coffee-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Popular items ── */}
      {popularItems.length > 0 && (
        <section className="py-16 bg-coffee-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="section-title">{h.popularTitle}</h2>
              <p className="text-coffee-600 text-lg">{h.popularSubtitle}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularItems.slice(0, 6).map((item: any) => (
                <MenuCard key={item.id} item={item} />
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/menu" className="btn-primary text-base">{h.allProducts}</Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Opening hours ── */}
      <section className="py-14" style={{ background: 'linear-gradient(90deg, #5c3317 0%, #884d18 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-cream mb-6">{h.hoursTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-coffee-200">
            {hours.map(({ days, hours: hr }) => (
              <div key={days} className="bg-coffee-900 bg-opacity-40 rounded-2xl p-5">
                <div className="font-semibold text-cream text-lg mb-1">{translateDay(days, lang)}</div>
                <div className="text-coffee-300 text-xl font-bold">{translateHr(hr, lang)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-cream text-center px-4">
        <h2 className="section-title">{h.ctaTitle}</h2>
        <p className="text-coffee-600 text-lg mb-8 max-w-lg mx-auto">{h.ctaDesc}</p>
        <Link href="/contact" className="btn-primary text-lg px-10 py-4">{h.ctaBtn}</Link>
      </section>
    </>
  )
}
