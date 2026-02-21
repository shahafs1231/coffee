'use client'
import { useEffect, useState } from 'react'
import MenuCard from '@/components/MenuCard'

interface MenuItem {
  id: number
  name: string
  description: string
  price: number
  category: string
  popular: boolean
}

const CATEGORIES = ['הכל', 'קפה', 'ליד הקפה', 'מכונות קפה וציוד נלווה']
const DEFAULT_CONTENT = { title: 'המוצרים שלנו', subtitle: 'כל מה שצריך לרגע מושלם — קפה, מאפה ואוכל טוב' }

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('הכל')
  const [error, setError] = useState('')
  const [content, setContent] = useState(DEFAULT_CONTENT)

  useEffect(() => {
    fetch('http://localhost:8001/menu')
      .then(r => r.json())
      .then(data => { setItems(data); setLoading(false) })
      .catch(() => { setError('לא ניתן לטעון את התפריט כרגע. נסו שוב מאוחר יותר.'); setLoading(false) })
    fetch('http://localhost:8001/menu-content')
      .then(r => r.json())
      .then(data => setContent(data))
      .catch(() => {})
  }, [])

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
        <h1 className="text-5xl font-black text-cream mb-3">{content.title}</h1>
        <p className="text-coffee-200 text-lg">{content.subtitle}</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full font-medium text-sm transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-coffee-700 text-cream shadow-md scale-105'
                  : 'bg-coffee-100 text-coffee-700 hover:bg-coffee-200'
              }`}
            >
              {cat === 'קפה' ? '☕ קפה' : cat === 'ליד הקפה' ? '🥐 ליד הקפה' : cat === 'מכונות קפה וציוד נלווה' ? '⚙️ מכונות קפה וציוד נלווה' : '🍽️ הכל'}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <div className="text-6xl animate-spin inline-block mb-4">☕</div>
            <p className="text-coffee-600 text-lg">טוען את התפריט...</p>
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
              {filtered.length} פריטים
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
