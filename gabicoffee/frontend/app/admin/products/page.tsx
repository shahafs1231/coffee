'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
const CATEGORIES = ['הכל', 'פולי קפה', 'קפסולות', 'מכונות קפה', 'אביזרים', 'מתנות', 'מוצרי ניקוי ותחזוקה']
const CATEGORY_EMOJI: Record<string, string> = { 'פולי קפה': '☕', 'קפסולות': '🫙', 'מכונות קפה': '⚙️', 'אביזרים': '🔧', 'מתנות': '🎁', 'הכל': '🛍️', 'מוצרי ניקוי ותחזוקה': '🧹' }

interface MenuItem {
  id: number
  name: string
  description: string
  price: number
  category: string
  popular: boolean
}

const blank = (): Omit<MenuItem, 'id'> => ({
  name: '', description: '', price: 0, category: 'פולי קפה', popular: false,
})

// ─── Login gate ───────────────────────────────────────────────────────────────
function LoginGate({ onLogin }: { onLogin: (t: string) => void }) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr('')
    try {
      const r = await fetch(`${API}/admin/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      })
      const d = await r.json()
      r.ok ? onLogin(d.token) : setErr(d.detail || 'סיסמה שגויה')
    } catch { setErr('לא ניתן להתחבר לשרת') }
    setBusy(false)
  }

  return (
    <div className="min-h-screen bg-coffee-950 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-sm text-center">
        <div className="text-5xl mb-4">🔐</div>
        <h1 className="text-2xl font-black text-coffee-900 mb-1">ניהול מוצרים</h1>
        <p className="text-coffee-500 text-sm mb-6">גבריאלס&apos; קפה</p>
        {err && <p className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">{err}</p>}
        <form onSubmit={submit} className="space-y-4">
          <input type="password" required placeholder="סיסמת מנהל" value={pw}
            onChange={e => setPw(e.target.value)}
            className="w-full border border-coffee-200 rounded-xl px-4 py-3 text-coffee-900 focus:outline-none focus:ring-2 focus:ring-coffee-400" />
          <button type="submit" disabled={busy} className="btn-primary w-full py-3 disabled:opacity-60">
            {busy ? 'מתחבר...' : 'כניסה'}
          </button>
        </form>
        <Link href="/admin" className="block mt-4 text-xs text-coffee-400 hover:text-coffee-600 transition-colors">
          חזרה לפאנל הניהול הראשי
        </Link>
      </div>
    </div>
  )
}

// ─── Product form (shared for add & edit) ─────────────────────────────────────
function ProductForm({
  initial, onSave, onCancel, title,
}: {
  initial: Omit<MenuItem, 'id'>
  onSave: (data: Omit<MenuItem, 'id'>) => Promise<void>
  onCancel: () => void
  title: string
}) {
  const [form, setForm] = useState(initial)
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true)
    await onSave(form); setBusy(false)
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <h3 className="text-lg font-bold text-coffee-900 mb-2">{title}</h3>

      <div>
        <label className="label-admin">שם המוצר *</label>
        <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
          className="input-admin" placeholder="לדוגמה: לאטה וניל" />
      </div>

      <div>
        <label className="label-admin">תיאור</label>
        <textarea rows={3} value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          className="input-admin resize-none" placeholder="תיאור קצר של המוצר..." />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label-admin">מחיר (₪) *</label>
          <input type="number" required min={0} step={0.5} value={form.price}
            onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
            className="input-admin" />
        </div>
        <div>
          <label className="label-admin">קטגוריה *</label>
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
            className="input-admin">
            {CATEGORIES.filter(c => c !== 'הכל').map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer select-none">
        <input type="checkbox" checked={form.popular}
          onChange={e => setForm({ ...form, popular: e.target.checked })}
          className="w-4 h-4 accent-coffee-700" />
        <span className="text-sm text-coffee-700 font-medium">⭐ סמן כמוצר פופולרי</span>
      </label>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={busy} className="btn-primary flex-1 py-2.5 disabled:opacity-60">
          {busy ? 'שומר...' : 'שמור'}
        </button>
        <button type="button" onClick={onCancel} className="btn-outline flex-1 py-2.5">
          ביטול
        </button>
      </div>
    </form>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const [token, setToken] = useState<string | null>(null)
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState('הכל')
  const [toast, setToast] = useState('')

  // modal state: null = closed, 'add' = new item, number = edit item id
  const [modal, setModal] = useState<null | 'add' | number>(null)

  const headers = { 'Content-Type': 'application/json', 'x-admin-token': token || '' }

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const fetchItems = async () => {
    setLoading(true)
    try {
      const r = await fetch(`${API}/menu`)
      if (!r.ok) throw new Error('network response was not ok')
      setItems(await r.json())
    } catch {
      setItems([])
    }
    setLoading(false)
  }

  useEffect(() => { if (token) fetchItems() }, [token])

  if (!token) return <LoginGate onLogin={setToken} />

  // filtered list
  const filtered = activeCategory === 'הכל' ? items : items.filter(i => i.category === activeCategory)

  // counts per category
  const counts: Record<string, number> = { הכל: items.length }
  items.forEach(i => { counts[i.category] = (counts[i.category] || 0) + 1 })

  const editingItem = typeof modal === 'number' ? items.find(i => i.id === modal) : null

  const handleAdd = async (data: Omit<MenuItem, 'id'>) => {
    const r = await fetch(`${API}/admin/menu`, { method: 'POST', headers, body: JSON.stringify(data) })
    if (r.ok) { setModal(null); fetchItems(); showToast('✅ המוצר נוסף בהצלחה') }
  }

  const handleEdit = async (data: Omit<MenuItem, 'id'>) => {
    const r = await fetch(`${API}/admin/menu/${modal}`, { method: 'PUT', headers, body: JSON.stringify(data) })
    if (r.ok) { setModal(null); fetchItems(); showToast('✅ המוצר עודכן בהצלחה') }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`למחוק את "${name}"?`)) return
    await fetch(`${API}/admin/menu/${id}`, { method: 'DELETE', headers })
    fetchItems(); showToast('🗑️ המוצר נמחק')
  }

  return (
    <div className="min-h-screen bg-coffee-50">
      {/* Top bar */}
      <div className="bg-coffee-900 text-cream px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-coffee-300 hover:text-cream transition-colors text-sm">
            ← פאנל ניהול
          </Link>
          <span className="text-coffee-600">|</span>
          <span className="font-bold">ניהול מוצרים</span>
        </div>
        <button onClick={() => setToken(null)}
          className="text-coffee-300 hover:text-cream text-sm border border-coffee-700 rounded-full px-4 py-1 transition-colors">
          יציאה
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-coffee-900 text-cream px-6 py-3 rounded-full shadow-xl text-sm font-medium">
          {toast}
        </div>
      )}

      {/* Modal overlay */}
      {modal !== null && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) setModal(null) }}>
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
            {modal === 'add' ? (
              <ProductForm
                title="הוספת מוצר חדש"
                initial={blank()}
                onSave={handleAdd}
                onCancel={() => setModal(null)}
              />
            ) : editingItem ? (
              <ProductForm
                title={`עריכת: ${editingItem.name}`}
                initial={{ name: editingItem.name, description: editingItem.description, price: editingItem.price, category: editingItem.category, popular: editingItem.popular }}
                onSave={handleEdit}
                onCancel={() => setModal(null)}
              />
            ) : null}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header row */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black text-coffee-900">מוצרים בתפריט</h1>
            <p className="text-coffee-500 text-sm mt-1">{items.length} מוצרים סה&quot;כ</p>
          </div>
          <button onClick={() => setModal('add')} className="btn-primary px-6 py-3">
            + הוסף מוצר חדש
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-coffee-700 text-cream shadow-md scale-105'
                  : 'bg-white text-coffee-700 border border-coffee-200 hover:border-coffee-400'
              }`}>
              <span>{CATEGORY_EMOJI[cat]}</span>
              <span>{cat}</span>
              <span className={`text-xs rounded-full px-1.5 py-0.5 font-bold ${
                activeCategory === cat ? 'bg-coffee-600 text-cream' : 'bg-coffee-100 text-coffee-600'
              }`}>
                {counts[cat] || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20 text-coffee-500">
            <div className="text-5xl animate-spin inline-block mb-3">☕</div>
            <p>טוען מוצרים...</p>
          </div>
        )}

        {/* Products grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(item => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-coffee-100 overflow-hidden hover:shadow-md transition-shadow group">
                {/* Card header */}
                <div className="h-24 flex items-center justify-center text-5xl select-none"
                  style={{ background: 'linear-gradient(135deg, #faefd8, #e8bc70)' }}>
                  {CATEGORY_EMOJI[item.category]}
                </div>

                <div className="p-4">
                  {/* Name + popular */}
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-coffee-900 text-base leading-tight">{item.name}</h3>
                    {item.popular && (
                      <span className="bg-coffee-100 text-coffee-700 text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">⭐ פופולרי</span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-coffee-500 text-xs leading-relaxed mb-3 line-clamp-2">{item.description}</p>

                  {/* Price + category */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-coffee-700 font-black text-lg">₪{item.price}</span>
                    <span className="bg-coffee-50 text-coffee-600 text-xs px-2 py-1 rounded-full border border-coffee-100">
                      {item.category}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button onClick={() => setModal(item.id)}
                      className="flex-1 bg-coffee-100 hover:bg-coffee-200 text-coffee-800 text-sm font-semibold py-2 rounded-xl transition-colors">
                      ✏️ עריכה
                    </button>
                    <button onClick={() => handleDelete(item.id, item.name)}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold py-2 rounded-xl transition-colors">
                      🗑️ מחיקה
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Empty state */}
            {filtered.length === 0 && (
              <div className="col-span-3 text-center py-16 text-coffee-400">
                <div className="text-5xl mb-3">📭</div>
                <p className="font-medium">אין מוצרים בקטגוריה זו</p>
                <button onClick={() => setModal('add')} className="btn-primary mt-4 text-sm px-5 py-2">
                  הוסף מוצר ראשון
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
