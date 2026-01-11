import { Bone, Skeleton, SkinnedMesh, AnimationClip, KeyframeTrack, VectorKeyframeTrack } from 'three'
import type { Group } from 'three'

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
  const rootBoneNames = ['mixamorigHips', 'Hips', 'mixamorig:Hips', 'Root', 'root']
  
  inPlaceClip.tracks = inPlaceClip.tracks.map((track: KeyframeTrack) => {
    // Check if this track affects a root bone position
    const isRootPositionTrack = rootBoneNames.some(
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
