import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { Object3D, SkinnedMesh, Bone } from 'three'
import type { AnimationClip, Group } from 'three'

export interface ExportOptions {
  binary: boolean
  animations?: AnimationClip[]
}

/**
 * Export a Three.js object to GLB format.
 * Note: We intentionally don't modify the skeleton structure because:
 * 1. Bone reordering breaks vertex joint indices
 * 2. The GLTF validator warnings about skeleton root don't affect functionality
 */
export async function exportToGLB(
  object: Object3D,
  options: ExportOptions = { binary: true }
): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter()

    exporter.parse(
      object,
      (result) => {
        if (result instanceof ArrayBuffer) {
          resolve(result)
        } else {
          const json = JSON.stringify(result)
          const blob = new Blob([json], { type: 'application/json' })
          blob.arrayBuffer().then(resolve).catch(reject)
        }
      },
      (error) => reject(error),
      {
        binary: options.binary,
        animations: options.animations,
      }
    )
  })
}

/**
 * Recursively clone only Bone objects from a hierarchy.
 * This creates a clean bone-only structure without any mesh data.
 */
function cloneBonesOnly(source: Object3D): Object3D {
  let clone: Object3D
  
  if (source instanceof Bone) {
    clone = new Bone()
  } else {
    clone = new Object3D()
  }
  
  clone.name = source.name
  clone.position.copy(source.position)
  clone.quaternion.copy(source.quaternion)
  clone.scale.copy(source.scale)
  
  // Only clone children that are Bones or containers that have Bone descendants
  source.children.forEach((child) => {
    // Check if this child or any descendant is a Bone
    let hasBones = child instanceof Bone
    if (!hasBones) {
      child.traverse((c) => {
        if (c instanceof Bone) hasBones = true
      })
    }
    
    if (hasBones) {
      const childClone = cloneBonesOnly(child)
      clone.add(childClone)
    }
  })
  
  return clone
}

/**
 * Creates a skeleton-only structure from a skinned model for animation export.
 * This creates a clean bone hierarchy without any mesh/geometry/skin data.
 * The hierarchy and names are preserved so animation tracks match correctly.
 */
export function createSkeletonOnly(model: Group): Object3D {
  // Clone only the bone structure, preserving hierarchy and names
  const bonesOnly = cloneBonesOnly(model)
  bonesOnly.updateMatrixWorld(true)
  return bonesOnly
}

/**
 * Export animation clip as a standalone GLB with just the bone hierarchy.
 * No mesh, no skin data - just bones and animation.
 */
export async function exportAnimationGLB(
  model: Group,
  clip: AnimationClip
): Promise<ArrayBuffer> {
  // Create a clean bone-only hierarchy
  const skeletonOnly = createSkeletonOnly(model)
  
  // Export with the animation
  return exportToGLB(skeletonOnly, {
    binary: true,
    animations: [clip],
  })
}

/**
 * Apply an animation pose to a model at a specific time.
 * This samples the animation at the given time and applies the pose to the model.
 */
export function applyAnimationPose(
  model: Group,
  clip: AnimationClip,
  time: number
): void {
  const { AnimationMixer } = require('three') as typeof import('three')
  
  // Create a temporary mixer to sample the animation
  const mixer = new AnimationMixer(model)
  const action = mixer.clipAction(clip)
  
  // Set the action to the desired time
  action.play()
  action.time = time
  mixer.update(0)
  
  // The pose is now applied to the model
  // Clean up the mixer
  mixer.stopAllAction()
}

/**
 * Clone a model with a specific animation frame baked into its bind pose.
 * This is useful for setting a T-pose or A-pose as the default pose.
 */
export async function exportWithBasePose(
  model: Group,
  basePoseClip: AnimationClip,
  basePoseTime: number,
  animations: AnimationClip[]
): Promise<ArrayBuffer> {
  // Clone the model
  const modelClone = model.clone(true)
  
  // Apply the pose from the animation at the specified time
  applyAnimationPose(modelClone, basePoseClip, basePoseTime)
  
  // Update world matrices
  modelClone.updateMatrixWorld(true)
  
  // Export with the animations (they will still work because bone names are preserved)
  return exportToGLB(modelClone, {
    binary: true,
    animations,
  })
}

export function downloadBlob(buffer: ArrayBuffer, filename: string): void {
  const blob = new Blob([buffer], { type: 'model/gltf-binary' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export async function exportAndDownload(
  object: Object3D,
  filename: string,
  animations?: AnimationClip[]
): Promise<void> {
  const buffer = await exportToGLB(object, { binary: true, animations })
  downloadBlob(buffer, filename)
}
