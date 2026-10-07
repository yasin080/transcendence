import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera'
import { Engine } from '@babylonjs/core/Engines/engine'
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { DefaultRenderingPipeline } from '@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline'
import { Scene } from '@babylonjs/core/scene'

import type { Board } from '../board'
import { createFloor } from './floor'
import { createWalls } from './walls'

export function createGameScene(canvas: HTMLCanvasElement, board: Board) {
  const engine = new Engine(canvas, true, { stencil: false }, true)
  const scene = new Scene(engine)
  scene.clearColor = new Color4(0.045, 0.04, 0.085, 1)

  const cam = new ArcRotateCamera('cam', -Math.PI / 2, 0.62, 70, Vector3.Zero(), scene)
  cam.attachControl(canvas, true)
  cam.fov = 0.38 
  cam.lowerRadiusLimit = 30
  cam.upperRadiusLimit = 110
  cam.lowerBetaLimit = 0.05
  cam.upperBetaLimit = 1.1
  cam.wheelPrecision = 6

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

  createFloor(scene, board.width, board.height)
  void createWalls(scene, board)

  engine.runRenderLoop(() => scene.render())

  const resize = new ResizeObserver(() => engine.resize())
  resize.observe(canvas)

  return {
    dispose() {
      resize.disconnect()
      engine.stopRenderLoop()
      scene.dispose()
      engine.dispose()
    },
  }
}
