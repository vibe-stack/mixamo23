'use client'

import { useStore } from '@/app/store'
import { useAnimations } from '../animations/useAnimations'
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react'

export function ViewerControls() {
  const {
    playback,
    isPlaying,
    setIsPlaying,
    seekToTime,
    activeAnimationId,
  } = useStore()

  const {
    selectNext,
    selectPrevious,
    animations,
  } = useAnimations()

  const hasAnimation = activeAnimationId !== null && animations.length > 0

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    seekToTime(value)
  }

  const formatTime = (time: number) => {
    const seconds = Math.floor(time)
    const ms = Math.floor((time - seconds) * 100)
    return `${seconds}.${ms.toString().padStart(2, '0')}s`
  }

  if (!hasAnimation) {
    return null
  }

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-surface/90 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-lg">
      {/* Previous */}
      <button
        onClick={selectPrevious}
        className="p-2 rounded-lg hover:bg-surface-hover text-muted hover:text-foreground transition-colors"
        title="Previous animation"
      >
        <SkipBack size={18} />
      </button>

      {/* Play/Pause */}
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="p-3 rounded-xl bg-emerald hover:bg-emerald-hover text-white transition-colors"
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>

      {/* Next */}
      <button
        onClick={selectNext}
        className="p-2 rounded-lg hover:bg-surface-hover text-muted hover:text-foreground transition-colors"
        title="Next animation"
      >
        <SkipForward size={18} />
      </button>

      {/* Divider */}
      <div className="w-px h-8 bg-surface-hover" />

      {/* Time display */}
      <div className="text-xs text-muted w-16 text-right font-mono">
        {formatTime(playback.currentTime)}
      </div>

      {/* Timeline slider */}
      <input
        type="range"
        min={0}
        max={playback.duration || 1}
        step={0.001}
        value={playback.currentTime}
        onChange={handleSliderChange}
        className="w-48 h-2 bg-surface-hover rounded-lg appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:bg-emerald
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:hover:bg-emerald-hover
          [&::-webkit-slider-thumb]:transition-colors"
      />

      {/* Duration */}
      <div className="text-xs text-muted w-16 font-mono">
        {formatTime(playback.duration)}
      </div>

      {/* Frame counter */}
      <div className="text-xs text-muted font-mono">
        F{playback.currentFrame}/{playback.totalFrames}
      </div>
    </div>
  )
}