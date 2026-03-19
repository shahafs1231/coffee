'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
const CATEGORIES = ['פולי קפה', 'מכונות קפה', 'אביזרים', 'מתנות']

interface MenuItem {
  id: number
  name: string
  description: string
  price: number
  category: string
  popular: boolean
  image?: string | null
}

interface Settings {
  address: string
  phone: string
  email: string
  hours: { days: string; hours: string }[]
}

interface AboutContent {
  story_title: string
  story_paragraphs: string[]
  values: { icon: string; title: string; desc: string }[]
  team: { name: string; role: string; emoji: string }[]
}

interface HomeContent {
  hero_subtitle: string
  hero_description: string
  hero_btn_primary: string
  hero_btn_secondary: string
  features: { icon: string; title: string; desc: string }[]
  cta_title: string
  cta_desc: string
}

interface MenuPageContent {
  title: string
  subtitle: string
}

interface ContactPageContent {
  title: string
  subtitle: string
  info_title: string
  form_title: string
}

interface ContactMessage {
  id: number
  name: string
  email: string
  message: string
  timestamp: string
}

interface Order {
  id: number
  customer_name: string
  items: { name: string; quantity: number; subtotal: number }[]
  total: number
  notes: string | null
  status: string
  timestamp: string
}

const emptyItem = (): Omit<MenuItem, 'id'> => ({
  name: '', description: '', price: 0, category: 'פולי קפה', popular: false, image: null,
})

// ─── Login screen ────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (token: string) => void }) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setErr('')
    try {
      const res = await fetch(`${API}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      })
      const data = await res.json()
      if (res.ok) { onLogin(data.token) }
      else { setErr(data.detail || 'סיסמה שגויה') }
    } catch { setErr('לא ניתן להתחבר לשרת') }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-coffee-950 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-sm text-center">
        <div className="text-5xl mb-4">🔐</div>
        <h1 className="text-2xl font-black text-coffee-900 mb-1">פאנל ניהול</h1>
        <p className="text-coffee-500 text-sm mb-6">גבריאלס&apos; קפה</p>
        {err && <p className="bg-red-50 border border-red-300 text-red-700 rounded-xl p-3 mb-4 text-sm">{err}</p>}
        <form onSubmit={submit} className="space-y-4">
          <input
            type="password"
            placeholder="סיסמת מנהל"
            value={pw}
            onChange={e => setPw(e.target.value)}
            className="w-full border border-coffee-200 rounded-xl px-4 py-3 text-coffee-900 focus:outline-none focus:ring-2 focus:ring-coffee-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 disabled:opacity-60"
          >
            {loading ? 'מתחבר...' : 'כניסה'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Main admin dashboard ────────────────────────────────────────────────────
export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null)
  const [tab, setTab] = useState<'menu' | 'settings' | 'about' | 'home' | 'menu-page' | 'contact-page' | 'messages' | 'orders'>('menu')

  // Menu state
  const [items, setItems] = useState<MenuItem[]>([])
  const [loadingMenu, setLoadingMenu] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItem, setNewItem] = useState(emptyItem())
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [menuMsg, setMenuMsg] = useState('')
  const [aiResult, setAiResult] = useState<MenuItem | null>(null)

  // Quick-add state
  const [quickName, setQuickName] = useState('')
  const [quickCategory, setQuickCategory] = useState('פולי קפה')
  const [quickPrice, setQuickPrice] = useState('')
  const [quickLoading, setQuickLoading] = useState(false)
  const [quickResult, setQuickResult] = useState<MenuItem | null>(null)

  // Settings state
  const [settings, setSettings] = useState<Settings | null>(null)
  const [settingsForm, setSettingsForm] = useState<Settings | null>(null)
  const [settingsMsg, setSettingsMsg] = useState('')

  // About state
  const [aboutForm, setAboutForm] = useState<AboutContent | null>(null)
  const [aboutMsg, setAboutMsg] = useState('')

  // Home state
  const [homeForm, setHomeForm] = useState<HomeContent | null>(null)
  const [homeMsg, setHomeMsg] = useState('')

  // Menu page content state
  const [menuPageForm, setMenuPageForm] = useState<MenuPageContent | null>(null)
  const [menuPageMsg, setMenuPageMsg] = useState('')

  // Contact page content state
  const [contactPageForm, setContactPageForm] = useState<ContactPageContent | null>(null)
  const [contactPageMsg, setContactPageMsg] = useState('')

  // Messages & orders
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [orders, setOrders] = useState<Order[]>([])

  const headers = { 'Content-Type': 'application/json', 'x-admin-token': token || '' }

  // Fetch menu
  const fetchMenu = async () => {
    setLoadingMenu(true)
    const res = await fetch(`${API}/menu`)
    setItems(await res.json())
    setLoadingMenu(false)
  }

  // Fetch settings
  const fetchSettings = async () => {
    const res = await fetch(`${API}/settings`)
    const data = await res.json()
    setSettings(data)
    setSettingsForm(JSON.parse(JSON.stringify(data)))
  }

  // Fetch about
  const fetchAbout = async () => {
    const res = await fetch(`${API}/about-content`)
    const data = await res.json()
    setAboutForm(JSON.parse(JSON.stringify(data)))
  }

  // Fetch home
  const fetchHome = async () => {
    const res = await fetch(`${API}/home-content`)
    const data = await res.json()
    setHomeForm(JSON.parse(JSON.stringify(data)))
  }

  // Fetch menu page content
  const fetchMenuPage = async () => {
    const res = await fetch(`${API}/menu-content`)
    const data = await res.json()
    setMenuPageForm(JSON.parse(JSON.stringify(data)))
  }

  // Fetch contact page content
  const fetchContactPage = async () => {
    const res = await fetch(`${API}/contact-content`)
    const data = await res.json()
    setContactPageForm(JSON.parse(JSON.stringify(data)))
  }

  // Fetch messages
  const fetchMessages = async (t: string) => {
    const res = await fetch(`${API}/admin/messages`, { headers: { 'x-admin-token': t } })
    if (res.ok) setMessages(await res.json())
  }

  // Fetch orders
  const fetchOrders = async (t: string) => {
    const res = await fetch(`${API}/admin/orders`, { headers: { 'x-admin-token': t } })
    if (res.ok) setOrders(await res.json())
  }

  useEffect(() => {
    if (token) {
      fetchMenu(); fetchSettings(); fetchAbout(); fetchHome()
      fetchMenuPage(); fetchContactPage()
      fetchMessages(token); fetchOrders(token)
    }
  }, [token])

  if (!token) return <LoginScreen onLogin={setToken} />

  // ── Image upload ───────────────────────────────────────────────────────────

  const uploadImage = async (file: File): Promise<string> => {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${API}/admin/upload-image`, {
      method: 'POST',
      headers: { 'x-admin-token': token || '' },
      body: form,
    })
    if (!res.ok) throw new Error('upload failed')
    const data = await res.json()
    return data.url
  }

  // ── Menu handlers ──────────────────────────────────────────────────────────

  const flash = (setter: (m: string) => void, msg: string) => {
    setter(msg); setTimeout(() => setter(''), 3000)
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch(`${API}/admin/menu`, {
      method: 'POST', headers, body: JSON.stringify(newItem),
    })
    if (res.ok) {
      setShowAddForm(false); setNewItem(emptyItem())
      fetchMenu(); flash(setMenuMsg, '✅ המוצר נוסף בהצלחה')
    }
  }

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return
    const res = await fetch(`${API}/admin/menu/${editingItem.id}`, {
      method: 'PUT', headers, body: JSON.stringify(editingItem),
    })
    if (res.ok) {
      setEditingItem(null); fetchMenu(); flash(setMenuMsg, '✅ המוצר עודכן בהצלחה')
    }
  }

  const handleDeleteItem = async (id: number, name: string) => {
    if (!confirm(`למחוק את "${name}"?`)) return
    await fetch(`${API}/admin/menu/${id}`, { method: 'DELETE', headers })
    fetchMenu(); flash(setMenuMsg, '🗑️ המוצר נמחק')
  }

  // ── Settings handler ───────────────────────────────────────────────────────

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch(`${API}/admin/settings`, {
      method: 'PUT', headers, body: JSON.stringify(settingsForm),
    })
    if (res.ok) { fetchSettings(); flash(setSettingsMsg, '✅ ההגדרות נשמרו בהצלחה') }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-coffee-50">
      {/* Top bar */}
      <div className="bg-coffee-900 text-cream px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">☕</span>
          <span className="font-bold text-lg">פאנל ניהול — גבריאלס&apos; קפה</span>
        </div>
        <button
          onClick={() => setToken(null)}
          className="text-coffee-300 hover:text-cream text-sm border border-coffee-700 rounded-full px-4 py-1 transition-colors"
        >
          יציאה
        </button>
      </div>

      {/* Quick links */}
      <div className="bg-coffee-800 px-6 py-2 flex gap-4">
        <Link href="/admin/products"
          className="text-coffee-300 hover:text-cream text-sm flex items-center gap-1.5 transition-colors">
          🛒 <span>דף ניהול מוצרים</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-coffee-100 px-6 flex gap-4 overflow-x-auto">
        {([
          ['menu',         'מוצרים'],
          ['settings',     'הגדרות'],
          ['home',         'דף הבית'],
          ['about',        'אודות'],
          ['menu-page',    'דף מוצרים'],
          ['contact-page', 'צרו קשר'],
          ['messages',     'הודעות'],
          ['orders',       'הזמנות'],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`py-4 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap ${
              tab === key ? 'border-coffee-700 text-coffee-900' : 'border-transparent text-coffee-400 hover:text-coffee-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* ── MENU TAB ── */}
        {tab === 'menu' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-coffee-900">מוצרים בתפריט</h2>
              <button onClick={() => { setShowAddForm(true); setEditingItem(null); setAiResult(null) }} className="btn-primary text-sm py-2 px-5">
                + הוסף מוצר
              </button>
            </div>

            {/* Quick-add */}
            <div className="card p-5 mb-6 border-2 border-dashed border-coffee-300 bg-coffee-50/50">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">⚡</span>
                <h3 className="font-bold text-coffee-900">הוספה מהירה</h3>
                <span className="text-xs text-coffee-400">— שם, קטגוריה ומחיר בלבד</span>
              </div>
              <div className="flex gap-3 flex-wrap">
                <input
                  value={quickName}
                  onChange={e => setQuickName(e.target.value)}
                  placeholder="שם המוצר..."
                  className="input-admin flex-1 min-w-40"
                />
                <select
                  value={quickCategory}
                  onChange={e => setQuickCategory(e.target.value)}
                  className="input-admin w-48"
                >
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <input
                  type="number"
                  value={quickPrice}
                  onChange={e => setQuickPrice(e.target.value)}
                  placeholder="מחיר ₪"
                  className="input-admin w-28"
                  min={0}
                />
                <button
                  disabled={quickLoading || !quickName.trim() || !quickPrice}
                  onClick={async () => {
                    setQuickLoading(true); setQuickResult(null)
                    const descMap: Record<string, string> = {
                      'פולי קפה': `${quickName} — פולי קפה ספיישלטי באיכות גבוהה`,
                      'מכונות קפה': `${quickName} — מכונת קפה איכותית לשימוש ביתי`,
                      'אביזרים': `${quickName} — אביזר קפה איכותי לחוויה מושלמת`,
                      'מתנות': `${quickName} — סט מתנה מושלם לאוהבי קפה`,
                    }
                    const newProduct = {
                      name: quickName.trim(),
                      description: descMap[quickCategory] || quickName.trim(),
                      price: parseFloat(quickPrice),
                      category: quickCategory,
                      popular: false,
                    }
                    const res = await fetch(`${API}/admin/menu`, {
                      method: 'POST', headers, body: JSON.stringify(newProduct),
                    })
                    if (res.ok) {
                      const item = await res.json()
                      setQuickResult(item)
                      setQuickName(''); setQuickPrice('')
                      fetchMenu()
                      flash(setMenuMsg, `✅ "${item.name}" נוסף בהצלחה`)
                    }
                    setQuickLoading(false)
                  }}
                  className="btn-primary text-sm py-2 px-5 disabled:opacity-60 whitespace-nowrap"
                >
                  {quickLoading ? '...' : '+ הוסף'}
                </button>
              </div>
              {quickResult && (
                <div className="mt-3 bg-white rounded-xl p-3 text-sm border border-coffee-200">
                  <span className="font-bold text-coffee-900">{quickResult.name}</span>
                  <span className="text-coffee-500 mx-2">·</span>
                  <span className="font-bold text-coffee-800">₪{quickResult.price}</span>
                  <span className="text-coffee-400 text-xs mr-2">({quickResult.category})</span>
                </div>
              )}
            </div>

            {menuMsg && (
              <div className="bg-coffee-50 border border-coffee-300 text-coffee-800 rounded-xl p-3 mb-5 text-sm font-medium">
                {menuMsg}
              </div>
            )}

            {/* Add form */}
            {showAddForm && (
              <div className="card p-6 mb-6 border-2 border-coffee-300">
                <h3 className="font-bold text-coffee-900 mb-4 text-lg">הוספת מוצר חדש</h3>
                <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="label-admin">שם המוצר</label>
                    <input required value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                      className="input-admin" placeholder="שם המוצר" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label-admin">תיאור</label>
                    <textarea rows={2} value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                      className="input-admin resize-none" placeholder="תיאור קצר" />
                  </div>
                  <div>
                    <label className="label-admin">מחיר (₪)</label>
                    <input type="number" min={0} step={0.5} required value={newItem.price}
                      onChange={e => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
                      className="input-admin" />
                  </div>
                  <div>
                    <label className="label-admin">קטגוריה</label>
                    <select value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                      className="input-admin">
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="checkbox" id="pop-new" checked={newItem.popular}
                      onChange={e => setNewItem({ ...newItem, popular: e.target.checked })}
                      className="w-4 h-4 accent-coffee-700" />
                    <label htmlFor="pop-new" className="text-sm text-coffee-700">מוצר פופולרי</label>
                  </div>
                  <div className="md:col-span-2">
                    <label className="label-admin">תמונה</label>
                    <input
                      type="text"
                      placeholder="הדבק כתובת URL של תמונה..."
                      value={newItem.image || ''}
                      onChange={e => setNewItem({ ...newItem, image: e.target.value || null })}
                      className="input-admin mb-2"
                    />
                    <div className="text-xs text-coffee-400 mb-2 text-center">— או —</div>
                    <input type="file" accept="image/*"
                      onChange={async e => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const url = await uploadImage(file)
                        setNewItem({ ...newItem, image: url })
                      }}
                      className="input-admin" />
                    {newItem.image && (
                      <div className="relative mt-2 inline-block">
                        <img src={newItem.image} alt="preview"
                          className="h-28 w-full object-cover rounded-xl" />
                        <button type="button"
                          onClick={() => setNewItem({ ...newItem, image: null })}
                          className="absolute top-1 left-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center">
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-2 flex gap-3 mt-2">
                    <button type="submit" className="btn-primary text-sm py-2 px-5">שמור מוצר</button>
                    <button type="button" onClick={() => setShowAddForm(false)} className="btn-outline text-sm py-2 px-5">ביטול</button>
                  </div>
                </form>
              </div>
            )}

            {/* Edit form */}
            {editingItem && (
              <div className="card p-6 mb-6 border-2 border-coffee-500">
                <h3 className="font-bold text-coffee-900 mb-4 text-lg">עריכת מוצר: {editingItem.name}</h3>
                <form onSubmit={handleUpdateItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="label-admin">שם המוצר</label>
                    <input required value={editingItem.name} onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                      className="input-admin" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label-admin">תיאור</label>
                    <textarea rows={2} value={editingItem.description}
                      onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                      className="input-admin resize-none" />
                  </div>
                  <div>
                    <label className="label-admin">מחיר (₪)</label>
                    <input type="number" min={0} step={0.5} required value={editingItem.price}
                      onChange={e => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })}
                      className="input-admin" />
                  </div>
                  <div>
                    <label className="label-admin">קטגוריה</label>
                    <select value={editingItem.category} onChange={e => setEditingItem({ ...editingItem, category: e.target.value })}
                      className="input-admin">
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="checkbox" id="pop-edit" checked={editingItem.popular}
                      onChange={e => setEditingItem({ ...editingItem, popular: e.target.checked })}
                      className="w-4 h-4 accent-coffee-700" />
                    <label htmlFor="pop-edit" className="text-sm text-coffee-700">מוצר פופולרי</label>
                  </div>
                  <div className="md:col-span-2">
                    <label className="label-admin">תמונה</label>
                    <input
                      type="text"
                      placeholder="הדבק כתובת URL של תמונה..."
                      value={editingItem.image || ''}
                      onChange={e => setEditingItem({ ...editingItem, image: e.target.value || null })}
                      className="input-admin mb-2"
                    />
                    <div className="text-xs text-coffee-400 mb-2 text-center">— או —</div>
                    <input type="file" accept="image/*"
                      onChange={async e => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const url = await uploadImage(file)
                        setEditingItem({ ...editingItem, image: url })
                      }}
                      className="input-admin" />
                    {editingItem.image && (
                      <div className="relative mt-2 inline-block">
                        <img src={editingItem.image} alt="preview"
                          className="h-28 w-48 object-cover rounded-xl" />
                        <button type="button"
                          onClick={() => setEditingItem({ ...editingItem, image: null })}
                          className="absolute top-1 left-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center">
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-2 flex gap-3 mt-2">
                    <button type="submit" className="btn-primary text-sm py-2 px-5">שמור שינויים</button>
                    <button type="button" onClick={() => setEditingItem(null)} className="btn-outline text-sm py-2 px-5">ביטול</button>
                  </div>
                </form>
              </div>
            )}

            {/* Items table */}
            {loadingMenu ? (
              <div className="text-center py-10 text-coffee-500">טוען...</div>
            ) : (
              <div className="card overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-coffee-50 text-coffee-600 font-semibold">
                    <tr>
                      <th className="text-right px-4 py-3">שם</th>
                      <th className="text-right px-4 py-3">קטגוריה</th>
                      <th className="text-right px-4 py-3">מחיר</th>
                      <th className="text-right px-4 py-3">פופולרי</th>
                      <th className="text-right px-4 py-3">פעולות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, i) => (
                      <tr key={item.id} className={`border-t border-coffee-50 ${i % 2 === 0 ? 'bg-white' : 'bg-coffee-50/40'}`}>
                        <td className="px-4 py-3 font-medium text-coffee-900">{item.name}</td>
                        <td className="px-4 py-3 text-coffee-600">{item.category}</td>
                        <td className="px-4 py-3 text-coffee-700 font-bold">₪{item.price}</td>
                        <td className="px-4 py-3">{item.popular ? '⭐ כן' : '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setEditingItem({ ...item }); setShowAddForm(false) }}
                              className="bg-coffee-100 hover:bg-coffee-200 text-coffee-800 text-xs font-medium px-3 py-1 rounded-full transition-colors"
                            >
                              עריכה
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id, item.name)}
                              className="bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium px-3 py-1 rounded-full transition-colors"
                            >
                              מחיקה
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── SETTINGS TAB ── */}
        {tab === 'settings' && settingsForm && (
          <div>
            <h2 className="text-2xl font-bold text-coffee-900 mb-6">הגדרות האתר</h2>
            {settingsMsg && (
              <div className="bg-coffee-50 border border-coffee-300 text-coffee-800 rounded-xl p-3 mb-5 text-sm font-medium">
                {settingsMsg}
              </div>
            )}
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="card p-6">
                <h3 className="font-bold text-coffee-900 mb-4">פרטי יצירת קשר</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label-admin">כתובת</label>
                    <input value={settingsForm.address}
                      onChange={e => setSettingsForm({ ...settingsForm, address: e.target.value })}
                      className="input-admin" />
                  </div>
                  <div>
                    <label className="label-admin">טלפון</label>
                    <input value={settingsForm.phone}
                      onChange={e => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                      className="input-admin" dir="ltr" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label-admin">אימייל</label>
                    <input value={settingsForm.email}
                      onChange={e => setSettingsForm({ ...settingsForm, email: e.target.value })}
                      className="input-admin" dir="ltr" />
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="font-bold text-coffee-900 mb-4">שעות פעילות</h3>
                <div className="space-y-3">
                  {settingsForm.hours.map((h, idx) => (
                    <div key={idx} className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="label-admin">ימים</label>
                        <input value={h.days}
                          onChange={e => {
                            const hours = [...settingsForm.hours]
                            hours[idx] = { ...hours[idx], days: e.target.value }
                            setSettingsForm({ ...settingsForm, hours })
                          }}
                          className="input-admin" />
                      </div>
                      <div>
                        <label className="label-admin">שעות</label>
                        <input value={h.hours}
                          onChange={e => {
                            const hours = [...settingsForm.hours]
                            hours[idx] = { ...hours[idx], hours: e.target.value }
                            setSettingsForm({ ...settingsForm, hours })
                          }}
                          className="input-admin" dir="ltr" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-primary px-8 py-3">
                שמור הגדרות
              </button>
            </form>
          </div>
        )}

        {/* ── ABOUT TAB ── */}
        {tab === 'about' && aboutForm && (
          <div>
            <h2 className="text-2xl font-bold text-coffee-900 mb-6">עריכת דף אודות</h2>
            {aboutMsg && (
              <div className="bg-coffee-50 border border-coffee-300 text-coffee-800 rounded-xl p-3 mb-5 text-sm font-medium">
                {aboutMsg}
              </div>
            )}

            <div className="space-y-6">

              {/* Story */}
              <div className="card p-6">
                <h3 className="font-bold text-coffee-900 mb-4">סיפור הבית</h3>
                <div className="space-y-4">
                  <div>
                    <label className="label-admin">כותרת</label>
                    <input value={aboutForm.story_title}
                      onChange={e => setAboutForm({ ...aboutForm, story_title: e.target.value })}
                      className="input-admin" />
                  </div>
                  {aboutForm.story_paragraphs.map((p, idx) => (
                    <div key={idx}>
                      <label className="label-admin">פסקה {idx + 1}</label>
                      <textarea rows={3} value={p}
                        onChange={e => {
                          const paragraphs = [...aboutForm.story_paragraphs]
                          paragraphs[idx] = e.target.value
                          setAboutForm({ ...aboutForm, story_paragraphs: paragraphs })
                        }}
                        className="input-admin resize-none" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Values */}
              <div className="card p-6">
                <h3 className="font-bold text-coffee-900 mb-4">ערכים</h3>
                <div className="space-y-6">
                  {aboutForm.values.map((v, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 pb-4 border-b border-coffee-50 last:border-0">
                      <div>
                        <label className="label-admin">אייקון (emoji)</label>
                        <input value={v.icon}
                          onChange={e => {
                            const values = [...aboutForm.values]
                            values[idx] = { ...values[idx], icon: e.target.value }
                            setAboutForm({ ...aboutForm, values })
                          }}
                          className="input-admin" />
                      </div>
                      <div>
                        <label className="label-admin">כותרת</label>
                        <input value={v.title}
                          onChange={e => {
                            const values = [...aboutForm.values]
                            values[idx] = { ...values[idx], title: e.target.value }
                            setAboutForm({ ...aboutForm, values })
                          }}
                          className="input-admin" />
                      </div>
                      <div>
                        <label className="label-admin">תיאור</label>
                        <input value={v.desc}
                          onChange={e => {
                            const values = [...aboutForm.values]
                            values[idx] = { ...values[idx], desc: e.target.value }
                            setAboutForm({ ...aboutForm, values })
                          }}
                          className="input-admin" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={async () => {
                  const res = await fetch(`${API}/admin/about-content`, {
                    method: 'PUT', headers, body: JSON.stringify(aboutForm),
                  })
                  if (res.ok) { fetchAbout(); flash(setAboutMsg, '✅ דף האודות עודכן בהצלחה') }
                }}
                className="btn-primary px-8 py-3"
              >
                שמור שינויים
              </button>
            </div>
          </div>
        )}

        {/* ── HOME TAB ── */}
        {tab === 'home' && homeForm && (
          <div>
            <h2 className="text-2xl font-bold text-coffee-900 mb-6">עריכת דף הבית</h2>
            {homeMsg && (
              <div className="bg-coffee-50 border border-coffee-300 text-coffee-800 rounded-xl p-3 mb-5 text-sm font-medium">
                {homeMsg}
              </div>
            )}

            <div className="space-y-6">

              {/* Hero section */}
              <div className="card p-6">
                <h3 className="font-bold text-coffee-900 mb-4">אזור הכניסה (Hero)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="label-admin">כותרת משנה</label>
                    <input value={homeForm.hero_subtitle}
                      onChange={e => setHomeForm({ ...homeForm, hero_subtitle: e.target.value })}
                      className="input-admin" />
                  </div>
                  <div>
                    <label className="label-admin">תיאור</label>
                    <textarea rows={3} value={homeForm.hero_description}
                      onChange={e => setHomeForm({ ...homeForm, hero_description: e.target.value })}
                      className="input-admin resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label-admin">כפתור ראשי</label>
                      <input value={homeForm.hero_btn_primary}
                        onChange={e => setHomeForm({ ...homeForm, hero_btn_primary: e.target.value })}
                        className="input-admin" />
                    </div>
                    <div>
                      <label className="label-admin">כפתור משני</label>
                      <input value={homeForm.hero_btn_secondary}
                        onChange={e => setHomeForm({ ...homeForm, hero_btn_secondary: e.target.value })}
                        className="input-admin" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="card p-6">
                <h3 className="font-bold text-coffee-900 mb-4">יתרונות (3 קלפים)</h3>
                <div className="space-y-6">
                  {homeForm.features.map((f, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 pb-4 border-b border-coffee-50 last:border-0">
                      <div>
                        <label className="label-admin">אייקון (emoji)</label>
                        <input value={f.icon}
                          onChange={e => {
                            const features = [...homeForm.features]
                            features[idx] = { ...features[idx], icon: e.target.value }
                            setHomeForm({ ...homeForm, features })
                          }}
                          className="input-admin" />
                      </div>
                      <div>
                        <label className="label-admin">כותרת</label>
                        <input value={f.title}
                          onChange={e => {
                            const features = [...homeForm.features]
                            features[idx] = { ...features[idx], title: e.target.value }
                            setHomeForm({ ...homeForm, features })
                          }}
                          className="input-admin" />
                      </div>
                      <div>
                        <label className="label-admin">תיאור</label>
                        <input value={f.desc}
                          onChange={e => {
                            const features = [...homeForm.features]
                            features[idx] = { ...features[idx], desc: e.target.value }
                            setHomeForm({ ...homeForm, features })
                          }}
                          className="input-admin" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="card p-6">
                <h3 className="font-bold text-coffee-900 mb-4">קריאה לפעולה (CTA)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="label-admin">כותרת</label>
                    <input value={homeForm.cta_title}
                      onChange={e => setHomeForm({ ...homeForm, cta_title: e.target.value })}
                      className="input-admin" />
                  </div>
                  <div>
                    <label className="label-admin">תיאור</label>
                    <textarea rows={2} value={homeForm.cta_desc}
                      onChange={e => setHomeForm({ ...homeForm, cta_desc: e.target.value })}
                      className="input-admin resize-none" />
                  </div>
                </div>
              </div>

              <button
                onClick={async () => {
                  const res = await fetch(`${API}/admin/home-content`, {
                    method: 'PUT', headers, body: JSON.stringify(homeForm),
                  })
                  if (res.ok) { fetchHome(); flash(setHomeMsg, '✅ דף הבית עודכן בהצלחה') }
                }}
                className="btn-primary px-8 py-3"
              >
                שמור שינויים
              </button>
            </div>
          </div>
        )}

        {/* ── MENU PAGE TAB ── */}
        {tab === 'menu-page' && menuPageForm && (
          <div>
            <h2 className="text-2xl font-bold text-coffee-900 mb-6">עריכת דף מוצרים</h2>
            {menuPageMsg && (
              <div className="bg-coffee-50 border border-coffee-300 text-coffee-800 rounded-xl p-3 mb-5 text-sm font-medium">
                {menuPageMsg}
              </div>
            )}
            <div className="space-y-6">
              <div className="card p-6">
                <h3 className="font-bold text-coffee-900 mb-4">כותרת הדף</h3>
                <div className="space-y-4">
                  <div>
                    <label className="label-admin">כותרת ראשית</label>
                    <input value={menuPageForm.title}
                      onChange={e => setMenuPageForm({ ...menuPageForm, title: e.target.value })}
                      className="input-admin" />
                  </div>
                  <div>
                    <label className="label-admin">כותרת משנה</label>
                    <input value={menuPageForm.subtitle}
                      onChange={e => setMenuPageForm({ ...menuPageForm, subtitle: e.target.value })}
                      className="input-admin" />
                  </div>
                </div>
              </div>
              <button
                onClick={async () => {
                  const res = await fetch(`${API}/admin/menu-content`, {
                    method: 'PUT', headers, body: JSON.stringify(menuPageForm),
                  })
                  if (res.ok) { fetchMenuPage(); flash(setMenuPageMsg, '✅ דף המוצרים עודכן בהצלחה') }
                }}
                className="btn-primary px-8 py-3"
              >
                שמור שינויים
              </button>
            </div>
          </div>
        )}

        {/* ── CONTACT PAGE TAB ── */}
        {tab === 'contact-page' && contactPageForm && (
          <div>
            <h2 className="text-2xl font-bold text-coffee-900 mb-6">עריכת דף צרו קשר</h2>
            {contactPageMsg && (
              <div className="bg-coffee-50 border border-coffee-300 text-coffee-800 rounded-xl p-3 mb-5 text-sm font-medium">
                {contactPageMsg}
              </div>
            )}
            <div className="space-y-6">
              <div className="card p-6">
                <h3 className="font-bold text-coffee-900 mb-4">טקסטים בדף</h3>
                <div className="space-y-4">
                  <div>
                    <label className="label-admin">כותרת ראשית</label>
                    <input value={contactPageForm.title}
                      onChange={e => setContactPageForm({ ...contactPageForm, title: e.target.value })}
                      className="input-admin" />
                  </div>
                  <div>
                    <label className="label-admin">כותרת משנה</label>
                    <input value={contactPageForm.subtitle}
                      onChange={e => setContactPageForm({ ...contactPageForm, subtitle: e.target.value })}
                      className="input-admin" />
                  </div>
                  <div>
                    <label className="label-admin">כותרת אזור המידע</label>
                    <input value={contactPageForm.info_title}
                      onChange={e => setContactPageForm({ ...contactPageForm, info_title: e.target.value })}
                      className="input-admin" />
                  </div>
                  <div>
                    <label className="label-admin">כותרת הטופס</label>
                    <input value={contactPageForm.form_title}
                      onChange={e => setContactPageForm({ ...contactPageForm, form_title: e.target.value })}
                      className="input-admin" />
                  </div>
                </div>
              </div>
              <p className="text-sm text-coffee-500">לעריכת כתובת, טלפון ושעות פעילות — עבור ל<button onClick={() => setTab('settings')} className="underline text-coffee-700">הגדרות</button></p>
              <button
                onClick={async () => {
                  const res = await fetch(`${API}/admin/contact-content`, {
                    method: 'PUT', headers, body: JSON.stringify(contactPageForm),
                  })
                  if (res.ok) { fetchContactPage(); flash(setContactPageMsg, '✅ דף צרו קשר עודכן בהצלחה') }
                }}
                className="btn-primary px-8 py-3"
              >
                שמור שינויים
              </button>
            </div>
          </div>
        )}

        {/* ── MESSAGES TAB ── */}
        {tab === 'messages' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-coffee-900">הודעות שהתקבלו</h2>
              <button onClick={() => fetchMessages(token!)} className="btn-outline text-sm py-2 px-4">רענן</button>
            </div>
            {messages.length === 0 ? (
              <div className="card p-10 text-center text-coffee-400">עדיין לא התקבלו הודעות</div>
            ) : (
              <div className="space-y-4">
                {[...messages].reverse().map(msg => (
                  <div key={msg.id} className="card p-5">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-bold text-coffee-900">{msg.name}</span>
                        <span className="text-coffee-500 text-sm mr-2">— {msg.email}</span>
                      </div>
                      <span className="text-xs text-coffee-400">{new Date(msg.timestamp).toLocaleString('he-IL')}</span>
                    </div>
                    <p className="text-coffee-700 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ORDERS TAB ── */}
        {tab === 'orders' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-coffee-900">הזמנות</h2>
              <button onClick={() => fetchOrders(token!)} className="btn-outline text-sm py-2 px-4">רענן</button>
            </div>
            {orders.length === 0 ? (
              <div className="card p-10 text-center text-coffee-400">עדיין לא התקבלו הזמנות</div>
            ) : (
              <div className="space-y-4">
                {[...orders].reverse().map(order => (
                  <div key={order.id} className="card p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="font-bold text-coffee-900">#{order.id} — {order.customer_name}</span>
                        <span className="mr-3 bg-coffee-100 text-coffee-700 text-xs font-medium px-2 py-0.5 rounded-full">{order.status}</span>
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-coffee-900">₪{order.total.toFixed(2)}</div>
                        <div className="text-xs text-coffee-400">{new Date(order.timestamp).toLocaleString('he-IL')}</div>
                      </div>
                    </div>
                    <ul className="text-sm text-coffee-600 space-y-1">
                      {order.items.map((item, i) => (
                        <li key={i}>• {item.name} × {item.quantity} — ₪{item.subtotal.toFixed(2)}</li>
                      ))}
                    </ul>
                    {order.notes && <p className="text-sm text-coffee-500 mt-2 italic">הערות: {order.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
