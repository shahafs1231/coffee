'use client'
import { useEffect, useState } from 'react'

const API = 'http://localhost:8001'

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

export default function AboutPage() {
  const [content, setContent] = useState<AboutContent>(DEFAULT)

  useEffect(() => {
    fetch(`${API}/about-content`)
      .then(r => r.json())
      .then(data => setContent(data))
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div
        className="py-20 text-center"
        style={{ background: 'linear-gradient(135deg, #321908 0%, #884d18 100%)' }}
      >
        <h1 className="text-5xl font-black text-cream mb-3">אודות</h1>
        <p className="text-coffee-200 text-lg">הסיפור שמאחורי הכוס</p>
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
          <h2 className="text-3xl font-bold text-coffee-900 mb-8 text-center">הערכים שלנו</h2>
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
