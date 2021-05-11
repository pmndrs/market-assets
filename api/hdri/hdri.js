import path from 'path'
import fs from 'fs'
import { getSize } from '../../utils/getSize'
import { getNextAndPrev } from '../../utils/getNextAndPrev'

const getHdri = (name) => {
  const resources = path.join(__dirname, '../../files/hdri/')
  const nextAndPrev = getNextAndPrev(resources, name)
  var hdri = { ...nextAndPrev }
  const newPath = path.join(resources, name)

  if (fs.statSync(newPath).isDirectory()) {
    // eslint-disable-next-line array-callback-return
    fs.readdirSync(newPath).map((filename) => {
      const filePath = path.join(resources, name, filename)
      const fileContents = fs.readFileSync(filePath, 'utf-8')

      if (filename.includes('.hdr')) {
        const { size } = getSize(filePath)
        hdri.size = size
        hdri.file = `/files/hdri/${name}/${filename}`
      }
      hdri.url = name
      if (filename.includes('.png') || filename.includes('.jpg')) {
        hdri.image = `/files/hdri/${name}/${filename}`
      } else if (filename.includes('.json')) {
        hdri.info = JSON.parse(fileContents)
      }
    })
    return hdri
  }

  return hdri
}

export default function handler(req, res) {
  const hdri = getHdri(req.query.name)

  res.status(200).json(hdri)
}
