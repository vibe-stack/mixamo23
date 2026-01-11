'use client'

import { AnimationItem } from './AnimationItem'
import type { AnimationData } from '@/app/store'

interface AnimationListProps {
  animations: AnimationData[]
  activeId: string | null
  onSelect: (id: string) => void
  onToggleSelection: (id: string) => void
  onRename: (id: string, name: string) => void
  onRemove: (id: string) => void
}

export function AnimationList({
  animations,
  activeId,
  onSelect,
  onToggleSelection,
  onRename,
  onRemove,
}: AnimationListProps) {
  if (animations.length === 0) {
    return (
      <div className="text-center py-8 text-muted text-sm">
        <p>No animations loaded</p>
        <p className="text-xs mt-1">Upload animation FBX files</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {animations.map((anim) => (
        <AnimationItem
          key={anim.id}
          id={anim.id}
          name={anim.name}
          isActive={anim.id === activeId}
          isSelected={anim.selected}
          onSelect={() => onSelect(anim.id)}
          onToggleSelection={() => onToggleSelection(anim.id)}
          onRename={onRename}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
}
