import path from 'path'
import fs from 'fs'
import { getSize } from '../getSize'
import { getNextAndPrev } from '../getNextAndPrev'

const getModel = (name) => {
  const resources = path.join(__dirname, '../../files/models/')
  const nextAndPrev = getNextAndPrev(resources, name)
  var model = { ...nextAndPrev }
  const newPath = path.join(resources, name)

  if (fs.statSync(newPath).isDirectory()) {
    // eslint-disable-next-line array-callback-return
    fs.readdirSync(newPath).map((filename) => {
      const filePath = path.join(resources, name, filename)
      const fileContents = fs.readFileSync(filePath, 'utf-8')

      if (filename.includes('.gltf')) {
        const { size, highPoly } = getSize(filePath)
        model.size = size
        model.highPoly = highPoly
      }
      model.url = name
      if (filename.includes('.png') || filename.includes('.jpg')) {
        model.image = `/files/models/${name}/${filename}`
      } else if (filename.includes('.json')) {
        model.info = JSON.parse(fileContents)
      } else {
        if (filename.includes('_textures')) {
          model.gltfTextured = `/files/models/${name}/${filename}`
          model.buffer = fileContents
        } else {
          model.gltf = `/files/models/${name}/${filename}`
          if (!model.buffer) model.buffer = fileContents
        }
      }
    })
    return model
  }

  return model
}

export default function handler(req, res) {
  const model = getModel(req.query.name)

  res.status(200).json(model)
}
