import '@babylonjs/core/Meshes/instancedMesh'
import '@babylonjs/loaders/glTF'

import { ImportMeshAsync } from '@babylonjs/core/Loading/sceneLoader'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { CreateGround } from '@babylonjs/core/Meshes/Builders/groundBuilder'
import type { Mesh } from '@babylonjs/core/Meshes/mesh'
import type { Scene } from '@babylonjs/core/scene'

import { type Board, Cell, cellAt } from '../board'

const HEIGHT = 0.85

async function createWallType(scene: Scene, name: string, colour: Color3) {
  const { meshes } = await ImportMeshAsync('/models/wall.glb', scene)
  const [root, box] = meshes as Mesh[]
  box.setParent(null)
  box.bakeCurrentTransformIntoVertices()
  root.dispose()

  const rim = new Texture(`/textures/${name}-rim.png`, scene)
  rim.level = 1.7

  const material = new StandardMaterial(name, scene)
  material.diffuseColor = colour
  material.emissiveTexture = rim
  material.linkEmissiveWithDiffuse = true

  box.material = material
  box.isVisible = false
  return box
}

function createShadow(scene: Scene) {
  const texture = new Texture('/textures/wall-shadow.png', scene)
  texture.hasAlpha = true

  const material = new StandardMaterial('wall-shadow', scene)
  material.diffuseTexture = texture
  material.useAlphaFromDiffuseTexture = true
  material.disableLighting = true

  const shadow = CreateGround('wall-shadow', { width: 1.7, height: 1.7 }, scene)
  shadow.material = material
  shadow.isVisible = false
  return shadow
}

export async function createWalls(scene: Scene, board: Board) {
  const hard = await createWallType(scene, 'hard', new Color3(0.32, 0.37, 0.5))
  const soft = await createWallType(scene, 'soft', new Color3(0.78, 0.48, 0.14))
  const shadow = createShadow(scene)

  for (let y = 0; y < board.height; y++) {
    for (let x = 0; x < board.width; x++) {
      const cell = cellAt(board, x, y)
      if (cell === Cell.Empty) continue

      const px = x - board.width / 2 + 0.5
      const pz = y - board.height / 2 + 0.5

      const wall = (cell === Cell.Hard ? hard : soft).createInstance('wall')
      wall.position.set(px, HEIGHT / 2, pz)
      wall.freezeWorldMatrix()

      const wallShadow = shadow.createInstance('shadow')
      wallShadow.position.set(px, 0.01, pz)
      wallShadow.freezeWorldMatrix()
    }
  }
}
