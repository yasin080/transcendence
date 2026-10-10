import '@babylonjs/core/Meshes/instancedMesh'

import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { CreateSphere } from '@babylonjs/core/Meshes/Builders/sphereBuilder'
import type { Scene } from '@babylonjs/core/scene'

import type { Board } from '../logic/board'
import type { Point } from '../logic/worms'
import { toWorld } from './grid'

const SIZE = 0.45

export function createFood(scene: Scene, board: Board, food: Point[]) {
  const material = new StandardMaterial('food', scene)
  material.diffuseColor = new Color3(1, 0.85, 0.15)
  material.emissiveColor = new Color3(1, 0.7, 0.1)

  const pellet = CreateSphere('food', { diameter: SIZE }, scene)
  pellet.material = material
  pellet.isVisible = false

  const pellets = food.map(() => pellet.createInstance('food'))

  return function update(food: Point[]) {
    food.forEach((cell, i) => (pellets[i].position = toWorld(board, cell, SIZE)))
  }
}
