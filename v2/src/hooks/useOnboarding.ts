'use client'

import { useState, useEffect, useCallback } from 'react'

export interface OnboardingStep {
  id: string
  target: string // CSS selector
  title: string
  description: string
  position: 'top' | 'bottom' | 'left' | 'right'
}

const ONBOARDING_KEY = 'agentflow:onboarding-complete'

const STEPS: OnboardingStep[] = [
  {
    id: 'add-agent',
    target: '[title="Add Agent"]',
    title: 'Add Agents',
    description: 'Click here to add AI agents to your organization.',
    position: 'bottom',
  },
  {
    id: 'connect',
    target: '[title="Auto Layout"]',
    title: 'Connect & Organize',
    description: 'Drag from one agent\'s handle to another to create connections. Use Auto Layout to arrange.',
    position: 'bottom',
  },
  {
    id: 'save',
    target: '[title="Save"], [title="Saving..."]',
    title: 'Save Your Work',
    description: 'Save to the cloud with Ctrl+S or click here.',
    position: 'bottom',
  },
  {
    id: 'export',
    target: '[title="Export / Import"]',
    title: 'Export Config',
    description: 'Export your organization as OpenClaw YAML config — ready to deploy.',
    position: 'bottom',
  },
]

export function useOnboarding() {
  const [currentStep, setCurrentStep] = useState(-1)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    // Check if onboarding already completed
    if (typeof window === 'undefined') return
    const done = localStorage.getItem(ONBOARDING_KEY)
    if (!done) {
      // Delay start to let UI render
      const timer = setTimeout(() => {
        setCurrentStep(0)
        setIsActive(true)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const next = useCallback(() => {
    if (currentStep >= STEPS.length - 1) {
      setIsActive(false)
      setCurrentStep(-1)
      localStorage.setItem(ONBOARDING_KEY, 'true')
    } else {
      setCurrentStep((s) => s + 1)
    }
  }, [currentStep])

  const skip = useCallback(() => {
    setIsActive(false)
    setCurrentStep(-1)
    localStorage.setItem(ONBOARDING_KEY, 'true')
  }, [])

  const restart = useCallback(() => {
    localStorage.removeItem(ONBOARDING_KEY)
    setCurrentStep(0)
    setIsActive(true)
  }, [])

  const step = isActive && currentStep >= 0 ? STEPS[currentStep] : null

  return {
    isActive,
    step,
    currentStep,
    totalSteps: STEPS.length,
    next,
    skip,
    restart,
  }
}
