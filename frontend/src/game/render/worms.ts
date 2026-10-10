import '@babylonjs/loaders/glTF'

import { ImportMeshAsync } from '@babylonjs/core/Loading/sceneLoader'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import type { Mesh } from '@babylonjs/core/Meshes/mesh'
import type { Scene } from '@babylonjs/core/scene'

import type { Board } from '../board'
import type { Point, Worm } from '../worms'
import { toWorld } from './grid'

const BALL = 1.12

export type WormView = { head: Mesh; update: (from: Point[], to: Point[], t: number) => void }

async function loadModel(scene: Scene, file: string) {
  const { meshes } = await ImportMeshAsync(file, scene)
  const [root, model] = meshes as Mesh[]
  model.setParent(null)
  model.bakeCurrentTransformIntoVertices()
  model.rotationQuaternion = null
  root.dispose()
  return model
}

function createSkin(scene: Scene, colour: Color3, alpha: number) {
  const material = new StandardMaterial('worm', scene)
  material.diffuseColor = colour
  material.emissiveColor = colour.scale(0.3)
  material.specularPower = 128
  material.alpha = alpha
  return material
}

async function createWorm(scene: Scene, board: Board, worm: Worm): Promise<WormView> {
  const colour = Color3.FromHexString(worm.colour)

  const head = await loadModel(scene, '/models/head.glb')
  head.material = createSkin(scene, colour, 0.36)

  const segment = await loadModel(scene, '/models/segment.glb')
  segment.material = createSkin(scene, colour, 0.27)
  const linkSkin = createSkin(scene, colour, 0.21)
  linkSkin.emissiveColor = Color3.Black()
  linkSkin.specularPower = 48
  for (const link of segment.getChildMeshes()) link.material = linkSkin

  const balls = worm.body.map((_, i) => (i === 0 ? head : segment.clone('segment')))
  segment.dispose()

  function update(from: Point[], to: Point[], t: number) {
    const points = to.map((cell, i) => Vector3.Lerp(toWorld(board, from[i]), toWorld(board, cell), t))
    points.forEach((p, i) => {
      const facing = i === 0 ? p.subtract(points[1]) : points[i - 1].subtract(p)
      balls[i].position.set(p.x, BALL / 2, p.z)
      balls[i].rotation.y = Math.atan2(facing.x, facing.z)
    })
  }

  update(worm.body, worm.body, 1)
  return { head, update }
}

export function createWorms(scene: Scene, board: Board, worms: Worm[]) {
  return Promise.all(worms.map((worm) => createWorm(scene, board, worm)))
}
