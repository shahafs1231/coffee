'use client'
import { useState } from 'react'
import { useCart } from '@/context/CartContext'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

type Step = 'cart' | 'checkout' | 'success'

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, clearCart, totalItems, totalPrice } = useCart()
  const [step, setStep] = useState<Step>('cart')
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [orderId, setOrderId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const reset = () => { setStep('cart'); setName(''); setNotes(''); setOrderId(null); setError('') }

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch(`${API}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: name,
          items: items.map(i => ({ item_id: i.id, quantity: i.quantity })),
          notes: notes || null,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setOrderId(data.order_id)
        clearCart()
        setStep('success')
      } else {
        setError(data.detail || 'אירעה שגיאה. נסו שוב.')
      }
    } catch {
      setError('לא ניתן להתחבר לשרת.')
    }
    setLoading(false)
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={() => { closeCart(); reset() }}
        />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 left-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>

        {/* Header */}
        <div className="bg-coffee-900 text-cream px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛒</span>
            <span className="font-bold text-lg">
              {step === 'cart' ? 'הסל שלי' : step === 'checkout' ? 'פרטי הזמנה' : 'ההזמנה התקבלה!'}
            </span>
            {step === 'cart' && totalItems > 0 && (
              <span className="bg-coffee-600 text-cream text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
          <button onClick={() => { closeCart(); reset() }}
            className="text-coffee-300 hover:text-cream text-2xl leading-none transition-colors">
            ✕
          </button>
        </div>

        {/* ── CART STEP ── */}
        {step === 'cart' && (
          <>
            <div className="flex-grow overflow-y-auto px-4 py-4 space-y-3">
              {items.length === 0 ? (
                <div className="text-center py-20 text-coffee-400">
                  <div className="text-5xl mb-3">🛒</div>
                  <p className="font-medium">הסל ריק</p>
                  <p className="text-sm mt-1">הוסיפו פריטים מהתפריט</p>
                </div>
              ) : (
                items.map(item => (
                  <div key={item.id} className="flex items-center gap-3 bg-coffee-50 rounded-2xl p-3">
                    <div className="text-2xl w-10 text-center">
                      {item.category === 'קפה' ? '☕' : item.category === 'ליד הקפה' ? '🥐' : '⚙️'}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="font-semibold text-coffee-900 text-sm truncate">{item.name}</p>
                      <p className="text-coffee-500 text-xs">₪{item.price} ליחידה</p>
                    </div>
                    {/* Quantity controls */}
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateQty(item.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-full bg-coffee-200 hover:bg-coffee-300 text-coffee-800 font-bold text-sm flex items-center justify-center transition-colors">
                        −
                      </button>
                      <span className="w-6 text-center font-bold text-sm text-coffee-900">{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-full bg-coffee-700 hover:bg-coffee-800 text-cream font-bold text-sm flex items-center justify-center transition-colors">
                        +
                      </button>
                    </div>
                    <div className="text-coffee-700 font-bold text-sm w-14 text-left">
                      ₪{(item.price * item.quantity).toFixed(0)}
                    </div>
                    <button onClick={() => removeItem(item.id)}
                      className="text-red-400 hover:text-red-600 text-lg leading-none transition-colors">
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-coffee-100 px-4 py-4 space-y-3 bg-white">
                <div className="flex justify-between text-lg font-black text-coffee-900">
                  <span>סה&quot;כ לתשלום</span>
                  <span>₪{totalPrice.toFixed(0)}</span>
                </div>
                <button onClick={() => setStep('checkout')}
                  className="btn-primary w-full py-3 text-base">
                  להמשך לתשלום ←
                </button>
                <button onClick={clearCart}
                  className="w-full text-sm text-coffee-400 hover:text-red-500 transition-colors py-1">
                  ריקון הסל
                </button>
              </div>
            )}
          </>
        )}

        {/* ── CHECKOUT STEP ── */}
        {step === 'checkout' && (
          <>
            <div className="flex-grow overflow-y-auto px-4 py-4">
              {/* Order summary */}
              <div className="bg-coffee-50 rounded-2xl p-4 mb-5">
                <p className="text-xs font-bold text-coffee-500 uppercase tracking-wide mb-2">סיכום הזמנה</p>
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm text-coffee-700 py-0.5">
                    <span>{item.name} × {item.quantity}</span>
                    <span className="font-semibold">₪{(item.price * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
                <div className="border-t border-coffee-200 mt-2 pt-2 flex justify-between font-black text-coffee-900">
                  <span>סה&quot;כ</span>
                  <span>₪{totalPrice.toFixed(0)}</span>
                </div>
              </div>

              {/* Form */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">
                  ❌ {error}
                </div>
              )}
              <form id="checkout-form" onSubmit={handleOrder} className="space-y-4">
                <div>
                  <label className="label-admin">שם מלא *</label>
                  <input required value={name} onChange={e => setName(e.target.value)}
                    placeholder="הכניסו את שמכם"
                    className="input-admin" />
                </div>
                <div>
                  <label className="label-admin">הערות (אופציונלי)</label>
                  <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="אלרגיות, בקשות מיוחדות..."
                    className="input-admin resize-none" />
                </div>
              </form>
            </div>

            <div className="border-t border-coffee-100 px-4 py-4 space-y-2 bg-white">
              <button type="submit" form="checkout-form" disabled={loading}
                className="btn-primary w-full py-3 text-base disabled:opacity-60">
                {loading ? 'שולח הזמנה...' : '✓ שלח הזמנה'}
              </button>
              <button onClick={() => setStep('cart')}
                className="w-full text-sm text-coffee-500 hover:text-coffee-800 transition-colors py-1">
                ← חזרה לסל
              </button>
            </div>
          </>
        )}

        {/* ── SUCCESS STEP ── */}
        {step === 'success' && (
          <div className="flex-grow flex flex-col items-center justify-center px-6 text-center gap-4">
            <div className="text-7xl">🎉</div>
            <h2 className="text-2xl font-black text-coffee-900">ההזמנה התקבלה!</h2>
            <p className="text-coffee-600">
              תודה, <span className="font-bold">{name}</span>!<br />
              מספר הזמנה: <span className="font-bold text-coffee-800">#{orderId}</span>
            </p>
            <p className="text-coffee-400 text-sm">נכין את הזמנתך בהקדם ☕</p>
            <button onClick={() => { closeCart(); reset() }}
              className="btn-primary px-8 py-3 mt-2">
              סגור
            </button>
          </div>
        )}
      </div>
    </>
  )
}
