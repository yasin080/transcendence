import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { useNavigate, useSearchParams } from 'react-router'

import AnimatedWorm from '../components/AnimatedWorm'
import AuthModal from '../components/AuthModal'
import Button from '../components/ui/Button'
import { useAuth } from '../auth/useAuth'
import './landing.css'

const OAUTH_ERROR_MESSAGE = 'Could not sign in with Google. Please try again.'

export default function Landing() {
  const { user, status } = useAuth()
  const navigate = useNavigate()
  const sceneRef = useRef<HTMLDivElement>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const [modalOpen, setModalOpen] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    if (searchParams.get('error') !== 'oauth') return

    setAuthError(OAUTH_ERROR_MESSAGE)
    setModalOpen(true)
    setSearchParams(
      (params) => {
        params.delete('error')
        return params
      },
      { replace: true },
    )
  }, [searchParams, setSearchParams])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const onMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 2
      const y = (event.clientY / window.innerHeight - 0.5) * 2
      sceneRef.current?.style.setProperty('--pointer-x', `${x}px`)
      sceneRef.current?.style.setProperty('--pointer-y', `${y}px`)
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  function playNow() {
    if (status === 'authenticated' && user) {
      void navigate('/lobby')
      return
    }
    setModalOpen(true)
  }

  return (
    <div ref={sceneRef} className="landing" style={{ '--pointer-x': '0px', '--pointer-y': '0px' } as CSSProperties}>
      <div className="landing__backdrop" aria-hidden="true">
        <div className="landing__arena" />
        <div className="landing__shade" />
        <div className="landing__atmosphere" />
      </div>

      <main className="landing__hero">
        <section className="landing__copy" aria-labelledby="landing-title">

          <h1
            id="landing-title"
            className="display-hero uppercase text-[clamp(3rem,6.5vw,7.5rem)] max-[800px]:text-[clamp(2.75rem,13vw,5.5rem)]"
          >
            <span>Small worm.</span>
            <span>Big boom.</span>
          </h1>

          <Button className="mt-10 animate-boom-pulse max-[800px]:-mt-16" onClick={playNow}>
            <span aria-hidden="true" className="mr-3">▶</span>
            Play now
          </Button>

        </section>

        <div className="landing__worm-stage" aria-hidden="true">
          <div className="landing__worm-aura" />
          <AnimatedWorm variant="hero" />
        </div>
      </main>
      {modalOpen && (
        <AuthModal
          initialMessage={authError}
          onClose={() => {
            setModalOpen(false)
            setAuthError(null)
          }}
        />
      )}
    </div>
  )
}
