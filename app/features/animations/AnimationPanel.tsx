'use client'

import { useAnimations } from './useAnimations'
import { AnimationList } from './AnimationList'

export function AnimationPanel() {
  const {
    animations,
    activeAnimationId,
    selectedCount,
    allSelected,
    setActiveAnimation,
    renameAnimation,
    removeAnimation,
    toggleAnimationSelection,
    selectAllAnimations,
    deselectAllAnimations,
  } = useAnimations()

  const hasAnimations = animations.length > 0

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-muted">
          Animations ({animations.length})
        </h2>
        {hasAnimations && (
          <span className="text-xs text-muted">
            {selectedCount} selected
          </span>
        )}
      </div>

      {hasAnimations && (
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={selectAllAnimations}
            disabled={allSelected}
            className={`
              flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors
              ${allSelected 
                ? 'bg-surface text-muted cursor-not-allowed' 
                : 'bg-surface hover:bg-surface-hover text-foreground'
              }
            `}
          >
            Select All
          </button>
          <button
            onClick={deselectAllAnimations}
            disabled={selectedCount === 0}
            className={`
              flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors
              ${selectedCount === 0 
                ? 'bg-surface text-muted cursor-not-allowed' 
                : 'bg-surface hover:bg-surface-hover text-foreground'
              }
            `}
          >
            Deselect All
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <AnimationList
          animations={animations}
          activeId={activeAnimationId}
          onSelect={setActiveAnimation}
          onToggleSelection={toggleAnimationSelection}
          onRename={renameAnimation}
          onRemove={removeAnimation}
        />
      </div>

      {hasAnimations && (
        <p className="text-xs text-muted mt-3 text-center">
          Double-click to rename • Checkbox = export
        </p>
      )}
    </div>
  )
}
