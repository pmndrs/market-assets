import path from 'path'
import fs from 'fs'
import { getSize } from '../../../utils/getSize'
import { getNextAndPrev } from '../../../utils/getNextAndPrev'
import { info, model as modelName, thumbnail } from '../../../utils/filenames'

const getModel = (name) => {
  const resources = path.join(__dirname, '../../../files/models/')
  const nextAndPrev = getNextAndPrev(resources, name)
  var model = { ...nextAndPrev }
  const newPath = path.join(resources, name)

  if (fs.statSync(newPath).isDirectory()) {
    // eslint-disable-next-line array-callback-return
    fs.readdirSync(newPath).map((filename) => {
      const filePath = path.join(resources, name, filename)
      const fileContents = fs.readFileSync(filePath, 'utf-8')

      model.url = name
      if (filename === thumbnail) {
        model.thumbnail = `/files/models/${name}/${filename}`
      } else if (filename === info) {
        model = {
          ...model,
          ...JSON.parse(fileContents),
        }
      }

      if (filename === modelName) {
        const { size, highPoly } = getSize(filePath)
        model.size = size
        model.highPoly = highPoly
        model.gltf = `/files/models/${name}/${filename}`
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
