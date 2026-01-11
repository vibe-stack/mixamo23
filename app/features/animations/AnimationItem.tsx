'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Check } from 'lucide-react'

interface AnimationItemProps {
  id: string
  name: string
  isActive: boolean
  isSelected: boolean
  onSelect: () => void
  onToggleSelection: () => void
  onRename: (id: string, name: string) => void
  onRemove: (id: string) => void
}

export function AnimationItem({
  id,
  name,
  isActive,
  isSelected,
  onSelect,
  onToggleSelection,
  onRename,
  onRemove,
}: AnimationItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(true)
  }, [])

  const handleSubmit = useCallback(() => {
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== name) {
      onRename(id, trimmed)
    } else {
      setEditValue(name)
    }
    setIsEditing(false)
  }, [editValue, name, id, onRename])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSubmit()
      } else if (e.key === 'Escape') {
        setEditValue(name)
        setIsEditing(false)
      }
    },
    [handleSubmit, name]
  )

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onRemove(id)
    },
    [id, onRemove]
  )

  const handleCheckboxClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onToggleSelection()
    },
    [onToggleSelection]
  )

  return (
    <div
      onClick={onSelect}
      className={`
        group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer
        transition-colors duration-150
        ${isActive ? 'bg-emerald-muted/30 text-emerald' : 'hover:bg-surface-hover text-foreground'}
      `}
    >
      {/* Selection checkbox */}
      <button
        onClick={handleCheckboxClick}
        className={`
          w-4 h-4 rounded flex items-center justify-center shrink-0
          transition-colors border
          ${isSelected 
            ? 'bg-emerald border-emerald text-white' 
            : 'border-muted hover:border-foreground'
          }
        `}
        title={isSelected ? 'Deselect for export' : 'Select for export'}
      >
        {isSelected && <Check size={12} strokeWidth={3} />}
      </button>

      <span className={`text-xs ${isActive ? 'text-emerald' : 'text-muted'}`}>
        {isActive ? '▶' : '○'}
      </span>

      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={handleKeyDown}
          className="flex-1 text-sm bg-surface px-2 py-0.5 rounded"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span
          onDoubleClick={handleDoubleClick}
          className="flex-1 text-sm truncate"
          title={name}
        >
          {name}
        </span>
      )}

      <button
        onClick={handleRemove}
        className="opacity-0 group-hover:opacity-100 text-muted hover:text-red-400 transition-opacity text-xs"
        title="Remove animation"
      >
        ✕
      </button>
    </div>
  )
}
