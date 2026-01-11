'use client'

import { useUpload } from './useUpload'
import { DropZone } from './DropZone'

export function UploadPanel() {
  const {
    handleModelUpload,
    handleAnimationsUpload,
    isLoadingModel,
    isLoadingAnimations,
    error,
    clearError,
    hasModel,
  } = useUpload()

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-medium text-muted mb-2">Base Model</h2>
        <DropZone
          onDrop={handleModelUpload}
          disabled={isLoadingModel}
          className="p-6 rounded-xl bg-surface hover:bg-surface-hover text-center"
        >
          {isLoadingModel ? (
            <div className="flex items-center justify-center gap-2">
              <Spinner />
              <span className="text-sm text-muted">Loading model...</span>
            </div>
          ) : hasModel ? (
            <div className="text-sm">
              <span className="text-emerald">✓</span>
              <span className="text-muted ml-2">Model loaded</span>
              <p className="text-xs text-muted mt-1">Drop to replace</p>
            </div>
          ) : (
            <div className="text-sm text-muted">
              <p>Drop rigged FBX here</p>
              <p className="text-xs mt-1">or click to browse</p>
            </div>
          )}
        </DropZone>
      </div>

      <div>
        <h2 className="text-sm font-medium text-muted mb-2">Animations</h2>
        <DropZone
          onDrop={handleAnimationsUpload}
          multiple
          disabled={!hasModel || isLoadingAnimations}
          className="p-6 rounded-xl bg-surface hover:bg-surface-hover text-center"
        >
          {isLoadingAnimations ? (
            <div className="flex items-center justify-center gap-2">
              <Spinner />
              <span className="text-sm text-muted">Loading animations...</span>
            </div>
          ) : (
            <div className="text-sm text-muted">
              <p>Drop animation FBX files</p>
              <p className="text-xs mt-1">
                {hasModel ? 'Multiple files supported' : 'Upload base model first'}
              </p>
            </div>
          )}
        </DropZone>
      </div>

      {error && (
        <div
          onClick={clearError}
          className="p-3 rounded-lg bg-red-500/10 text-red-400 text-sm cursor-pointer"
        >
          {error}
        </div>
      )}
    </div>
  )
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 text-emerald"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}
