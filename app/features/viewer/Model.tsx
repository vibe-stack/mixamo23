'use client'

import { useEffect, useRef } from 'react'
import { useAnimationPlayer } from './useAnimationPlayer'
import type { Group, AnimationClip } from 'three'
import { Box3, Vector3 } from 'three'

interface ModelProps {
  model: Group
  clip: AnimationClip | null
  isPlaying: boolean
  inPlace?: boolean
}

export function Model({ model, clip, isPlaying, inPlace = false }: ModelProps) {
  const groupRef = useRef<Group>(null)

  useAnimationPlayer({ model, clip, isPlaying, inPlace })

  useEffect(() => {
    if (!model) return

    // Center and scale model to fit view
    const box = new Box3().setFromObject(model)
    const center = box.getCenter(new Vector3())
    const size = box.getSize(new Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = 2 / maxDim

    model.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale)
    model.scale.setScalar(scale)
  }, [model])

  return <primitive ref={groupRef} object={model} />
}
