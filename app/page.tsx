'use client'

import { Viewer } from './features/viewer'
import { UploadPanel } from './features/upload'
import { AnimationPanel } from './features/animations'
import { ExportPanel } from './features/export'
import { SettingsPanel } from './features/settings'

export default function Home() {
  return (
    <main className="h-screen w-screen flex overflow-hidden">
      {/* Left Sidebar */}
      <aside className="w-72 flex-shrink-0 bg-surface/50 p-4 flex flex-col gap-6 overflow-y-auto">
        <header>
          <h1 className="text-lg font-semibold text-foreground">
            Mixamo → GLB
          </h1>
          <p className="text-xs text-muted mt-1">
            Convert FBX models and animations
          </p>
        </header>

        <UploadPanel />

        <div className="flex-1 min-h-0">
          <AnimationPanel />
        </div>
      </aside>

      {/* Main Viewer */}
      <section className="flex-1 p-4">
        <Viewer />
      </section>

      {/* Right Sidebar */}
      <aside className="w-72 flex-shrink-0 bg-surface/50 p-4 flex flex-col gap-6 overflow-y-auto">
        <ExportPanel />

        <div className="h-px bg-surface-hover" />

        <SettingsPanel />
      </aside>
    </main>
  )
}
