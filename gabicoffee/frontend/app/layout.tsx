import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CartDrawer from '@/components/CartDrawer'
import { CartProvider } from '@/context/CartContext'
import { LanguageProvider } from '@/context/LanguageContext'
import { TransitionProvider } from '@/context/TransitionContext'
import HtmlDirSync from '@/components/HtmlDirSync'
import VideoIntro from '@/components/VideoIntro'
import PageTransitionOverlay from '@/components/PageTransitionOverlay'

export const metadata: Metadata = {
  title: "גבריאלס' קפה",
  description: "בית הקפה גבריאלס — קפה איכותי, אוכל טרי ואווירה חמימה",
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans">
        <LanguageProvider>
          <TransitionProvider>
            <PageTransitionOverlay />
            <HtmlDirSync />
            <VideoIntro />
            <CartProvider>
              <Navbar />
              <CartDrawer />
              <main className="flex-grow">{children}</main>
              <Footer />
            </CartProvider>
          </TransitionProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
