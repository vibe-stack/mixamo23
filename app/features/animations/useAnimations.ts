'use client'

import { useCallback, useMemo } from 'react'
import { useStore } from '@/app/store'

export function useAnimations() {
  const {
    animations,
    activeAnimationId,
    isPlaying,
    setActiveAnimation,
    setIsPlaying,
    renameAnimation,
    removeAnimation,
    toggleAnimationSelection,
    selectAllAnimations,
    deselectAllAnimations,
  } = useStore()

  const activeAnimation = animations.find((a) => a.id === activeAnimationId)

  const selectedCount = useMemo(
    () => animations.filter((a) => a.selected).length,
    [animations]
  )

  const allSelected = selectedCount === animations.length && animations.length > 0
  const noneSelected = selectedCount === 0

  const playAnimation = useCallback(
    (id: string) => {
      setActiveAnimation(id)
      setIsPlaying(true)
    },
    [setActiveAnimation, setIsPlaying]
  )

  const togglePlayback = useCallback(() => {
    setIsPlaying(!isPlaying)
  }, [isPlaying, setIsPlaying])

  const selectNext = useCallback(() => {
    if (animations.length === 0) return
    const currentIndex = animations.findIndex((a) => a.id === activeAnimationId)
    const nextIndex = (currentIndex + 1) % animations.length
    setActiveAnimation(animations[nextIndex].id)
  }, [animations, activeAnimationId, setActiveAnimation])

  const selectPrevious = useCallback(() => {
    if (animations.length === 0) return
    const currentIndex = animations.findIndex((a) => a.id === activeAnimationId)
    const prevIndex = currentIndex <= 0 ? animations.length - 1 : currentIndex - 1
    setActiveAnimation(animations[prevIndex].id)
  }, [animations, activeAnimationId, setActiveAnimation])

  return {
    animations,
    activeAnimation,
    activeAnimationId,
    isPlaying,
    selectedCount,
    allSelected,
    noneSelected,
    playAnimation,
    togglePlayback,
    selectNext,
    selectPrevious,
    renameAnimation,
    removeAnimation,
    setActiveAnimation,
    toggleAnimationSelection,
    selectAllAnimations,
    deselectAllAnimations,
  }
}
