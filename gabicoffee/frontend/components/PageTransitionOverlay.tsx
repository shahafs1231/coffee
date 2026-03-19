'use client'
import { usePageTransition } from '@/context/TransitionContext'

export default function PageTransitionOverlay() {
  const { phase } = usePageTransition()

  const visible = phase === 'covering' || phase === 'covered'

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'linear-gradient(180deg, #0f0400 0%, #2b0f03 40%, #4a1e08 100%)',
        transform: visible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.5s cubic-bezier(0.76, 0, 0.24, 1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        pointerEvents: phase === 'idle' ? 'none' : 'all',
      }}
    >
      {/* Steam lines */}
      <div style={{ display: 'flex', gap: '10px', height: '40px', alignItems: 'flex-end', marginBottom: '-4px' }}>
        <div className="coffee-steam" style={{ animationDelay: '0s' }} />
        <div className="coffee-steam" style={{ animationDelay: '0.4s' }} />
        <div className="coffee-steam" style={{ animationDelay: '0.8s' }} />
      </div>

      {/* Coffee cup */}
      <div style={{ fontSize: '72px', lineHeight: 1 }}>☕</div>

      {/* Brand name */}
      <p
        style={{
          color: '#d4a057',
          fontFamily: 'Heebo, sans-serif',
          fontSize: '20px',
          fontWeight: 700,
          letterSpacing: '0.05em',
          opacity: 0.9,
          marginTop: '4px',
        }}
      >
        גבריאלס׳ קפה
      </p>
    </div>
  )
}
