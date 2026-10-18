import '@babylonjs/loaders/glTF'

import { ImportMeshAsync } from '@babylonjs/core/Loading/sceneLoader'
import type { Mesh } from '@babylonjs/core/Meshes/mesh'
import type { Scene } from '@babylonjs/core/scene'

export async function loadModel(scene: Scene, file: string) {
  const { meshes } = await ImportMeshAsync(file, scene, { pluginOptions: { gltf: { skipMaterials: true } } })
  const [root, model] = meshes as Mesh[]
  model.setParent(null)
  model.bakeCurrentTransformIntoVertices()
  model.rotationQuaternion = null
  root.dispose()
  return model
}
