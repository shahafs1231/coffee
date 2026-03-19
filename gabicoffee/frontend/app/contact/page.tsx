'use client'
import { useState, useEffect } from 'react'
import { useLang } from '@/context/LanguageContext'
import { useT } from '@/lib/translations'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

const DAYS_EN: Record<string, string> = {
  'ראשון': 'Sunday',
  'שני': 'Monday',
  'שלישי': 'Tuesday',
  'רביעי': 'Wednesday',
  'חמישי': 'Thursday',
  'שישי': 'Friday',
  'שבת': 'Saturday',
  'ראשון, שלישי – חמישי': 'Sun, Tue – Thu',
  'סגור': 'Closed',
}

function translateDays(days: string, lang: string) {
  if (lang !== 'en') return days
  return DAYS_EN[days] ?? days
}

function translateHours(hours: string, lang: string) {
  if (lang !== 'en') return hours
  return hours === 'סגור' ? 'Closed' : hours
}

interface Settings {
  address: string
  phone: string
  email: string
  hours: { days: string; hours: string }[]
}

const DEFAULT_SETTINGS: Settings = {
  address: 'רוטשילד 55, ראשון לציון',
  phone:   '052-5961616',
  email:   'hello@gabrielscoffee.co.il',
  hours: [
    { days: 'ראשון, שלישי – חמישי', hours: '09:30–14:30 | 16:30–20:00' },
    { days: 'שני',                   hours: 'סגור' },
    { days: 'שישי',                  hours: '09:30–14:00' },
  ],
}

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [serverMessage, setServerMessage] = useState('')
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const { lang } = useLang()
  const t = useT(lang)

  useEffect(() => {
    fetch(`${API}/settings`)
      .then(r => r.json())
      .then(data => setSettings(data))
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
        setServerMessage(t.contact.errorMsg)
      }
    } catch {
      setStatus('error')
      setServerMessage(t.contact.networkErr)
    }
  }

  const infoItems = [
    { icon: '📍', label: t.contact.address, value: settings.address },
    { icon: '📞', label: t.contact.phone,   value: settings.phone   },
    { icon: '✉️', label: t.contact.email,   value: settings.email   },
  ]

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div
        className="py-20 text-center"
        style={{ background: 'linear-gradient(135deg, #321908 0%, #884d18 100%)' }}
      >
        <h1 className="text-5xl font-black text-cream mb-3">{t.contact.title}</h1>
        <p className="text-coffee-200 text-lg">{t.contact.subtitle}</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-12">
        {/* Info */}
        <div>
          <h2 className="text-2xl font-bold text-coffee-900 mb-6">{t.contact.infoTitle}</h2>

          <div className="space-y-5">
            {infoItems.map(({ icon, label, value }) => (
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
            <h3 className="font-bold text-coffee-900 mb-3">{t.contact.hoursTitle}</h3>
            <table className="text-sm text-coffee-700 w-full">
              <tbody>
                {settings.hours.map(({ days, hours }) => (
                  <tr key={days} className="border-b border-coffee-100">
                    <td className="py-2 font-medium">{translateDays(days, lang)}</td>
                    <td className="py-2 text-right text-coffee-600">{translateHours(hours, lang)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Map links */}
          <div className="mt-8 rounded-2xl overflow-hidden shadow-inner" style={{ background: 'linear-gradient(135deg, #faefd8, #e8bc70)' }}>
            <div className="flex flex-col sm:flex-row gap-3 p-5">
              <a
                href="https://www.google.com/maps/search/?api=1&query=רוטשילד+55+ראשון+לציון"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-white rounded-xl py-4 px-4 font-bold text-coffee-900 shadow hover:shadow-md hover:bg-coffee-50 transition-all text-sm"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google Maps" className="w-5 h-5" />
                Google Maps
              </a>
              <a
                href="https://waze.com/ul?q=רוטשילד+55+ראשון+לציון&navigate=yes"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-white rounded-xl py-4 px-4 font-bold text-coffee-900 shadow hover:shadow-md hover:bg-coffee-50 transition-all text-sm"
              >
                <img src="https://www.waze.com/favicon.ico" alt="Waze" className="w-5 h-5" />
                Waze
              </a>
            </div>
            <div className="text-center pb-4 text-coffee-700 text-sm font-medium">
              📍 רוטשילד 55, ראשון לציון
            </div>
          </div>
        </div>

        {/* Form */}
        <div>
          <h2 className="text-2xl font-bold text-coffee-900 mb-6">{t.contact.formTitle}</h2>

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
              <label className="block text-sm font-semibold text-coffee-800 mb-1">{t.contact.nameLabel}</label>
              <input type="text" name="name" required value={form.name} onChange={handleChange}
                placeholder={t.contact.namePlaceholder}
                className="w-full border border-coffee-200 rounded-xl px-4 py-3 text-coffee-900 focus:outline-none focus:ring-2 focus:ring-coffee-400 bg-white" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-coffee-800 mb-1">{t.contact.emailLabel}</label>
              <input type="email" name="email" required value={form.email} onChange={handleChange}
                placeholder="your@email.com" dir="ltr"
                className="w-full border border-coffee-200 rounded-xl px-4 py-3 text-coffee-900 focus:outline-none focus:ring-2 focus:ring-coffee-400 bg-white" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-coffee-800 mb-1">{t.contact.msgLabel}</label>
              <textarea name="message" required rows={5} value={form.message} onChange={handleChange}
                placeholder={t.contact.msgPlaceholder}
                className="w-full border border-coffee-200 rounded-xl px-4 py-3 text-coffee-900 focus:outline-none focus:ring-2 focus:ring-coffee-400 bg-white resize-none" />
            </div>

            <button type="submit" disabled={status === 'loading'}
              className="btn-primary w-full text-base py-4 disabled:opacity-60">
              {status === 'loading' ? t.contact.sending : t.contact.sendBtn}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
