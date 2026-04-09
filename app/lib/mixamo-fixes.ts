import {
  Bone,
  Skeleton,
  SkeletonHelper,
  SkinnedMesh,
  AnimationClip,
  KeyframeTrack,
  Quaternion,
  QuaternionKeyframeTrack,
  Vector3,
  VectorKeyframeTrack,
} from 'three'
import type { Group } from 'three'
import { clone as cloneSkeletonAware, retargetClip } from 'three/examples/jsm/utils/SkeletonUtils.js'

const mixamoRootBoneNames = ['mixamorigHips', 'Hips', 'mixamorig:Hips', 'Root', 'root']

type RetargetableGroup = Group & { skeleton: Skeleton }

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

function normalizeBoneName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function collectBones(model: Group): Bone[] {
  const bones: Bone[] = []

  model.traverse((child) => {
    if (child instanceof Bone) {
      bones.push(child)
    }
  })

  return bones
}

function getSkeletonFromBones(model: Group): Skeleton | null {
  const bones = collectBones(model)
  if (bones.length === 0) return null
  return new Skeleton(bones)
}

function createRetargetableClone(model: Group): Group | null {
  const clone = cloneSkeletonAware(model) as Group

  clone.updateMatrixWorld(true)

  return clone
}

function getPrimarySkinnedMesh(model: Group): SkinnedMesh | null {
  let skinnedMesh: SkinnedMesh | null = null

  model.traverse((child) => {
    if (skinnedMesh || !(child instanceof SkinnedMesh) || !child.skeleton) return
    skinnedMesh = child
  })

  return skinnedMesh
}

function getSkeletonFromModel(model: Group): Skeleton | null {
  const skinnedMesh = getPrimarySkinnedMesh(model)
  if (skinnedMesh?.skeleton) return skinnedMesh.skeleton

  return getSkeletonFromBones(model)
}

function createSourceRetargetRoot(model: Group): RetargetableGroup | null {
  const helper = new SkeletonHelper(model)
  const skeleton = helper.bones.length > 0 ? new Skeleton(helper.bones) : getSkeletonFromModel(model)

  if (!skeleton) return null

  const source = model as RetargetableGroup
  source.skeleton = skeleton
  source.updateMatrixWorld(true)

  return source
}

function findHipBoneName(skeleton: Skeleton): string | null {
  const exactMatch = mixamoRootBoneNames.find((name) => skeleton.getBoneByName(name) !== undefined)
  if (exactMatch) return exactMatch

  const normalizedHipNames = new Set(mixamoRootBoneNames.map(normalizeBoneName))

  for (const bone of skeleton.bones) {
    if (normalizedHipNames.has(normalizeBoneName(bone.name))) {
      return bone.name
    }
  }

  return null
}

function findBoneByNormalizedName(skeleton: Skeleton, names: string[]): Bone | null {
  const normalizedNames = new Set(names.map(normalizeBoneName))

  for (const bone of skeleton.bones) {
    if (normalizedNames.has(normalizeBoneName(bone.name))) {
      return bone
    }
  }

  return null
}

function deriveRetargetScale(
  targetSkeleton: Skeleton,
  sourceSkeleton: Skeleton,
  nameMap: Record<string, string>
): number {
  const sourceHipName = findHipBoneName(sourceSkeleton)
  if (!sourceHipName) return 1

  const targetHipName = Object.entries(nameMap).find(([, sourceName]) => sourceName === sourceHipName)?.[0]
  const sourceHip = sourceSkeleton.getBoneByName(sourceHipName) ?? findBoneByNormalizedName(sourceSkeleton, [sourceHipName])
  const targetHip = (targetHipName ? targetSkeleton.getBoneByName(targetHipName) : null)
    ?? findBoneByNormalizedName(targetSkeleton, mixamoRootBoneNames)

  if (!sourceHip || !targetHip) return 1

  // Use world Y position so that any parent-object scale/translation applied to
  // the armature node (common in Mixamo FBX exports) is accounted for.  Local
  // position alone varies between animation FBXs even for the same character,
  // causing a different scale per animation and inconsistent Y placement.
  const sourceWorldPos = new Vector3()
  sourceHip.getWorldPosition(sourceWorldPos)
  const targetWorldPos = new Vector3()
  targetHip.getWorldPosition(targetWorldPos)

  const sourceDistance = Math.abs(sourceWorldPos.y)
  const targetDistance = Math.abs(targetWorldPos.y)

  if (sourceDistance < 1e-5 || targetDistance < 1e-5) return 1

  const scale = targetDistance / sourceDistance
  return Number.isFinite(scale) && scale > 0 ? scale : 1
}

function buildBoneNameMap(targetSkeleton: Skeleton, sourceSkeleton: Skeleton): Record<string, string> {
  const nameMap: Record<string, string> = {}
  const sourceByName = new Map<string, string>()
  const sourceByNormalizedName = new Map<string, string>()
  const duplicatedNormalizedNames = new Set<string>()

  for (const bone of sourceSkeleton.bones) {
    sourceByName.set(bone.name, bone.name)

    const normalized = normalizeBoneName(bone.name)
    if (sourceByNormalizedName.has(normalized)) {
      duplicatedNormalizedNames.add(normalized)
    } else {
      sourceByNormalizedName.set(normalized, bone.name)
    }
  }

  for (const bone of targetSkeleton.bones) {
    const exactMatch = sourceByName.get(bone.name)
    if (exactMatch) {
      nameMap[bone.name] = exactMatch
      continue
    }

    const normalized = normalizeBoneName(bone.name)
    if (!duplicatedNormalizedNames.has(normalized)) {
      const normalizedMatch = sourceByNormalizedName.get(normalized)
      if (normalizedMatch) {
        nameMap[bone.name] = normalizedMatch
      }
    }
  }

  return nameMap
}

function normalizeRetargetedTrackNames(clip: AnimationClip): AnimationClip {
  const normalizedClip = clip.clone()

  normalizedClip.tracks = normalizedClip.tracks.map((track: KeyframeTrack) => {
    const match = /^\.bones\[([^\]]+)\]\.(position|quaternion)$/.exec(track.name)
    if (!match) return track

    const renamedTrack = track.clone()
    renamedTrack.name = `${match[1]}.${match[2]}`
    return renamedTrack
  })

  return normalizedClip
}

export function retargetAnimationToModel(
  clip: AnimationClip,
  sourceModel: Group,
  targetModel: Group
): AnimationClip | null {
  const sourceRoot = createSourceRetargetRoot(sourceModel)
  const targetRoot = createRetargetableClone(targetModel)

  if (!sourceRoot || !targetRoot) return null

  const targetSkeleton = getSkeletonFromModel(targetRoot)
  if (!targetSkeleton) return null

  const targetObject = (getPrimarySkinnedMesh(targetRoot) as RetargetableGroup | null)
    ?? Object.assign(targetRoot as RetargetableGroup, { skeleton: targetSkeleton })

  const names = buildBoneNameMap(targetSkeleton, sourceRoot.skeleton)
  if (Object.keys(names).length === 0) return null

  const hip = findHipBoneName(sourceRoot.skeleton) ?? mixamoRootBoneNames[0]
  const scale = deriveRetargetScale(targetSkeleton, sourceRoot.skeleton, names)
  const retargetedClip = retargetClip(targetObject, sourceRoot.skeleton, clip, {
    names,
    hip,
    scale,
  })

  const normalizedClip = normalizeRetargetedTrackNames(retargetedClip)
  normalizedClip.name = clip.name

  return normalizedClip
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
