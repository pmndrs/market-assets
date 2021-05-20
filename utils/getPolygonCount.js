import fetch from 'node-fetch'
import { BufferUtils, FileUtils, NodeIO, uuid } from '@gltf-transform/core'
import { inspect } from '@gltf-transform/functions'
import {
  DracoMeshCompression,
  MaterialsUnlit,
} from '@gltf-transform/extensions'
import draco3d from 'draco3dgltf'
import { CDN_URL } from './urls'

function decodeDataURI(resource, resources) {
  // Rewrite Data URIs to something short and unique.
  const resourceUUID = `__${uuid()}.${FileUtils.extension(resource.uri)}`
  resources[resourceUUID] = BufferUtils.createBufferFromDataURI(resource.uri)
  resource.uri = resourceUUID
}

export const getPolygonCount = async (url) => {
  try {
    const io = new NodeIO()
      .registerExtensions([DracoMeshCompression, MaterialsUnlit])
      .registerDependencies({
        'draco3d.decoder': await draco3d.createDecoderModule(),
        'draco3d.encoder': await draco3d.createEncoderModule(),
      })
    const json = await fetch(CDN_URL(url)).then((rsp) => rsp.json())
    const resources = {}
    for (const bufferDef of json.buffers || []) {
      if (bufferDef.uri && bufferDef.uri.startsWith('data:')) {
        decodeDataURI(bufferDef, resources)
      }
    }
    for (const imageDef of json.images || []) {
      if (imageDef.uri && imageDef.uri.startsWith('data:')) {
        decodeDataURI(imageDef, resources)
      }
    }
    const document = io.readJSON({ json, resources })
    const report = inspect(document)

    const faces = report.meshes.properties.reduce(
      (acc, curr) => (acc = curr.glPrimitives + acc),
      0
    )
    const vertices = report.meshes.properties.reduce(
      (acc, curr) => (acc = curr.vertices + acc),
      0
    )

    return { faces, vertices }
  } catch (e) {
    console.log('-----------', e, '-----------')
  }
}
