'use client'
import { useEffect } from 'react'
import { useLang } from '@/context/LanguageContext'

export default function HtmlDirSync() {
  const { lang } = useLang()
  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr'
  }, [lang])
  return null
}
