import path from 'path'
import fs from 'fs'
import { getSize } from '../../utils/getSize'
import { thumbnail, model as modelName, info } from '../../utils/filenames'

export const getAllModels = () => {
  const resources = path.join(__dirname, '../../files/models/')
  const folders = fs.readdirSync(resources)
  // eslint-disable-next-line array-callback-return
  const models = folders.map((folder) => {
    let model = {}
    const newPath = path.join(resources, folder)
    if (fs.statSync(newPath).isDirectory()) {
      // eslint-disable-next-line array-callback-return
      fs.readdirSync(newPath).map((filename) => {
        const filePath = path.join(resources, folder, filename)
        const fileContents = fs.readFileSync(filePath, 'utf-8')
        if (filename === modelName) {
          const { size, highPoly } = getSize(filePath)
          model.size = size
          model.highPoly = highPoly
        }
        model.link = `https://api.market.pmnd.rs/materials/material?name=${folder}`
        model.id = `model/${folder}`
        if (filename === thumbnail) {
          model.thumbnail = `/files/models/${folder}/${filename}`
        } else if (filename === info) {
          model = {
            ...model,
            ...JSON.parse(fileContents),
          }
        }
      })
      return model
    }

    model = null
  })

  return models.filter((a) => a)
}

export default function handler(req, res) {
  const models = getAllModels()

  res.status(200).json(models)
}
