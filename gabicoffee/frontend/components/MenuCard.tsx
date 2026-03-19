'use client'
import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { useLang } from '@/context/LanguageContext'
import { useT } from '@/lib/translations'

interface MenuItem {
  id: number
  name: string
  description: string
  price: number
  category: string
  popular: boolean
  image?: string | null
}

const CATEGORY_ICONS: Record<string, string> = {
  'פולי קפה': '☕',
  'מכונות קפה': '⚙️',
  'מתנות': '🎁',
  'אביזרים': '🔧',
}

const CATEGORY_EN: Record<string, string> = {
  'פולי קפה': 'Coffee Beans',
  'מכונות קפה': 'Coffee Machines',
  'מתנות': 'Gifts',
  'אביזרים': 'Accessories',
}

export default function MenuCard({ item }: { item: MenuItem }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  const { lang } = useLang()
  const t = useT(lang)

  const handleAdd = () => {
    addItem({ id: item.id, name: item.name, price: item.price, category: item.category })
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <div className="card group relative flex flex-col">
      {/* Popular badge */}
      {item.popular && (
        <span className="absolute top-3 right-3 z-10 bg-coffee-600 text-cream text-xs font-bold px-2 py-1 rounded-full shadow">
          {t.card.popular}
        </span>
      )}

      {/* Image */}
      {item.image ? (
        <img src={item.image} alt={item.name}
          className="h-40 w-full object-cover" />
      ) : (
        <div className="h-40 bg-gradient-to-br from-coffee-200 to-coffee-400 flex items-center justify-center text-6xl select-none">
          {CATEGORY_ICONS[item.category] ?? '🔧'}
        </div>
      )}

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-lg font-bold text-coffee-900">{item.name}</h3>
          <span className="text-coffee-600 font-bold text-base whitespace-nowrap mr-2">
            ₪{item.price.toFixed(0)}
          </span>
        </div>
        <p className="text-sm text-coffee-700 leading-relaxed flex-grow">{item.description}</p>
        <span className="mt-3 inline-block text-xs bg-coffee-100 text-coffee-700 rounded-full px-3 py-1 self-start font-medium">
          {lang === 'en' ? (CATEGORY_EN[item.category] ?? item.category) : item.category}
        </span>

        {/* Add to cart button */}
        <button
          onClick={handleAdd}
          className={`mt-3 w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95
            ${added
              ? 'bg-green-500 text-white'
              : 'bg-coffee-700 hover:bg-coffee-800 text-cream'
            }`}
        >
          {added ? t.card.added : t.card.addToCart}
        </button>
      </div>
    </div>
  )
}
