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
const GREY = Color3.FromHexString('#6b6b78')

/** `faded`: the worm is dead or its player has gone; it turns grey but keeps a hint of its colour. */
export type WormUpdate = (from: Point[], to: Point[], t: number, faded: boolean) => void

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

  const headSkin = createSkin(scene, colour, 0.36)
  const segmentSkin = createSkin(scene, colour, 0.27)
  const linkSkin = createSkin(scene, colour, 0.21)
  linkSkin.emissiveColor = Color3.Black()
  linkSkin.specularPower = 48

  const head = await loadModel(scene, '/models/head.glb')
  head.material = headSkin
  paintEyes(scene, head)

  const segment = await loadModel(scene, '/models/segment.glb')
  segment.material = segmentSkin
  for (const link of segment.getChildMeshes()) link.material = linkSkin

  segment.setEnabled(false)

  const balls: Mesh[] = [head]
  function addSegment() {
    const clone = segment.clone('segment')
    clone.setEnabled(true)
    balls.push(clone)
  }

  const greyed = Color3.Lerp(colour, GREY, 0.75)
  let grey = false
  function paint(faded: boolean) {
    if (faded === grey) return
    grey = faded
    const skin = faded ? greyed : colour
    for (const material of [headSkin, segmentSkin]) {
      material.diffuseColor = skin
      material.emissiveColor = skin.scale(0.3)
    }
    linkSkin.diffuseColor = skin
  }

  function update(from: Point[], to: Point[], t: number, faded: boolean) {
    paint(faded)
    while (balls.length < to.length) addSegment()
    balls.forEach((ball, i) => ball.setEnabled(i < to.length))
    const points = to.map((cell, i) => Vector3.Lerp(toWorld(board, from[i] ?? cell), toWorld(board, cell), t))
    points.forEach((p, i) => {
      const behind = i === 0 ? (points[1] ?? toWorld(board, from[0] ?? to[0])) : p
      const facing = i === 0 ? p.subtract(behind) : points[i - 1].subtract(p)
      balls[i].position.set(p.x, BALL / 2, p.z)
      if (facing.lengthSquared() > 0) balls[i].rotation.y = Math.atan2(facing.x, facing.z)
    })
  }

  update(worm.body, worm.body, 1, false)
  return update
}

export function createWorms(scene: Scene, board: Board, worms: Worm[]) {
  return Promise.all(worms.map((worm) => createWorm(scene, board, worm)))
}
