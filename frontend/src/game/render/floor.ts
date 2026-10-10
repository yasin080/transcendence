import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { MirrorTexture } from '@babylonjs/core/Materials/Textures/mirrorTexture'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Plane } from '@babylonjs/core/Maths/math.plane'
import { CreateGround } from '@babylonjs/core/Meshes/Builders/groundBuilder'
import type { Scene } from '@babylonjs/core/scene'

const CELLS_PER_TILE = 4

export function createFloor(scene: Scene, width: number, height: number) {
  const texture = new Texture('/textures/floor.png', scene)
  texture.uScale = width / CELLS_PER_TILE
  texture.vScale = height / CELLS_PER_TILE

  const material = new StandardMaterial('floor', scene)
  material.diffuseTexture = texture
  material.specularColor = new Color3(0.1, 0.1, 0.15)

  const mirror = new MirrorTexture('floor-mirror', 512, scene, true)
  mirror.mirrorPlane = new Plane(0, -1, 0, 0)
  mirror.renderListPredicate = (mesh) => mesh.material?.name === 'worm'
  mirror.level = 0.24
  material.reflectionTexture = mirror

  const floor = CreateGround('floor', { width, height }, scene)
  floor.material = material
}
