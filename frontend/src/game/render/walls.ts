import '@babylonjs/core/Meshes/instancedMesh'
import '@babylonjs/loaders/glTF'

import { ImportMeshAsync } from '@babylonjs/core/Loading/sceneLoader'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import type { Mesh } from '@babylonjs/core/Meshes/mesh'
import type { Scene } from '@babylonjs/core/scene'

import { type Board, Cell, cellAt } from '../logic/board'
import { toWorld } from './grid'

const HEIGHT = 0.85
const SINK = 0.12

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

export async function createWalls(scene: Scene, board: Board) {
  const hard = await createWallType(scene, 'hard', new Color3(0.32, 0.37, 0.5))
  const soft = await createWallType(scene, 'soft', new Color3(0.78, 0.48, 0.14))

  for (let y = 0; y < board.height; y++) {
    for (let x = 0; x < board.width; x++) {
      const cell = cellAt(board, x, y)
      if (cell === Cell.Empty) continue

      const wall = (cell === Cell.Hard ? hard : soft).createInstance('wall')
      wall.position = toWorld(board, { x, y }, HEIGHT / 2 - SINK)
      wall.freezeWorldMatrix()
    }
  }
}
