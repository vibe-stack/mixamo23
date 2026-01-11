'use client'

import { useMemo } from 'react'
import { useStore } from '@/app/store'

export function useViewer() {
  const { model, animations, activeAnimationId, isPlaying, environment, settings } = useStore()

  const activeClip = useMemo(() => {
    if (!activeAnimationId) return null
    const anim = animations.find((a) => a.id === activeAnimationId)
    return anim?.clip ?? null
  }, [animations, activeAnimationId])

  return {
    model,
    activeClip,
    isPlaying,
    hasModel: !!model,
    environment,
    settings,
  }
}
