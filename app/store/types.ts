import type { Group, AnimationClip } from 'three'

export interface AnimationData {
  id: string
  name: string
  clip: AnimationClip
  file: File
  selected: boolean
}

export interface EnvironmentSettings {
  showGrid: boolean
  ambientIntensity: number
  directionalIntensity: number
  environmentPreset: 'studio' | 'sunset' | 'dawn' | 'night' | 'warehouse' | 'forest' | 'apartment' | 'city' | 'park' | 'lobby' | 'none'
  showEnvironment: boolean
  backgroundColor: string
}

export interface ModelSettings {
  inPlaceAnimations: boolean
  applyRootBoneFix: boolean
  replaceWhitespaceWithUnderscore: boolean
  lowercaseFilenames: boolean
}

export interface PlaybackState {
  currentTime: number
  duration: number
  currentFrame: number
  totalFrames: number
}

export interface ModelState {
  model: Group | null
  modelName: string | null
  file: File | null
  animations: AnimationData[]
  activeAnimationId: string | null
  isPlaying: boolean
  playback: PlaybackState
  useBasePoseFromFrame: boolean
  basePoseFrame: number
  environment: EnvironmentSettings
  settings: ModelSettings
}

export interface ModelActions {
  setModel: (model: Group | null, file: File | null, name: string | null) => void
  addAnimation: (animation: AnimationData) => void
  removeAnimation: (id: string) => void
  renameAnimation: (id: string, name: string) => void
  setActiveAnimation: (id: string | null) => void
  setIsPlaying: (isPlaying: boolean) => void
  setPlayback: (playback: Partial<PlaybackState>) => void
  seekToTime: (time: number) => void
  toggleAnimationSelection: (id: string) => void
  selectAllAnimations: () => void
  deselectAllAnimations: () => void
  setUseBasePoseFromFrame: (use: boolean) => void
  setBasePoseFrame: (frame: number) => void
  setEnvironment: (settings: Partial<EnvironmentSettings>) => void
  setSettings: (settings: Partial<ModelSettings>) => void
  reset: () => void
}

export type ModelStore = ModelState & ModelActions
