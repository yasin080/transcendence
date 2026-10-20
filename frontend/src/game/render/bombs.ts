import '@babylonjs/core/Meshes/instancedMesh'

import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import type { InstancedMesh } from '@babylonjs/core/Meshes/instancedMesh'
import type { Mesh } from '@babylonjs/core/Meshes/mesh'
import type { Scene } from '@babylonjs/core/scene'

import type { Board } from '../logic/board'
import { FUSE, type Game } from '../logic/game'
import type { Point } from '../logic/worms'
import { toWorld } from './grid'
import { loadModel } from './model'

const ON_BOARD = 0.55
const DROPPED = 0.8
const BOOM_MS = 500
// Across the 3x3 square a bomb blows up.
const BOOM_SIZE = 3

export type BombsRender = {
  update: () => void
  flash: (blasts: Point[]) => void
}

function fitToCell(model: Mesh) {
  const { minimum, maximum } = model.refreshBoundingInfo().getBoundingInfo().boundingBox
  const size = maximum.subtract(minimum)
  model.scaling.setAll(1 / Math.max(size.x, size.y, size.z))
  model.bakeCurrentTransformIntoVertices()
  const box = model.refreshBoundingInfo().getBoundingInfo().boundingBox
  model.position = new Vector3(-box.center.x, -box.minimum.y, -box.center.z)
  model.bakeCurrentTransformIntoVertices()
}

export async function createBombs(scene: Scene, board: Board, game: Game): Promise<BombsRender> {
  const bomb = await loadModel(scene, '/models/bomb.glb')
  fitToCell(bomb)
  const shine = new StandardMaterial('bomb', scene)
  shine.specularColor = new Color3(0.9, 0.9, 0.9)
  shine.specularPower = 64
  shine.emissiveColor = new Color3(0.08, 0.08, 0.08)
  bomb.material = shine
  bomb.isVisible = false

  const cloud = await loadModel(scene, '/models/explosion.glb')
  fitToCell(cloud)
  const fire = new StandardMaterial('blast', scene)
  fire.diffuseColor = new Color3(1, 0.7, 0.25)
  fire.emissiveColor = new Color3(1, 0.4, 0.08)
  cloud.material = fire
  cloud.isVisible = false

  const pool: InstancedMesh[] = []
  const booms: { mesh: InstancedMesh; born: number }[] = []

  function place(i: number, at: Vector3, size: number) {
    while (pool.length <= i) pool.push(bomb.createInstance('bomb'))
    pool[i].setEnabled(true)
    pool[i].position = at
    pool[i].scaling.setAll(size)
  }

  return {
    update() {
      let used = 0
      for (const cell of game.pickups) place(used++, toWorld(board, cell), ON_BOARD)

      for (const dropped of game.bombs) {
        const period = 40 + 150 * (dropped.fuse / FUSE)
        const beat = 1 + 0.12 * Math.sin(performance.now() / period)
        place(used++, toWorld(board, dropped), DROPPED * beat)
      }

      for (let i = used; i < pool.length; i++) pool[i].setEnabled(false)

      const now = performance.now()
      for (const boom of booms) {
        const age = (now - boom.born) / BOOM_MS
        if (age < 1) boom.mesh.scaling.setAll(BOOM_SIZE * Math.sin(Math.PI * age))
        else boom.mesh.dispose()
      }
      booms.splice(0, booms.length, ...booms.filter((boom) => !boom.mesh.isDisposed()))
    },

    flash(blasts) {
      for (const blast of blasts) {
        const mesh = cloud.createInstance('blast')
        mesh.position = toWorld(board, blast)
        mesh.rotation.y = Math.random() * Math.PI * 2
        mesh.scaling.setAll(0)
        booms.push({ mesh, born: performance.now() })
      }
    },
  }
}
