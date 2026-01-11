'use client'

import { create } from 'zustand'
import type { ModelStore, AnimationData, EnvironmentSettings, ModelSettings, PlaybackState } from './types'

const initialEnvironment: EnvironmentSettings = {
  showGrid: true,
  ambientIntensity: 0.5,
  directionalIntensity: 1.0,
  environmentPreset: 'studio',
  showEnvironment: true,
  backgroundColor: '#0f0f0f',
}

const initialSettings: ModelSettings = {
  inPlaceAnimations: false,
  applyRootBoneFix: false,
  replaceWhitespaceWithUnderscore: false,
  lowercaseFilenames: false,
}

const initialPlayback: PlaybackState = {
  currentTime: 0,
  duration: 0,
  currentFrame: 0,
  totalFrames: 0,
}

const initialState = {
  model: null,
  modelName: null,
  file: null,
  animations: [] as AnimationData[],
  activeAnimationId: null,
  isPlaying: false,
  playback: initialPlayback,
  useBasePoseFromFrame: false,
  basePoseFrame: 0,
  environment: initialEnvironment,
  settings: initialSettings,
}

export const useStore = create<ModelStore>((set) => ({
  ...initialState,

  setModel: (model, file, name) => set({ model, file, modelName: name }),

  addAnimation: (animation) =>
    set((state) => ({
      animations: [...state.animations, { ...animation, selected: true }],
      activeAnimationId: state.activeAnimationId ?? animation.id,
    })),

  removeAnimation: (id) =>
    set((state) => ({
      animations: state.animations.filter((a) => a.id !== id),
      activeAnimationId:
        state.activeAnimationId === id
          ? state.animations[0]?.id ?? null
          : state.activeAnimationId,
    })),

  renameAnimation: (id, name) =>
    set((state) => ({
      animations: state.animations.map((a) =>
        a.id === id ? { ...a, name, clip: Object.assign(a.clip.clone(), { name }) } : a
      ),
    })),

  setActiveAnimation: (id) => set({ activeAnimationId: id }),

  setIsPlaying: (isPlaying) => set({ isPlaying }),

  setPlayback: (playback) =>
    set((state) => ({
      playback: { ...state.playback, ...playback },
    })),

  seekToTime: (time) =>
    set((state) => ({
      playback: { 
        ...state.playback, 
        currentTime: time,
        currentFrame: state.playback.duration > 0 
          ? Math.round((time / state.playback.duration) * state.playback.totalFrames)
          : 0,
      },
    })),

  toggleAnimationSelection: (id) =>
    set((state) => ({
      animations: state.animations.map((a) =>
        a.id === id ? { ...a, selected: !a.selected } : a
      ),
    })),

  selectAllAnimations: () =>
    set((state) => ({
      animations: state.animations.map((a) => ({ ...a, selected: true })),
    })),

  deselectAllAnimations: () =>
    set((state) => ({
      animations: state.animations.map((a) => ({ ...a, selected: false })),
    })),

  setUseBasePoseFromFrame: (use) => set({ useBasePoseFromFrame: use }),

  setBasePoseFrame: (frame) => set({ basePoseFrame: frame }),

  setEnvironment: (settings) =>
    set((state) => ({
      environment: { ...state.environment, ...settings },
    })),

  setSettings: (settings) =>
    set((state) => ({
      settings: { ...state.settings, ...settings },
    })),

  reset: () => set(initialState),
}))
