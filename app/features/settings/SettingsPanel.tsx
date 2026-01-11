'use client'

import { useSettings } from './useSettings'
import { Toggle } from './Toggle'
import { Slider } from './Slider'
import { Select } from './Select'

const ENVIRONMENT_PRESETS = [
  { value: 'none', label: 'None' },
  { value: 'studio', label: 'Studio' },
  { value: 'sunset', label: 'Sunset' },
  { value: 'dawn', label: 'Dawn' },
  { value: 'night', label: 'Night' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'forest', label: 'Forest' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'city', label: 'City' },
  { value: 'park', label: 'Park' },
  { value: 'lobby', label: 'Lobby' },
]

export function SettingsPanel() {
  const {
    environment,
    settings,
    updateEnvironment,
    updateSettings,
    toggleInPlace,
    toggleRootBoneFix,
    hasModel,
  } = useSettings()

  return (
    <div className="space-y-6">
      {/* Animation Settings */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted">Animation</h3>
        <Toggle
          label="In-Place Animations"
          checked={settings.inPlaceAnimations}
          onChange={toggleInPlace}
          description="Remove root motion from all animations"
        />
      </div>

      {/* Model Fixes */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted">Model Fixes</h3>
        <Toggle
          label="Root Bone Fix"
          checked={settings.applyRootBoneFix}
          onChange={toggleRootBoneFix}
          disabled={!hasModel}
          description="Fix for engines requiring proper root bone hierarchy"
        />
      </div>

      {/* Export Settings */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted">Export File Names</h3>
        <Toggle
          label="Replace Spaces with _"
          checked={settings.replaceWhitespaceWithUnderscore}
          onChange={() => updateSettings({ 
            replaceWhitespaceWithUnderscore: !settings.replaceWhitespaceWithUnderscore 
          })}
          description="Replace whitespace in filenames with underscores"
        />
        <Toggle
          label="Lowercase Filenames"
          checked={settings.lowercaseFilenames}
          onChange={() => updateSettings({ 
            lowercaseFilenames: !settings.lowercaseFilenames 
          })}
          description="Convert all filenames to lowercase"
        />
      </div>

      {/* Environment Settings */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted">Environment</h3>
        
        <Select
          label="Preset"
          value={environment.environmentPreset}
          onChange={(value) => updateEnvironment({ 
            environmentPreset: value as typeof environment.environmentPreset,
            showEnvironment: value !== 'none'
          })}
          options={ENVIRONMENT_PRESETS}
        />

        <Toggle
          label="Show Grid"
          checked={environment.showGrid}
          onChange={() => updateEnvironment({ showGrid: !environment.showGrid })}
        />
      </div>

      {/* Lighting */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted">Lighting</h3>
        
        <Slider
          label="Ambient Light"
          value={environment.ambientIntensity}
          onChange={(value) => updateEnvironment({ ambientIntensity: value })}
          min={0}
          max={2}
          step={0.1}
        />

        <Slider
          label="Directional Light"
          value={environment.directionalIntensity}
          onChange={(value) => updateEnvironment({ directionalIntensity: value })}
          min={0}
          max={3}
          step={0.1}
        />
      </div>
    </div>
  )
}
