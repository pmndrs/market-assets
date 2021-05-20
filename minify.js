const gltfPipeline = require('gltf-pipeline')
const fsExtra = require('fs-extra')
var glob = require('glob')

const processGltf = gltfPipeline.processGltf
glob('files/models/**/*.gltf', {}, function (er, files) {
  files.forEach((file) => {
    try {
      const gltf = fsExtra.readJsonSync(file)
      processGltf(gltf, {
        dracoOptions: {
          compressionLevel: 10,
        },
      })
        .then(function (results) {
          fsExtra.writeJsonSync(file, results.gltf)
        })
        .catch(() => {})
    } catch {
      //
    }
  })
})
