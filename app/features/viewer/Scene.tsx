'use client'

import { useViewer } from './useViewer'
import { Model } from './Model'
import { Environment } from '@react-three/drei'

export function Scene() {
  const { model, activeClip, isPlaying, hasModel, environment, settings } = useViewer()

  return (
    <>
      <ambientLight intensity={environment.ambientIntensity} />
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={environment.directionalIntensity} 
        castShadow 
      />
      <directionalLight 
        position={[-5, 5, -5]} 
        intensity={environment.directionalIntensity * 0.3} 
      />

      {environment.showEnvironment && environment.environmentPreset !== 'none' && (
        <Environment preset={environment.environmentPreset} background={false} />
      )}

      {hasModel && model && (
        <Model 
          model={model} 
          clip={activeClip} 
          isPlaying={isPlaying} 
          inPlace={settings.inPlaceAnimations}
        />
      )}

      {environment.showGrid && (
        <gridHelper args={[10, 10, '#333333', '#222222']} position={[0, 0, 0]} />
      )}
    </>
  )
}
