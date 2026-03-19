'use client'
import { useEffect, useState } from 'react'
import { useLang } from '@/context/LanguageContext'
import { useT } from '@/lib/translations'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

interface Value  { icon: string; title: string; desc: string }
interface Member { name: string; role: string; emoji: string }
interface AboutContent {
  story_title: string
  story_paragraphs: string[]
  values: Value[]
  team: Member[]
}

const DEFAULT: AboutContent = {
  story_title: 'הסיפור שלנו',
  story_paragraphs: [
    "גבריאלס' קפה נולד מתוך אהבה עמוקה לקפה. גבריאל, המייסד, התחיל את מסעו בבתי קפה קטנים ברחבי אירופה, שם גילה שקפה טוב הוא הרבה יותר ממשקה — הוא חוויה, תרבות, קהילה.",
    "בשנת 2018 פתח גבריאל את בית הקפה הראשון שלו בלב תל אביב עם חלום פשוט: ליצור מקום שבו כולם מרגישים בבית ומקבלים כוס קפה מושלמת בכל ביקור.",
    "היום, עם צוות של ברייסטות מיומנים ומאפים שנאפים מדי בוקר, אנחנו ממשיכים לשמור על אותה מסירות לאיכות ולאהבה לקהילה שלנו.",
  ],
  values: [
    { icon: '🌱', title: 'קיימות',           desc: 'אנחנו עובדים עם מגדלי קפה שמשתמשים בשיטות גידול בנות קיימא ומשלמים מחיר הוגן.' },
    { icon: '✨', title: 'איכות ללא פשרות', desc: 'מהפול ועד לכוס — כל שלב בתהליך עובר בקרת איכות קפדנית.' },
    { icon: '❤️', title: 'קהילה',            desc: 'אנחנו לא רק בית קפה, אנחנו מרחב קהילתי — מארחים אירועים, תערוכות וסדנאות.' },
  ],
  team: [
    { name: 'גבריאל כהן', role: 'מייסד וברייסטה ראשי', emoji: '👨‍🍳' },
    { name: 'מיה לוי',    role: 'שפית הפסטריות',        emoji: '👩‍🍳' },
    { name: 'ניר שמואל', role: 'מנהל קפה',              emoji: '☕'   },
  ],
}

const DEFAULT_EN: AboutContent = {
  story_title: 'Our Story',
  story_paragraphs: [
    "Gabriel's Coffee was born out of a deep love for coffee. Gabriel, the founder, began his journey in small coffee shops across Europe, where he discovered that great coffee is much more than a drink — it is an experience, a culture, a community.",
    "In 2018, Gabriel opened his first coffee shop in the heart of Tel Aviv with a simple dream: to create a place where everyone feels at home and gets a perfect cup of coffee on every visit.",
    "Today, with a team of skilled baristas and pastries baked fresh every morning, we continue to uphold that same dedication to quality and love for our community.",
  ],
  values: [
    { icon: '🌱', title: 'Sustainability',       desc: 'We work with coffee growers who use sustainable farming methods and pay a fair price.' },
    { icon: '✨', title: 'Uncompromising Quality', desc: 'From bean to cup — every step in the process goes through rigorous quality control.' },
    { icon: '❤️', title: 'Community',             desc: "We're not just a coffee shop, we're a community space — hosting events, exhibitions and workshops." },
  ],
  team: [
    { name: 'Gabriel Cohen', role: 'Founder & Head Barista', emoji: '👨‍🍳' },
    { name: 'Mia Levi',      role: 'Pastry Chef',             emoji: '👩‍🍳' },
    { name: 'Nir Shmuel',   role: 'Coffee Manager',           emoji: '☕'   },
  ],
}

export default function AboutPage() {
  const [heContent, setHeContent] = useState<AboutContent>(DEFAULT)
  const { lang } = useLang()
  const t = useT(lang)

  useEffect(() => {
    fetch(`${API}/about-content`)
      .then(r => r.json())
      .then(data => setHeContent(data))
      .catch(() => {})
  }, [])

  const content = lang === 'en' ? DEFAULT_EN : heContent

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div
        className="py-20 text-center"
        style={{ background: 'linear-gradient(135deg, #321908 0%, #884d18 100%)' }}
      >
        <h1 className="text-5xl font-black text-cream mb-3">{t.about.title}</h1>
        <p className="text-coffee-200 text-lg">{t.about.subtitle}</p>
      </div>

      <section className="max-w-4xl mx-auto px-4 py-16">

        {/* Story */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-coffee-900 mb-5">{content.story_title}</h2>
            {content.story_paragraphs.map((p, i) => (
              <p key={i} className="text-coffee-700 leading-relaxed mb-4">{p}</p>
            ))}
          </div>
          <div className="flex items-center justify-center">
            <div
              className="w-72 h-72 rounded-3xl flex items-center justify-center text-9xl shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #e8bc70 0%, #a6621a 100%)' }}
            >
              ☕
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-coffee-900 mb-8 text-center">{t.about.valuesTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {content.values.map((v, i) => (
              <div key={i} className="card p-6 text-center">
                <div className="text-4xl mb-3">{v.icon}</div>
                <h3 className="text-lg font-bold text-coffee-900 mb-2">{v.title}</h3>
                <p className="text-coffee-600 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </section>
    </div>
  )
}
