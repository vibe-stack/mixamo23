'use client'

import { useCallback, useRef, useState } from 'react'

interface DropZoneProps {
  onDrop: (files: FileList | null) => void
  accept?: string
  multiple?: boolean
  disabled?: boolean
  children: React.ReactNode
  className?: string
}

export function DropZone({
  onDrop,
  accept = '.fbx',
  multiple = false,
  disabled = false,
  children,
  className = '',
}: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      if (disabled) return
      onDrop(e.dataTransfer.files)
    },
    [disabled, onDrop]
  )

  const handleClick = useCallback(() => {
    if (disabled) return
    inputRef.current?.click()
  }, [disabled])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onDrop(e.target.files)
      e.target.value = ''
    },
    [onDrop]
  )

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative cursor-pointer transition-colors duration-200
        ${isDragging ? 'bg-emerald-muted/20' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
      />
      {children}
    </div>
  )
}
