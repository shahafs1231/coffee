'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '@/context/CartContext'

const links = [
  { href: '/',        label: 'דף הבית' },
  { href: '/menu',    label: 'מוצרים'  },
  { href: '/about',   label: 'אודות'   },
  { href: '/contact', label: 'צור קשר' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { openCart, totalItems } = useCart()

  return (
    <header className="sticky top-0 z-50 bg-coffee-900 shadow-lg">
      <nav className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-3xl">☕</span>
          <span className="text-cream text-xl font-bold tracking-wide">
            גבריאלס&apos; קפה
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex gap-8">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`text-base font-medium transition-colors duration-200 ${
                  pathname === href
                    ? 'text-coffee-300 border-b-2 border-coffee-300 pb-0.5'
                    : 'text-coffee-100 hover:text-coffee-300'
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/admin"
            className="text-coffee-300 hover:text-cream text-sm border border-coffee-700 hover:border-coffee-400 rounded-full px-4 py-2 transition-colors"
          >
            🔐 כניסה לאדמין
          </Link>
          {/* Cart button */}
          <button onClick={openCart} className="relative btn-primary text-sm py-2 px-5">
            🛒 סל קניות
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black rounded-full w-5 h-5 flex items-center justify-center shadow">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Hamburger */}
        <button
          className="md:hidden text-cream text-2xl focus:outline-none"
          onClick={() => setOpen(!open)}
          aria-label="תפריט ניווט"
        >
          {open ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-coffee-800 px-4 pb-4 flex flex-col gap-3">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`text-base py-2 border-b border-coffee-700 ${
                pathname === href ? 'text-coffee-300 font-semibold' : 'text-coffee-100'
              }`}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/menu"
            onClick={() => setOpen(false)}
            className="btn-primary text-center mt-2 text-sm"
          >
            הזמן עכשיו
          </Link>
          <button
            onClick={() => { setOpen(false); openCart() }}
            className="relative btn-primary text-center text-sm py-2"
          >
            🛒 סל קניות
            {totalItems > 0 && (
              <span className="mr-1 bg-red-500 text-white text-xs font-black rounded-full px-1.5 py-0.5">
                {totalItems}
              </span>
            )}
          </button>
          <Link
            href="/admin"
            onClick={() => setOpen(false)}
            className="text-center text-coffee-300 border border-coffee-700 rounded-full py-2 text-sm"
          >
            🔐 כניסה לאדמין
          </Link>
        </div>
      )}
    </header>
  )
}
