'use client'

import { useCallback, useState } from 'react'
import { useStore } from '@/app/store'
import { loadFBX, generateId, getFileNameWithoutExtension } from '@/app/lib'
import type { AnimationData } from '@/app/store'

export function useUpload() {
  const { setModel, addAnimation, model } = useStore()
  const [isLoadingModel, setIsLoadingModel] = useState(false)
  const [isLoadingAnimations, setIsLoadingAnimations] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleModelUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return

      const file = files[0]
      if (!file.name.toLowerCase().endsWith('.fbx')) {
        setError('Please upload an FBX file')
        return
      }

      setIsLoadingModel(true)
      setError(null)

      try {
        const result = await loadFBX(file)
        const modelName = getFileNameWithoutExtension(file.name)
        setModel(result.scene, file, modelName)

        // Add any embedded animations from the base model
        result.animations.forEach((clip) => {
          // Use file name instead of clip.name (which is often "mixamo.com")
          const animName = getFileNameWithoutExtension(file.name)
          const animData: AnimationData = {
            id: generateId(),
            name: animName,
            clip: Object.assign(clip.clone(), { name: animName }),
            file,
            selected: true,
          }
          addAnimation(animData)
        })
      } catch (err) {
        setError('Failed to load FBX model')
        console.error(err)
      } finally {
        setIsLoadingModel(false)
      }
    },
    [setModel, addAnimation]
  )

  const handleAnimationsUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return

      if (!model) {
        setError('Please upload a base model first')
        return
      }

      setIsLoadingAnimations(true)
      setError(null)

      try {
        const fileArray = Array.from(files)

        for (const file of fileArray) {
          if (!file.name.toLowerCase().endsWith('.fbx')) continue

          const result = await loadFBX(file)

          result.animations.forEach((clip) => {
            // Use file name instead of clip.name (which is often "mixamo.com")
            const animName = getFileNameWithoutExtension(file.name)
            const animData: AnimationData = {
              id: generateId(),
              name: animName,
              clip: Object.assign(clip.clone(), { name: animName }),
              file,
              selected: true,
            }
            addAnimation(animData)
          })
        }
      } catch (err) {
        setError('Failed to load animation file(s)')
        console.error(err)
      } finally {
        setIsLoadingAnimations(false)
      }
    },
    [model, addAnimation]
  )

  const clearError = useCallback(() => setError(null), [])

  return {
    handleModelUpload,
    handleAnimationsUpload,
    isLoadingModel,
    isLoadingAnimations,
    error,
    clearError,
    hasModel: !!model,
  }
}
