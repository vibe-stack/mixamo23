'use client'

import { useCallback, useState, useMemo } from 'react'
import { useStore } from '@/app/store'
import JSZip from 'jszip'
import { 
  exportToGLB,
  exportAnimationGLB,
  formatFileName,
  makeAnimationInPlace,
  downloadBlob,
} from '@/app/lib'
import type { AnimationClip } from 'three'

export function useExport() {
  const { model, animations, settings } = useStore()
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get only selected animations
  const selectedAnimations = useMemo(
    () => animations.filter((a) => a.selected),
    [animations]
  )

  // Format filename based on export settings
  const formatExportFileName = useCallback((name: string): string => {
    return formatFileName(name, {
      replaceWhitespace: settings.replaceWhitespaceWithUnderscore,
      lowercase: settings.lowercaseFilenames,
    })
  }, [settings.replaceWhitespaceWithUnderscore, settings.lowercaseFilenames])

  // Process animations based on settings (in-place only, no cloning)
  const getProcessedClips = useCallback((animList: typeof animations): AnimationClip[] => {
    return animList.map((a) => {
      if (settings.inPlaceAnimations) {
        return makeAnimationInPlace(a.clip)
      }
      return a.clip
    })
  }, [settings.inPlaceAnimations])

  const exportBundled = useCallback(async () => {
    if (!model) {
      setError('No model loaded')
      return
    }

    if (selectedAnimations.length === 0) {
      setError('No animations selected for export')
      return
    }

    setIsExporting(true)
    setError(null)

    try {
      const selectedClips = getProcessedClips(selectedAnimations)
      const filename = formatExportFileName('model.glb')
      
      // Export the original model directly (cloning breaks skeleton bindings)
      // Base pose feature would require more complex skeleton rebinding - disabled for now
      const buffer = await exportToGLB(model, { binary: true, animations: selectedClips })
      downloadBlob(buffer, filename)
    } catch (err) {
      setError('Failed to export bundled GLB')
      console.error(err)
    } finally {
      setIsExporting(false)
    }
  }, [model, selectedAnimations, getProcessedClips, formatExportFileName])

  const exportSeparate = useCallback(async () => {
    if (!model) {
      setError('No model loaded')
      return
    }

    if (selectedAnimations.length === 0) {
      setError('No animations selected for export')
      return
    }

    setIsExporting(true)
    setError(null)

    try {
      const zip = new JSZip()
      const processedClips = getProcessedClips(selectedAnimations)

      // Export base model with full mesh but no animations
      // Use original model directly (cloning breaks skeleton bindings)
      const modelFilename = formatExportFileName('model.glb')
      const modelBuffer = await exportToGLB(model, {
        binary: true,
        animations: [],
      })
      zip.file(modelFilename, modelBuffer)

      // Export each selected animation as armature-only GLB (no mesh, just bones + animation)
      for (let i = 0; i < selectedAnimations.length; i++) {
        try {
          const buffer = await exportAnimationGLB(model, processedClips[i])
          const animFilename = formatExportFileName(`${selectedAnimations[i].name}.glb`)
          zip.file(animFilename, buffer)
        } catch (animErr) {
          console.error(`Failed to export animation ${selectedAnimations[i].name}:`, animErr)
          // Don't fall back to full model - that defeats the purpose
          // Instead, skip this animation and continue
          setError(`Warning: Failed to export animation "${selectedAnimations[i].name}"`)
        }
      }

      // Generate and download the zip file with streaming to avoid memory issues
      const zipBlob = await zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
        streamFiles: true
      })
      const zipFilename = formatExportFileName('export.zip')
      const url = URL.createObjectURL(zipBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = zipFilename
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError('Failed to export separate GLB files')
      console.error(err)
    } finally {
      setIsExporting(false)
    }
  }, [model, selectedAnimations, getProcessedClips, formatExportFileName])

  // Export only animations (no model) as separate GLBs in a ZIP
  const exportAnimationsOnly = useCallback(async () => {
    if (!model) {
      setError('No model loaded (needed for armature reference)')
      return
    }

    if (selectedAnimations.length === 0) {
      setError('No animations selected for export')
      return
    }

    setIsExporting(true)
    setError(null)

    try {
      const zip = new JSZip()
      const processedClips = getProcessedClips(selectedAnimations)

      // Export each selected animation as armature-only GLB
      for (let i = 0; i < selectedAnimations.length; i++) {
        try {
          const buffer = await exportAnimationGLB(model, processedClips[i])
          const animFilename = formatExportFileName(`${selectedAnimations[i].name}.glb`)
          zip.file(animFilename, buffer)
        } catch (animErr) {
          console.error(`Failed to export animation ${selectedAnimations[i].name}:`, animErr)
          setError(`Warning: Failed to export animation "${selectedAnimations[i].name}"`)
        }
      }

      // Generate and download the zip file
      const zipBlob = await zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
        streamFiles: true
      })
      const zipFilename = formatExportFileName('animations.zip')
      const url = URL.createObjectURL(zipBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = zipFilename
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError('Failed to export animations')
      console.error(err)
    } finally {
      setIsExporting(false)
    }
  }, [model, selectedAnimations, getProcessedClips, formatExportFileName])

  const clearError = useCallback(() => setError(null), [])

  return {
    exportBundled,
    exportSeparate,
    exportAnimationsOnly,
    isExporting,
    error,
    clearError,
    canExport: !!model,
    hasSelectedAnimations: selectedAnimations.length > 0,
    selectedAnimationCount: selectedAnimations.length,
    totalAnimationCount: animations.length,
    settings,
  }
}
