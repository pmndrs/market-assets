const gltfPipeline = require('gltf-pipeline')
const fsExtra = require('fs-extra')
var glob = require('glob')

const processGltf = gltfPipeline.processGltf
const gltfToGlb = gltfPipeline.gltfToGlb
const options = {
  dracoOptions: {
    compressionLevel: 10,
  },
}
glob('files/models/**/*.gltf', {}, function (er, files) {
  files.forEach((file) => {
    try {
      const gltf = fsExtra.readJsonSync(file)
      processGltf(gltf, options)
        .then(function (results) {
          fsExtra.writeJsonSync(file, results.gltf)
        })
        .catch(() => {})
    } catch {
      //
    }
  })
})

glob('files/models/barn/model.gltf', {}, function (er, files) {
  const allGlbs = files.map((file) => file.split('model.gltf')[0] + 'model.glb')
  allGlbs.forEach((glb) => {
    if (!fsExtra.existsSync(glb)) {
      const gltf = fsExtra.readFileSync(
        glb.split('model.glb')[0] + 'model.gltf'
      )

      gltfToGlb(gltf, options).then(function (results) {
        fsExtra.writeFileSync(glb, results.glb)
      })
    }
  })
})
