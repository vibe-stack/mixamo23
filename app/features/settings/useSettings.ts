'use client'

import { useCallback } from 'react'
import { useStore } from '@/app/store'
import type { EnvironmentSettings, ModelSettings } from '@/app/store'

export function useSettings() {
  const { environment, settings, setEnvironment, setSettings, model } = useStore()

  const updateEnvironment = useCallback(
    (updates: Partial<EnvironmentSettings>) => {
      setEnvironment(updates)
    },
    [setEnvironment]
  )

  const updateSettings = useCallback(
    (updates: Partial<ModelSettings>) => {
      setSettings(updates)
    },
    [setSettings]
  )

  const toggleInPlace = useCallback(() => {
    setSettings({ inPlaceAnimations: !settings.inPlaceAnimations })
  }, [settings.inPlaceAnimations, setSettings])

  const toggleRootBoneFix = useCallback(() => {
    setSettings({ applyRootBoneFix: !settings.applyRootBoneFix })
  }, [settings.applyRootBoneFix, setSettings])

  return {
    environment,
    settings,
    updateEnvironment,
    updateSettings,
    toggleInPlace,
    toggleRootBoneFix,
    hasModel: !!model,
  }
}
