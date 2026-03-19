'use client'

import { useEffect, useRef, useState } from 'react'

export default function VideoIntro() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [phase, setPhase] = useState<'playing' | 'fading' | 'done'>('playing')

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleEnded = () => setPhase('fading')

    // Also allow skipping on click/tap
    video.addEventListener('ended', handleEnded)
    return () => video.removeEventListener('ended', handleEnded)
  }, [])

  // After fade transition ends, unmount completely
  const handleTransitionEnd = () => {
    if (phase === 'fading') setPhase('done')
  }

  if (phase === 'done') return null

  return (
    <div
      onTransitionEnd={handleTransitionEnd}
      onClick={() => setPhase('fading')}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#000',
        cursor: 'pointer',
        opacity: phase === 'fading' ? 0 : 1,
        transition: phase === 'fading' ? 'opacity 0.8s ease' : 'none',
      }}
    >
      <video
        ref={videoRef}
        src="/intro.mp4"
        autoPlay
        muted
        playsInline
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
      {/* Skip hint */}
      <div style={{
        position: 'absolute',
        bottom: 32,
        left: '50%',
        transform: 'translateX(-50%)',
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        letterSpacing: 1,
        pointerEvents: 'none',
      }}>
        לחץ לדילוג
      </div>
    </div>
  )
}
