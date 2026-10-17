import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera'
import { Engine } from '@babylonjs/core/Engines/engine'
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { DefaultRenderingPipeline } from '@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline'
import { Scene } from '@babylonjs/core/scene'

import type { Game } from '../logic/game'
import { createFloor } from './floor'
import { toWorld } from './grid'
import { createFood, type FoodUpdate } from './food'
import { createWalls } from './walls'
import { createWorms, type WormUpdate } from './worms'

export function createGameScene(canvas: HTMLCanvasElement, game: Game) {
  const { board, worms } = game

  const engine = new Engine(canvas, true, { stencil: false }, true)
  const scene = new Scene(engine)
  scene.clearColor = new Color4(0.045, 0.04, 0.085, 1)

  const cam = new ArcRotateCamera('cam', -Math.PI / 2, 0.62, 1, Vector3.Zero(), scene)
  cam.attachControl(canvas, true)
  cam.fov = 0.38
  const follow = game.settings.camera === 'follow'
  function fitBoard() {
    const narrow = Math.min(1, engine.getAspectRatio(cam))
    cam.radius = follow ? 40 : (Math.max(board.width, board.height) * 0.6) / (Math.tan(cam.fov / 2) * narrow)
    cam.lowerRadiusLimit = cam.radius / 2
    cam.upperRadiusLimit = cam.radius * 1.5
  }
  fitBoard()
  cam.lowerBetaLimit = 0.05
  cam.upperBetaLimit = 0.8
  cam.wheelPrecision = 6
  cam.inputs.removeByType('ArcRotateCameraKeyboardMoveInput')

  const sky = new HemisphericLight('sky', new Vector3(0, 1, 0), scene)
  sky.intensity = 0.5
  sky.diffuse = new Color3(0.62, 0.78, 1)
  sky.groundColor = new Color3(0.16, 0.09, 0.24)

  const sun = new DirectionalLight('sun', new Vector3(-0.6, -0.45, 0.35), scene)
  sun.intensity = 0.95
  sun.diffuse = new Color3(0.75, 0.9, 1)

  const post = new DefaultRenderingPipeline('post', true, scene, [cam])
  post.fxaaEnabled = true
  post.bloomEnabled = true

  createFloor(scene, board.width + 100, board.height + 100)
  let updateWorms: WormUpdate[] = []
  let updateFood: FoodUpdate = () => {}
  Promise.all([createWalls(scene, board), createWorms(scene, board, worms), createFood(scene, board, game.food)])
    .then(([, wormUpdates, foodUpdate]) => {
      updateWorms = wormUpdates
      updateFood = foodUpdate
    })
    .catch((error: unknown) => {
      if (!scene.isDisposed) throw error
    })

  let current = worms.map((worm) => worm.body)
  let previous = current
  let elapsed = 0

  scene.onBeforeRenderObservable.add(() => {
    elapsed += engine.getDeltaTime()
    const t = Math.min(elapsed / game.settings.tickMs, 1)
    updateWorms.forEach((update, i) => update(previous[i], current[i], t))
    updateFood(game.food)
    if (follow) {
      const head = Vector3.Lerp(toWorld(board, previous[0][0]), toWorld(board, current[0][0]), t)
      Vector3.LerpToRef(cam.target, head, 0.1, cam.target)
    }
  })

  engine.runRenderLoop(() => scene.render())

  const resize = new ResizeObserver(() => {
    engine.resize()
    fitBoard()
  })
  resize.observe(canvas)

  return {
    onTick() {
      previous = current
      current = worms.map((worm) => worm.body)
      elapsed = 0
    },
    dispose() {
      resize.disconnect()
      engine.stopRenderLoop()
      scene.dispose()
      engine.dispose()
    },
  }
}
