'use client'

import { useCallback, useState } from 'react'
import { useStore } from '@/app/store'
import { adaptAnimationToModelBasis, loadFBX, loadGLB, generateId, getFileNameWithoutExtension } from '@/app/lib'
import type { AnimationData } from '@/app/store'
import type { AnimationClip } from 'three'

const MODEL_EXTENSIONS = ['.fbx', '.glb'] as const

function getFileExtension(filename: string): string {
  const extensionIndex = filename.lastIndexOf('.')
  if (extensionIndex === -1) return ''
  return filename.toLowerCase().slice(extensionIndex)
}

function isSupportedModelFile(filename: string): boolean {
  return MODEL_EXTENSIONS.includes(getFileExtension(filename) as (typeof MODEL_EXTENSIONS)[number])
}

function isGLBFile(filename: string): boolean {
  return getFileExtension(filename) === '.glb'
}

async function loadModelFile(file: File) {
  return getFileExtension(file.name) === '.glb' ? loadGLB(file) : loadFBX(file)
}

export function useUpload() {
  const { setModel, addAnimation, model, file: modelFile } = useStore()
  const [isLoadingModel, setIsLoadingModel] = useState(false)
  const [isLoadingAnimations, setIsLoadingAnimations] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleModelUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return

      const file = files[0]
      if (!isSupportedModelFile(file.name)) {
        setError('Please upload an FBX or GLB file')
        return
      }

      setIsLoadingModel(true)
      setError(null)

      try {
        const result = await loadModelFile(file)
        const modelName = getFileNameWithoutExtension(file.name)
        setModel(result.scene, file, modelName)

        // Add any embedded animations from the base model
        result.animations.forEach((clip: AnimationClip) => {
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
        setError('Failed to load model file')
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
          const shouldAdaptToModelBasis = !!model && !!modelFile && isGLBFile(modelFile.name)

          result.animations.forEach((clip) => {
            // Use file name instead of clip.name (which is often "mixamo.com")
            const animName = getFileNameWithoutExtension(file.name)
            const adaptedClip = shouldAdaptToModelBasis && model
              ? adaptAnimationToModelBasis(clip, model)
              : clip
            const animData: AnimationData = {
              id: generateId(),
              name: animName,
              clip: Object.assign(adaptedClip.clone(), { name: animName }),
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
    [model, modelFile, addAnimation]
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
