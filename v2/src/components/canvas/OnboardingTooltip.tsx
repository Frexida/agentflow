'use client'

import { useEffect, useState, useRef } from 'react'
import type { OnboardingStep } from '@/hooks/useOnboarding'

interface Props {
  step: OnboardingStep
  currentStep: number
  totalSteps: number
  onNext: () => void
  onSkip: () => void
}

export default function OnboardingTooltip({ step, currentStep, totalSteps, onNext, onSkip }: Props) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = document.querySelector(step.target)
    if (!el) {
      // If target not found, auto-advance
      const timer = setTimeout(onNext, 500)
      return () => clearTimeout(timer)
    }

    const rect = el.getBoundingClientRect()
    const tooltip = tooltipRef.current
    const tw = tooltip?.offsetWidth || 280
    const th = tooltip?.offsetHeight || 120

    let top = 0
    let left = 0

    switch (step.position) {
      case 'bottom':
        top = rect.bottom + 12
        left = rect.left + rect.width / 2 - tw / 2
        break
      case 'top':
        top = rect.top - th - 12
        left = rect.left + rect.width / 2 - tw / 2
        break
      case 'right':
        top = rect.top + rect.height / 2 - th / 2
        left = rect.right + 12
        break
      case 'left':
        top = rect.top + rect.height / 2 - th / 2
        left = rect.left - tw - 12
        break
    }

    // Clamp to viewport
    left = Math.max(8, Math.min(left, window.innerWidth - tw - 8))
    top = Math.max(8, Math.min(top, window.innerHeight - th - 8))

    setPos({ top, left })

    // Highlight target
    el.classList.add('onboarding-highlight')
    return () => el.classList.remove('onboarding-highlight')
  }, [step, onNext])

  if (!pos) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[9998] bg-black/40 pointer-events-auto" onClick={onSkip} />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-[9999] w-72 bg-[var(--surface-elevated)] border border-[var(--accent-bright)] rounded-lg p-4 shadow-xl shadow-[var(--accent-bright)]/10 pointer-events-auto animate-in fade-in"
        style={{ top: pos.top, left: pos.left }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[var(--accent-bright)] font-mono">
            {currentStep + 1}/{totalSteps}
          </span>
          <button
            onClick={onSkip}
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            Skip
          </button>
        </div>

        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">{step.title}</h3>
        <p className="text-xs text-[var(--text-secondary)] mb-3 leading-relaxed">{step.description}</p>

        <button
          onClick={onNext}
          className="w-full py-1.5 bg-[var(--accent-bright)] text-white text-xs font-medium rounded hover:brightness-110 transition-all"
        >
          {currentStep === totalSteps - 1 ? 'Get Started!' : 'Next →'}
        </button>
      </div>
    </>
  )
}
