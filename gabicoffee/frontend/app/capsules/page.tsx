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

export default function CapsulesPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { lang } = useLang()
  const t = useT(lang)

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

  useEffect(() => {
    fetch(`${API}/menu`)
      .then(r => r.json())
      .then((data: MenuItem[]) => {
        setItems(data.filter(i => i.category === 'קפסולות'))
        setLoading(false)
      })
      .catch(() => { setError(t.menu.error); setLoading(false) })
  }, [])

  return (
    <div className="min-h-screen bg-cream">
      {/* Page header */}
      <div
        className="py-20 text-center"
        style={{ background: 'linear-gradient(135deg, #1a0a00 0%, #5c2d0a 50%, #321908 100%)' }}
      >
        <div className="text-6xl mb-4">🫙</div>
        <h1 className="text-5xl font-black text-cream mb-3">
          {lang === 'he' ? 'קפסולות קפה' : 'Coffee Capsules'}
        </h1>
        <p className="text-coffee-200 text-lg">
          {lang === 'he'
            ? 'קפסולות איכותיות לכל מכונה — טעם מושלם בכל כוס'
            : 'Premium capsules for every machine — perfect taste every cup'}
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <div className="text-6xl animate-spin inline-block mb-4">🫙</div>
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
              {items.length} {t.menu.items}
            </p>

            {items.length === 0 ? (
              <div className="text-center py-20 text-coffee-400">
                <div className="text-5xl mb-4">🫙</div>
                <p className="text-lg font-medium">
                  {lang === 'he' ? 'אין קפסולות זמינות כרגע' : 'No capsules available at the moment'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(item => (
                  <MenuCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
