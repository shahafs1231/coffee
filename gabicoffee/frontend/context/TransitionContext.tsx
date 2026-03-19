'use client'
import { createContext, useContext, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

type Phase = 'idle' | 'covering' | 'covered' | 'revealing'

type TransitionContextType = {
  phase: Phase
  navigate: (href: string) => void
}

const TransitionContext = createContext<TransitionContextType>({
  phase: 'idle',
  navigate: () => {},
})

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>('idle')
  const router = useRouter()

  const navigate = useCallback((href: string) => {
    if (phase !== 'idle') return

    setPhase('covering')

    setTimeout(() => {
      router.push(href)
      setPhase('covered')

      setTimeout(() => {
        setPhase('revealing')

        setTimeout(() => {
          setPhase('idle')
        }, 550)
      }, 80)
    }, 550)
  }, [phase, router])

  return (
    <TransitionContext.Provider value={{ phase, navigate }}>
      {children}
    </TransitionContext.Provider>
  )
}

export const usePageTransition = () => useContext(TransitionContext)
