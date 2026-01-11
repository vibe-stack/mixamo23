'use client'

import { useEffect, useRef, useMemo, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { AnimationMixer, VectorKeyframeTrack } from 'three'
import type { Group, AnimationClip, AnimationAction, KeyframeTrack } from 'three'
import { useStore } from '@/app/store'

interface UseAnimationPlayerProps {
  model: Group | null
  clip: AnimationClip | null
  isPlaying: boolean
  inPlace?: boolean
}

// Standard animation framerate for frame counting
const ANIMATION_FPS = 30

// Convert animation to in-place by removing root motion
function makeInPlace(clip: AnimationClip): AnimationClip {
  const inPlaceClip = clip.clone()
  
  // Common root bone names in Mixamo rigs
  const rootBoneNames = ['mixamorigHips', 'Hips', 'mixamorig:Hips', 'Root', 'root']
  
  inPlaceClip.tracks = inPlaceClip.tracks.map((track: KeyframeTrack) => {
    // Check if this track affects a root bone position
    const isRootPositionTrack = rootBoneNames.some(
      (name) => track.name.includes(name) && track.name.endsWith('.position')
    )
    
    if (isRootPositionTrack && track instanceof VectorKeyframeTrack) {
      // Zero out X and Z movement, keep Y for up/down motion
      const values = track.values.slice()
      for (let i = 0; i < values.length; i += 3) {
        values[i] = 0     // X
        // values[i + 1] stays the same (Y - vertical)
        values[i + 2] = 0 // Z
      }
      return new VectorKeyframeTrack(track.name, Array.from(track.times), Array.from(values))
    }
    
    return track
  })
  
  return inPlaceClip
}

export function useAnimationPlayer({ model, clip, isPlaying, inPlace = false }: UseAnimationPlayerProps) {
  const mixerRef = useRef<AnimationMixer | null>(null)
  const actionRef = useRef<AnimationAction | null>(null)
  const { setPlayback, seekToTime, playback } = useStore()
  const seekTimeRef = useRef<number | null>(null)

  // Process clip for in-place if needed
  const processedClip = useMemo(() => {
    if (!clip) return null
    if (inPlace) return makeInPlace(clip)
    return clip
  }, [clip, inPlace])

  // Watch for external seek requests
  useEffect(() => {
    if (playback.currentTime !== seekTimeRef.current) {
      seekTimeRef.current = playback.currentTime
      if (actionRef.current && mixerRef.current) {
        actionRef.current.time = playback.currentTime
        // Update the mixer to reflect the new time
        mixerRef.current.update(0)
      }
    }
  }, [playback.currentTime])

  useEffect(() => {
    if (!model) {
      mixerRef.current = null
      actionRef.current = null
      return
    }

    mixerRef.current = new AnimationMixer(model)

    return () => {
      mixerRef.current?.stopAllAction()
      mixerRef.current = null
      actionRef.current = null
    }
  }, [model])

  useEffect(() => {
    if (!mixerRef.current || !processedClip) {
      if (actionRef.current) {
        actionRef.current.stop()
        actionRef.current = null
      }
      // Reset playback when no clip
      setPlayback({
        currentTime: 0,
        duration: 0,
        currentFrame: 0,
        totalFrames: 0,
      })
      return
    }

    mixerRef.current.stopAllAction()

    const action = mixerRef.current.clipAction(processedClip)
    actionRef.current = action
    action.reset()

    // Update playback info for new clip
    const duration = processedClip.duration
    const totalFrames = Math.ceil(duration * ANIMATION_FPS)
    setPlayback({
      currentTime: 0,
      duration,
      currentFrame: 0,
      totalFrames,
    })

    if (isPlaying) {
      action.play()
    }
  }, [processedClip, setPlayback])

  useEffect(() => {
    if (!actionRef.current) return

    if (isPlaying) {
      actionRef.current.paused = false
      actionRef.current.play()
    } else {
      actionRef.current.paused = true
    }
  }, [isPlaying])

  useFrame((_, delta) => {
    if (mixerRef.current && actionRef.current) {
      if (isPlaying) {
        mixerRef.current.update(delta)
      }
      
      // Update playback state with current time
      const currentTime = actionRef.current.time
      const duration = processedClip?.duration || 1
      const currentFrame = Math.floor(currentTime * ANIMATION_FPS)
      
      // Only update if time has changed significantly to avoid unnecessary re-renders
      if (Math.abs(currentTime - seekTimeRef.current!) > 0.01) {
        seekTimeRef.current = currentTime
        setPlayback({
          currentTime,
          currentFrame,
        })
      }
    }
  })

  // Return seek function for external control
  const seek = useCallback((time: number) => {
    seekToTime(time)
  }, [seekToTime])

  return { seek }
}
