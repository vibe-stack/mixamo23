'use client'

interface ToggleProps {
  label: string
  checked: boolean
  onChange: () => void
  disabled?: boolean
  description?: string
}

export function Toggle({ label, checked, onChange, disabled, description }: ToggleProps) {
  return (
    <label className={`flex items-start gap-3 cursor-pointer ${disabled ? 'opacity-50' : ''}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={onChange}
        className={`
          relative mt-0.5 w-9 h-5 rounded-full transition-colors duration-200
          ${checked ? 'bg-emerald' : 'bg-surface-hover'}
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span
          className={`
            absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white
            transition-transform duration-200
            ${checked ? 'translate-x-4' : 'translate-x-0'}
          `}
        />
      </button>
      <div className="flex-1">
        <span className="text-sm text-foreground">{label}</span>
        {description && (
          <p className="text-xs text-muted mt-0.5">{description}</p>
        )}
      </div>
    </label>
  )
}
