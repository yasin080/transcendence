import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import type { Mesh } from '@babylonjs/core/Meshes/mesh'
import type { Scene } from '@babylonjs/core/scene'

import type { Board } from '../logic/board'
import type { Point, Worm } from '../logic/worms'
import { toWorld } from './grid'
import { loadModel } from './model'

const BALL = 1.12

export type WormUpdate = (from: Point[], to: Point[], t: number) => void

function paintEyes(scene: Scene, head: Mesh) {
  const eye = new StandardMaterial('eye', scene)
  eye.emissiveColor = new Color3(0.9, 0.95, 1)
  eye.disableLighting = true

  const pupil = new StandardMaterial('pupil', scene)
  pupil.diffuseColor = Color3.Black()
  pupil.disableLighting = true

  for (const mesh of head.getChildMeshes()) mesh.material = mesh.name.startsWith('pupil') ? pupil : eye
}

function createSkin(scene: Scene, colour: Color3, alpha: number) {
  const material = new StandardMaterial('worm', scene)
  material.diffuseColor = colour
  material.emissiveColor = colour.scale(0.3)
  material.specularPower = 128
  material.alpha = alpha
  return material
}

async function createWorm(scene: Scene, board: Board, worm: Worm): Promise<WormUpdate> {
  const colour = Color3.FromHexString(worm.colour)

  const head = await loadModel(scene, '/models/head.glb')
  head.material = createSkin(scene, colour, 0.36)
  paintEyes(scene, head)

  const segment = await loadModel(scene, '/models/segment.glb')
  segment.material = createSkin(scene, colour, 0.27)
  const linkSkin = createSkin(scene, colour, 0.21)
  linkSkin.emissiveColor = Color3.Black()
  linkSkin.specularPower = 48
  for (const link of segment.getChildMeshes()) link.material = linkSkin

  segment.setEnabled(false)

  const balls: Mesh[] = [head]
  function addSegment() {
    const clone = segment.clone('segment')
    clone.setEnabled(true)
    balls.push(clone)
  }

  function update(from: Point[], to: Point[], t: number) {
    while (balls.length < to.length) addSegment()
    const points = to.map((cell, i) => Vector3.Lerp(toWorld(board, from[i] ?? cell), toWorld(board, cell), t))
    points.forEach((p, i) => {
      const facing = i === 0 ? p.subtract(points[1]) : points[i - 1].subtract(p)
      balls[i].position.set(p.x, BALL / 2, p.z)
      balls[i].rotation.y = Math.atan2(facing.x, facing.z)
    })
  }

  update(worm.body, worm.body, 1)
  return update
}

export function createWorms(scene: Scene, board: Board, worms: Worm[]) {
  return Promise.all(worms.map((worm) => createWorm(scene, board, worm)))
}
