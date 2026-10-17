import '@babylonjs/core/Meshes/instancedMesh'

import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import type { Scene } from '@babylonjs/core/scene'

import type { Board } from '../logic/board'
import type { Point } from '../logic/worms'
import { toWorld } from './grid'
import { loadModel } from './model'

const HEIGHT = 0.6

export type FoodUpdate = (food: Point[]) => void

export async function createFood(scene: Scene, board: Board, food: Point[]): Promise<FoodUpdate> {
  const apple = await loadModel(scene, '/models/apple.glb')

  const material = new StandardMaterial('food', scene)
  material.diffuseTexture = new Texture('/textures/apple.png', scene, false, false)
  material.emissiveColor = new Color3(0.25, 0.12, 0.08)
  apple.material = material
  apple.isVisible = false

  const apples = food.map(() => apple.createInstance('food'))

  return function update(food: Point[]) {
    apples.forEach((apple, i) => apple.setEnabled(i < food.length))
    food.forEach((cell, i) => (apples[i].position = toWorld(board, cell, HEIGHT / 2)))
  }
}
