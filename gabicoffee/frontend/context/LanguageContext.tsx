'use client'
import { createContext, useContext, useState } from 'react'

export type Lang = 'he' | 'en'

const LanguageContext = createContext<{ lang: Lang; toggle: () => void }>({
  lang: 'he',
  toggle: () => {},
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('he')
  const toggle = () => setLang(l => (l === 'he' ? 'en' : 'he'))
  return (
    <LanguageContext.Provider value={{ lang, toggle }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLang = () => useContext(LanguageContext)
