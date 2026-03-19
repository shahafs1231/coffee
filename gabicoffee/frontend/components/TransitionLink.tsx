'use client'
import { usePageTransition } from '@/context/TransitionContext'
import { usePathname } from 'next/navigation'

interface Props {
  href: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export default function TransitionLink({ href, children, className, onClick }: Props) {
  const { navigate, phase } = usePageTransition()
  const pathname = usePathname()

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()
    if (onClick) onClick()
    if (pathname === href || phase !== 'idle') return
    navigate(href)
  }

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  )
}
