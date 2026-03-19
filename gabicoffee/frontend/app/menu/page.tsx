'use client'
import { useEffect, useState } from 'react'
import MenuCard from '@/components/MenuCard'
import { useLang } from '@/context/LanguageContext'
import { useT } from '@/lib/translations'

interface MenuItem {
  id: number
  name: string
  description: string
  price: number
  category: string
  popular: boolean
}

const CATEGORIES_HE = ['הכל', 'פולי קפה', 'מכונות קפה', 'אביזרים', 'מתנות']
const CATEGORIES_EN = ['All', 'Coffee Beans', 'Coffee Machines', 'Accessories', 'Gifts']
const CATEGORY_MAP: Record<string, string> = {
  'הכל': 'All',
  'פולי קפה': 'Coffee Beans',
  'מכונות קפה': 'Coffee Machines',
  'אביזרים': 'Accessories',
  'מתנות': 'Gifts',
}
const CATEGORY_MAP_REVERSE: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_MAP).map(([k, v]) => [v, k])
)

const CATEGORY_ICONS: Record<string, string> = {
  'הכל': '🛍️', 'All': '🛍️',
  'פולי קפה': '☕', 'Coffee Beans': '☕',
  'מכונות קפה': '⚙️', 'Coffee Machines': '⚙️',
  'אביזרים': '🔧', 'Accessories': '🔧',
  'מתנות': '🎁', 'Gifts': '🎁',
}

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('הכל')
  const [error, setError] = useState('')
  const { lang } = useLang()
  const t = useT(lang)

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

  useEffect(() => {
    fetch(`${API}/menu`)
      .then(r => r.json())
      .then(data => { setItems(data); setLoading(false) })
      .catch(() => { setError(t.menu.error); setLoading(false) })
  }, [])

  // activeCategory is always stored in Hebrew internally
  const categories = lang === 'en' ? CATEGORIES_EN : CATEGORIES_HE
  const handleCategory = (cat: string) => {
    // normalize to Hebrew for filtering
    const heKey = lang === 'en' ? (CATEGORY_MAP_REVERSE[cat] ?? cat) : cat
    setActiveCategory(heKey)
  }

  const filtered = activeCategory === 'הכל'
    ? items
    : items.filter(i => i.category === activeCategory)

  return (
    <div className="min-h-screen bg-cream">
      {/* Page header */}
      <div
        className="py-20 text-center"
        style={{ background: 'linear-gradient(135deg, #321908 0%, #884d18 100%)' }}
      >
        <h1 className="text-5xl font-black text-cream mb-3">{t.menu.title}</h1>
        <p className="text-coffee-200 text-lg">{t.menu.subtitle}</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map(cat => {
            const isActive = lang === 'en'
              ? (CATEGORY_MAP_REVERSE[cat] ?? cat) === activeCategory
              : cat === activeCategory
            return (
              <button
                key={cat}
                onClick={() => handleCategory(cat)}
                className={`px-6 py-2 rounded-full font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-coffee-700 text-cream shadow-md scale-105'
                    : 'bg-coffee-100 text-coffee-700 hover:bg-coffee-200'
                }`}
              >
                {CATEGORY_ICONS[cat]} {cat}
              </button>
            )
          })}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <div className="text-6xl animate-spin inline-block mb-4">☕</div>
            <p className="text-coffee-600 text-lg">{t.menu.loading}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-20">
            <p className="text-red-600 text-lg">{error}</p>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && (
          <>
            <p className="text-coffee-500 text-sm mb-6 text-center">
              {filtered.length} {t.menu.items}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(item => (
                <MenuCard key={item.id} item={item} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
