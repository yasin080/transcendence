import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera'
import { Engine } from '@babylonjs/core/Engines/engine'
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator'
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Logger } from '@babylonjs/core/Misc/logger'
import { DefaultRenderingPipeline } from '@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline'
import { Scene } from '@babylonjs/core/scene'

import type { Game } from '../logic/game'
import { type BombsRender, createBombs } from './bombs'
import { isTouch } from '../touch'
import { createFloor } from './floor'
import { toWorld } from './grid'
import { createFood, type FoodUpdate } from './food'
import { createWalls } from './walls'
import { createWorms, type WormUpdate } from './worms'

// Ángulo más corto para ir de `from` a `to`, para girar la cámara sin dar la vuelta larga
const turn = (from: number, to: number) => Math.atan2(Math.sin(to - from), Math.cos(to - from))

export function createGameScene(canvas: HTMLCanvasElement, game: Game, you: number | null) {
  const { board, worms } = game
  // Un espectador no tiene gusano que seguir: ve siempre el tablero entero
  const view = you === null ? 'board' : game.settings.camera
  const seat = you ?? 0

  // Keep Babylon's warnings and errors, drop its version banner from the console.
  Logger.LogLevels = Logger.WarningLogLevel | Logger.ErrorLogLevel
  const engine = new Engine(canvas, true, { stencil: false }, true)
  const scene = new Scene(engine)
  scene.clearColor = new Color4(0.045, 0.04, 0.085, 1)

  // Detrás de la cabeza: la cámara mira hacia donde va el gusano
  const behindHead = () => Math.atan2(-worms[seat].dir.y, -worms[seat].dir.x)
  const head = view === 'head'
  const cam = new ArcRotateCamera('cam', head ? behindHead() : -Math.PI / 2, head ? 1.15 : 0.62, 1, Vector3.Zero(), scene)
  cam.attachControl(canvas, true)
  cam.fov = 0.38
  function fitBoard() {
    const narrow = Math.min(1, engine.getAspectRatio(cam))
    const wholeBoard = (Math.max(board.width, board.height) * 0.6) / (Math.tan(cam.fov / 2) * narrow)
    // Siguiendo al gusano se ve al menos el 20 % del tablero: el 45 % de cada lado
    cam.radius = view === 'board' ? wholeBoard : wholeBoard * 0.45
    cam.lowerRadiusLimit = view === 'board' ? cam.radius / 2 : cam.radius
    cam.upperRadiusLimit = cam.radius * 1.5
  }
  fitBoard()
  cam.lowerBetaLimit = 0.05
  cam.upperBetaLimit = head ? 1.3 : 0.8
  cam.wheelPrecision = 6
  cam.inputs.removeByType('ArcRotateCameraKeyboardMoveInput')
  // On touch screens a drag steers the worm, so it must not also orbit the camera.
  // Behind the head the camera turns with the worm, so it can't be orbited either.
  if (isTouch || head) cam.inputs.removeByType('ArcRotateCameraPointersInput')

  const sky = new HemisphericLight('sky', new Vector3(0, 1, 0), scene)
  sky.intensity = 0.5
  sky.diffuse = new Color3(0.62, 0.78, 1)
  sky.groundColor = new Color3(0.16, 0.09, 0.24)

  const sun = new DirectionalLight('sun', new Vector3(-0.6, -0.45, 0.35), scene)
  sun.intensity = 0.95
  sun.diffuse = new Color3(0.75, 0.9, 1)

  sun.autoCalcShadowZBounds = true
  const shadows = new ShadowGenerator(1024, sun)
  shadows.usePercentageCloserFiltering = true
  shadows.transparencyShadow = true
  scene.onNewMeshAddedObservable.add((mesh) => mesh.name !== 'floor' && shadows.addShadowCaster(mesh))

  const post = new DefaultRenderingPipeline('post', true, scene, [cam])
  post.fxaaEnabled = true
  post.bloomEnabled = true

  createFloor(scene, board.width + 100, board.height + 100)
  let updateWorms: WormUpdate[] = []
  let updateFood: FoodUpdate = () => {}
  let bombs: BombsRender = { update: () => {}, flash: () => {} }
  Promise.all([
    createWalls(scene, board),
    createWorms(scene, board, worms),
    createFood(scene, board, game.food),
    createBombs(scene, board, game),
  ])
    .then(([, wormUpdates, foodUpdate, bombsRender]) => {
      updateWorms = wormUpdates
      updateFood = foodUpdate
      bombs = bombsRender
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
    updateWorms.forEach((update, i) => update(previous[i], current[i], t, !worms[i].alive || !!worms[i].away))
    updateFood(game.food)
    bombs.update()
    if (view !== 'board') {
      const target = Vector3.Lerp(toWorld(board, previous[seat][0]), toWorld(board, current[seat][0]), t)
      Vector3.LerpToRef(cam.target, target, 0.1, cam.target)
    }
    if (head) cam.alpha += turn(cam.alpha, behindHead()) * 0.1
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
      bombs.flash(game.blasts)
    },
    dispose() {
      resize.disconnect()
      engine.stopRenderLoop()
      scene.dispose()
      engine.dispose()
    },
  }
}
