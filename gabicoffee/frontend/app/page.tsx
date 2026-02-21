import Link from 'next/link'
import MenuCard from '@/components/MenuCard'

async function getPopularItems() {
  try {
    const res = await fetch('http://localhost:8001/menu/popular', { cache: 'no-store' })
    if (!res.ok) return []
    return res.json()
  } catch { return [] }
}

async function getSettings() {
  try {
    const res = await fetch('http://localhost:8001/settings', { cache: 'no-store' })
    if (!res.ok) return null
    return res.json()
  } catch { return null }
}

async function getHomeContent() {
  try {
    const res = await fetch('http://localhost:8001/home-content', { cache: 'no-store' })
    if (!res.ok) return null
    return res.json()
  } catch { return null }
}

const DEFAULT_HOURS = [
  { days: 'ראשון – חמישי', hours: '07:00 – 22:00' },
  { days: 'שישי',          hours: '07:00 – 17:00' },
  { days: 'שבת',           hours: '08:00 – 20:00' },
]

const DEFAULT_HOME = {
  hero_subtitle:    'כי כל כוס קפה טובה מספרת סיפור',
  hero_description: 'קפה איכותי, מאפים טריים מהתנור ואווירה חמימה שתגרום לכם לחזור שוב ושוב. ברוכים הבאים למשפחה.',
  hero_btn_primary:   'לצפייה במוצרים',
  hero_btn_secondary: 'מצאו אותנו',
  features: [
    { icon: '🌱', title: 'פולים מובחרים', desc: 'אנחנו מייבאים פולי קפה ספיישלטי ממיטב המטעים בעולם' },
    { icon: '👨‍🍳', title: 'מאפים טריים',  desc: 'כל הפסטריות נאפות אצלנו מדי בוקר עם חומרי גלם איכותיים' },
    { icon: '🤝', title: 'אווירה חמימה', desc: 'מקום שבו כולם מרגישים בבית — עם חיוך ומוזיקה טובה' },
  ],
  cta_title: 'בואו לבקר אותנו',
  cta_desc:  'רוטשילד 55, תל אביב. חנייה חינם בסביבה ועגלה ידידותית.',
}

export default async function HomePage() {
  const [popularItems, settings, homeContent] = await Promise.all([
    getPopularItems(), getSettings(), getHomeContent(),
  ])
  const hours = settings?.hours ?? DEFAULT_HOURS
  const h = { ...DEFAULT_HOME, ...homeContent }

  return (
    <>
      {/* ── Hero — full-screen video background ──────────────────────── */}
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
            {h.hero_subtitle}
          </p>
          <p className="text-base text-coffee-100 mb-10 max-w-xl mx-auto leading-relaxed drop-shadow">
            {h.hero_description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/menu" className="btn-primary text-lg px-8 py-4">
              {h.hero_btn_primary}
            </Link>
            <Link href="/contact"
              className="btn-outline border-white text-white hover:bg-white hover:text-coffee-950 text-lg px-8 py-4">
              {h.hero_btn_secondary}
            </Link>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 0C1200 50 800 60 720 40C640 20 240 50 0 0L0 60Z" fill="#fdf8f3" />
          </svg>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────── */}
      <section className="py-16 bg-cream">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {h.features.map((f: { icon: string; title: string; desc: string }, i: number) => (
              <div key={i} className="p-6">
                <div className="text-5xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-bold text-coffee-900 mb-2">{f.title}</h3>
                <p className="text-coffee-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Popular items ───────────────────────────────────────────── */}
      {popularItems.length > 0 && (
        <section className="py-16 bg-coffee-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="section-title">הנבחרים שלנו</h2>
              <p className="text-coffee-600 text-lg">המוצרים הכי אהובים על הלקוחות שלנו</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularItems.slice(0, 6).map((item: any) => (
                <MenuCard key={item.id} item={item} />
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/menu" className="btn-primary text-base">לכל המוצרים</Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Opening hours banner ────────────────────────────────────── */}
      <section className="py-14" style={{ background: 'linear-gradient(90deg, #5c3317 0%, #884d18 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-cream mb-6">שעות פעילות</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-coffee-200">
            {hours.map(({ days, hours: hr }: { days: string; hours: string }) => (
              <div key={days} className="bg-coffee-900 bg-opacity-40 rounded-2xl p-5">
                <div className="font-semibold text-cream text-lg mb-1">{days}</div>
                <div className="text-coffee-300 text-xl font-bold">{hr}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <section className="py-20 bg-cream text-center px-4">
        <h2 className="section-title">{h.cta_title}</h2>
        <p className="text-coffee-600 text-lg mb-8 max-w-lg mx-auto">{h.cta_desc}</p>
        <Link href="/contact" className="btn-primary text-lg px-10 py-4">צרו קשר</Link>
      </section>
    </>
  )
}
