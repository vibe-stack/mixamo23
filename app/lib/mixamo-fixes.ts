import {
  Bone,
  Skeleton,
  SkinnedMesh,
  AnimationClip,
  KeyframeTrack,
  Quaternion,
  QuaternionKeyframeTrack,
  Vector3,
  VectorKeyframeTrack,
} from 'three'
import type { Group } from 'three'

const mixamoRootBoneNames = ['mixamorigHips', 'Hips', 'mixamorig:Hips', 'Root', 'root']

function findMixamoRootBone(model: Group): Bone | null {
  let rootBone: Bone | null = null

  model.traverse((child) => {
    if (rootBone || !(child instanceof Bone)) return
    if (mixamoRootBoneNames.includes(child.name)) {
      rootBone = child
    }
  })

  return rootBone
}

function getNonBoneAncestorQuaternion(object: Bone): Quaternion | null {
  const ancestors: Quaternion[] = []
  let current = object.parent

  while (current) {
    if (!(current instanceof Bone)) {
      ancestors.push(current.quaternion.clone())
    }
    current = current.parent
  }

  if (ancestors.length === 0) return null

  const correction = new Quaternion()
  for (let index = ancestors.length - 1; index >= 0; index -= 1) {
    correction.multiply(ancestors[index])
  }

  return correction.angleTo(new Quaternion()) > 1e-5 ? correction : null
}

function isMixamoRootTrack(trackName: string, property: 'position' | 'quaternion'): boolean {
  return mixamoRootBoneNames.some(
    (name) => trackName === `${name}.${property}` || trackName.endsWith(`.${name}.${property}`)
  )
}

export function adaptAnimationToModelBasis(clip: AnimationClip, model: Group): AnimationClip {
  model.updateMatrixWorld(true)

  const rootBone = findMixamoRootBone(model)
  if (!rootBone) return clip

  const correction = getNonBoneAncestorQuaternion(rootBone)
  if (!correction) return clip

  const inverseCorrection = correction.clone().invert()
  const adaptedClip = clip.clone()

  adaptedClip.tracks = adaptedClip.tracks.map((track: KeyframeTrack) => {
    if (isMixamoRootTrack(track.name, 'position') && track instanceof VectorKeyframeTrack) {
      const values = track.values.slice()
      const vector = new Vector3()

      for (let index = 0; index < values.length; index += 3) {
        vector.set(values[index], values[index + 1], values[index + 2])
        vector.applyQuaternion(inverseCorrection)
        values[index] = vector.x
        values[index + 1] = vector.y
        values[index + 2] = vector.z
      }

      return new VectorKeyframeTrack(track.name, Array.from(track.times), Array.from(values))
    }

    if (isMixamoRootTrack(track.name, 'quaternion') && track instanceof QuaternionKeyframeTrack) {
      const values = track.values.slice()
      const quaternion = new Quaternion()

      for (let index = 0; index < values.length; index += 4) {
        quaternion.set(values[index], values[index + 1], values[index + 2], values[index + 3])
        quaternion.premultiply(inverseCorrection)
        quaternion.normalize()
        values[index] = quaternion.x
        values[index + 1] = quaternion.y
        values[index + 2] = quaternion.z
        values[index + 3] = quaternion.w
      }

      return new QuaternionKeyframeTrack(track.name, Array.from(track.times), Array.from(values))
    }

    return track
  })

  return adaptedClip
}

/**
 * Applies root bone fix for engines that require a proper root bone hierarchy.
 * Mixamo exports often have the Hips as the root, but some engines need a
 * stationary root bone at origin with Hips as a child.
 */
export function applyRootBoneFix(model: Group): Group {
  const clone = model.clone(true)
  
  // Find all skinned meshes and their skeletons
  const skinnedMeshes: SkinnedMesh[] = []
  clone.traverse((child) => {
    if (child instanceof SkinnedMesh) {
      skinnedMeshes.push(child)
    }
  })

  if (skinnedMeshes.length === 0) return clone

  // Common hip bone names in Mixamo
  const hipBoneNames = ['mixamorigHips', 'Hips', 'mixamorig:Hips']
  
  for (const mesh of skinnedMeshes) {
    const skeleton = mesh.skeleton
    if (!skeleton) continue

    // Find the current root bone (usually Hips)
    let hipBone: Bone | null = null
    for (const bone of skeleton.bones) {
      if (hipBoneNames.some(name => bone.name === name)) {
        hipBone = bone
        break
      }
    }

    if (!hipBone) continue

    // Check if there's already a proper root
    const hasProperRoot = skeleton.bones.some(
      bone => (bone.name === 'Root' || bone.name === 'root') && bone.children.includes(hipBone!)
    )

    if (hasProperRoot) continue

    // Create a new root bone
    const rootBone = new Bone()
    rootBone.name = 'Root'
    rootBone.position.set(0, 0, 0)
    
    // Reparent the hip bone under the new root
    const hipParent = hipBone.parent
    if (hipParent) {
      hipParent.remove(hipBone)
      rootBone.add(hipBone)
      hipParent.add(rootBone)
    }

    // Update skeleton bones array
    const newBones = [rootBone, ...skeleton.bones]
    const newSkeleton = new Skeleton(newBones)
    mesh.bind(newSkeleton)
  }

  return clone
}

/**
 * Makes an animation clip in-place by removing root motion on X and Z axes.
 */
export function makeAnimationInPlace(clip: AnimationClip): AnimationClip {
  const inPlaceClip = clip.clone()
  
  // Common root bone names in Mixamo rigs
  inPlaceClip.tracks = inPlaceClip.tracks.map((track: KeyframeTrack) => {
    // Check if this track affects a root bone position
    const isRootPositionTrack = mixamoRootBoneNames.some(
      (name) => track.name.includes(name) && track.name.endsWith('.position')
    )
    
    if (isRootPositionTrack && track instanceof VectorKeyframeTrack) {
      // Zero out X and Z movement, keep Y for up/down motion
      const values = track.values.slice()
      for (let i = 0; i < values.length; i += 3) {
        values[i] = 0     // X
        // values[i + 1] stays the same (Y - vertical)
        values[i + 2] = 0 // Z
      }
      return new VectorKeyframeTrack(track.name, Array.from(track.times), Array.from(values))
    }
    
    return track
  })
  
  return inPlaceClip
}

/**
 * Renames animation tracks to work with the root bone fix.
 * When a new Root bone is added, animation tracks targeting Hips need updating.
 */
export function updateAnimationForRootBoneFix(clip: AnimationClip): AnimationClip {
  const updatedClip = clip.clone()
  
  // Animation tracks don't need to be updated since we're keeping
  // the same bone names - we're just adding a parent Root bone
  
  return updatedClip
}
