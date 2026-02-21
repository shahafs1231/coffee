'use client'
import { useState, useEffect } from 'react'

const API = 'http://localhost:8001'

interface Settings {
  address: string
  phone: string
  email: string
  hours: { days: string; hours: string }[]
}

const DEFAULT_SETTINGS: Settings = {
  address: 'רוטשילד 55, תל אביב',
  phone:   '052-5961616',
  email:   'hello@gabrielscoffee.co.il',
  hours: [
    { days: 'ראשון – חמישי', hours: '07:00 – 22:00' },
    { days: 'שישי',          hours: '07:00 – 17:00' },
    { days: 'שבת',           hours: '08:00 – 20:00' },
  ],
}

const DEFAULT_CONTENT = { title: 'צרו קשר', subtitle: 'נשמח לשמוע מכם', info_title: 'מצאו אותנו', form_title: 'שלחו לנו הודעה' }

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [serverMessage, setServerMessage] = useState('')
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [content, setContent] = useState(DEFAULT_CONTENT)

  useEffect(() => {
    fetch(`${API}/settings`)
      .then(r => r.json())
      .then(data => setSettings(data))
      .catch(() => {})
    fetch(`${API}/contact-content`)
      .then(r => r.json())
      .then(data => setContent(data))
      .catch(() => {})
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch(`${API}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        setServerMessage(data.message)
        setForm({ name: '', email: '', message: '' })
      } else {
        setStatus('error')
        setServerMessage('אירעה שגיאה בשליחת ההודעה. נסו שוב.')
      }
    } catch {
      setStatus('error')
      setServerMessage('לא ניתן להתחבר לשרת. בדקו את החיבור לאינטרנט.')
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div
        className="py-20 text-center"
        style={{ background: 'linear-gradient(135deg, #321908 0%, #884d18 100%)' }}
      >
        <h1 className="text-5xl font-black text-cream mb-3">{content.title}</h1>
        <p className="text-coffee-200 text-lg">{content.subtitle}</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-12">
        {/* Info */}
        <div>
          <h2 className="text-2xl font-bold text-coffee-900 mb-6">{content.info_title}</h2>

          <div className="space-y-5">
            {[
              { icon: '📍', label: 'כתובת', value: settings.address },
              { icon: '📞', label: 'טלפון', value: settings.phone   },
              { icon: '✉️', label: 'אימייל', value: settings.email  },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-start gap-4">
                <span className="text-2xl mt-0.5">{icon}</span>
                <div>
                  <div className="text-xs text-coffee-400 font-medium uppercase tracking-wide">{label}</div>
                  <div className="text-coffee-800 font-medium">{value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <h3 className="font-bold text-coffee-900 mb-3">שעות פעילות</h3>
            <table className="text-sm text-coffee-700 w-full">
              <tbody>
                {settings.hours.map(({ days, hours }) => (
                  <tr key={days} className="border-b border-coffee-100">
                    <td className="py-2 font-medium">{days}</td>
                    <td className="py-2 text-right text-coffee-600">{hours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Map placeholder */}
          <div
            className="mt-8 rounded-2xl h-48 flex items-center justify-center text-5xl shadow-inner"
            style={{ background: 'linear-gradient(135deg, #faefd8, #e8bc70)' }}
          >
            🗺️
          </div>
        </div>

        {/* Form */}
        <div>
          <h2 className="text-2xl font-bold text-coffee-900 mb-6">{content.form_title}</h2>

          {status === 'success' && (
            <div className="bg-green-50 border border-green-300 text-green-800 rounded-xl p-4 mb-6 font-medium">
              ✅ {serverMessage}
            </div>
          )}
          {status === 'error' && (
            <div className="bg-red-50 border border-red-300 text-red-700 rounded-xl p-4 mb-6">
              ❌ {serverMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-coffee-800 mb-1">שם מלא *</label>
              <input type="text" name="name" required value={form.name} onChange={handleChange}
                placeholder="הכניסו את שמכם"
                className="w-full border border-coffee-200 rounded-xl px-4 py-3 text-coffee-900 focus:outline-none focus:ring-2 focus:ring-coffee-400 bg-white" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-coffee-800 mb-1">אימייל *</label>
              <input type="email" name="email" required value={form.email} onChange={handleChange}
                placeholder="your@email.com" dir="ltr"
                className="w-full border border-coffee-200 rounded-xl px-4 py-3 text-coffee-900 focus:outline-none focus:ring-2 focus:ring-coffee-400 bg-white" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-coffee-800 mb-1">הודעה *</label>
              <textarea name="message" required rows={5} value={form.message} onChange={handleChange}
                placeholder="כתבו לנו כאן..."
                className="w-full border border-coffee-200 rounded-xl px-4 py-3 text-coffee-900 focus:outline-none focus:ring-2 focus:ring-coffee-400 bg-white resize-none" />
            </div>

            <button type="submit" disabled={status === 'loading'}
              className="btn-primary w-full text-base py-4 disabled:opacity-60">
              {status === 'loading' ? 'שולח...' : 'שלח הודעה'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
