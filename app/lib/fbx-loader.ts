import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import type { Group, AnimationClip } from 'three'

export interface FBXLoadResult {
  scene: Group
  animations: AnimationClip[]
}

export async function loadFBX(file: File): Promise<FBXLoadResult> {
  return new Promise((resolve, reject) => {
    const loader = new FBXLoader()
    const url = URL.createObjectURL(file)

    loader.load(
      url,
      (fbx) => {
        URL.revokeObjectURL(url)
        resolve({
          scene: fbx,
          animations: fbx.animations,
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
