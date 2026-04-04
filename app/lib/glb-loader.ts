import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { Group, AnimationClip } from 'three'

export interface GLBLoadResult {
  scene: Group
  animations: AnimationClip[]
}

export async function loadGLB(file: File): Promise<GLBLoadResult> {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader()
    const url = URL.createObjectURL(file)

    loader.load(
      url,
      (gltf) => {
        URL.revokeObjectURL(url)
        resolve({
          scene: gltf.scene,
          animations: gltf.animations,
        })
      },
      undefined,
      (error) => {
        URL.revokeObjectURL(url)
        reject(error)
      }
    )
  })
}