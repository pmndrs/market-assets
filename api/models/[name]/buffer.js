import path from 'path'
import fs from 'fs'

const getBuffer = (name) => {
  const resources = path.join(__dirname, '../../../files/models/')
  const newPath = path.join(resources, name)
  let buffer
  if (fs.statSync(newPath).isDirectory()) {
    // eslint-disable-next-line array-callback-return
    fs.readdirSync(newPath).map((filename) => {
      const filePath = path.join(resources, name, filename)
      const fileContents = fs.readFileSync(filePath, 'utf-8')

      if (filename.includes('_textures')) {
        buffer = fileContents
      } else {
        if (!buffer) buffer = fileContents
      }
    })
    return buffer
  }

  return buffer
}

export default function handler(req, res) {
  const model = getBuffer(req.query.name)
  res.status(200).json(JSON.parse(model))
}
