'use client'
import { ViewerCanvas } from './ViewerCanvas'
import { ViewerControls } from './ViewerControls'

export function Viewer() {
  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-background">
      <ViewerCanvas />
      <ViewerControls />
    </div>
  )
}
