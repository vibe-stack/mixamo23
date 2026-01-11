'use client'

import { useExport } from './useExport'

export function ExportPanel() {
  const {
    exportBundled,
    exportSeparate,
    exportAnimationsOnly,
    isExporting,
    error,
    clearError,
    canExport,
    hasSelectedAnimations,
    selectedAnimationCount,
    totalAnimationCount,
  } = useExport()

  const canExportWithAnimations = canExport && hasSelectedAnimations

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-medium text-muted">Export</h2>

      <div className="space-y-2">
        <button
          onClick={exportBundled}
          disabled={!canExportWithAnimations || isExporting}
          className={`
            w-full py-3 px-4 rounded-xl text-sm font-medium transition-colors
            ${
              canExportWithAnimations && !isExporting
                ? 'bg-emerald hover:bg-emerald-hover text-white'
                : 'bg-surface text-muted cursor-not-allowed'
            }
          `}
        >
          {isExporting ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner />
              Exporting...
            </span>
          ) : (
            'Export Bundled GLB'
          )}
        </button>
        <p className="text-xs text-muted text-center">
          Single file with model + {selectedAnimationCount} animation{selectedAnimationCount !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="space-y-2">
        <button
          onClick={exportSeparate}
          disabled={!canExportWithAnimations || isExporting}
          className={`
            w-full py-3 px-4 rounded-xl text-sm font-medium transition-colors
            ${
              canExportWithAnimations && !isExporting
                ? 'bg-surface hover:bg-surface-hover text-foreground'
                : 'bg-surface text-muted cursor-not-allowed'
            }
          `}
        >
          Export Separate (ZIP)
        </button>
        <p className="text-xs text-muted text-center">
          Model + {selectedAnimationCount} animation file{selectedAnimationCount !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="h-px bg-surface-hover" />

      <div className="space-y-2">
        <button
          onClick={exportAnimationsOnly}
          disabled={!canExportWithAnimations || isExporting}
          className={`
            w-full py-3 px-4 rounded-xl text-sm font-medium transition-colors
            ${
              canExportWithAnimations && !isExporting
                ? 'bg-surface hover:bg-surface-hover text-foreground'
                : 'bg-surface text-muted cursor-not-allowed'
            }
          `}
        >
          Export Animations Only (ZIP)
        </button>
        <p className="text-xs text-muted text-center">
          {selectedAnimationCount} animation{selectedAnimationCount !== 1 ? 's' : ''} without model
        </p>
      </div>

      {error && (
        <div
          onClick={clearError}
          className="p-3 rounded-lg bg-red-500/10 text-red-400 text-sm cursor-pointer"
        >
          {error}
        </div>
      )}

      {!canExport && (
        <p className="text-xs text-muted text-center py-2">
          Upload a model to enable export
        </p>
      )}

      {canExport && !hasSelectedAnimations && (
        <p className="text-xs text-amber-400 text-center py-2">
          Select animations to export
        </p>
      )}
    </div>
  )
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
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