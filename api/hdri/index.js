import path from 'path'
import fs from 'fs'
import { getSize } from '../../utils/getSize'

export const getAllHdris = () => {
  const resources = path.join(__dirname, '../../files/hdri/')
  const folders = fs.readdirSync(resources)
  // eslint-disable-next-line array-callback-return
  const hdris = folders.map((folder) => {
    let hdri = {}
    const newPath = path.join(resources, folder)
    if (fs.statSync(newPath).isDirectory()) {
      // eslint-disable-next-line array-callback-return
      fs.readdirSync(newPath).map((filename) => {
        const filePath = path.join(resources, folder, filename)
        const fileContents = fs.readFileSync(filePath, 'utf-8')
        if (filename.includes('.hdr')) {
          const { size } = getSize(filePath)
          hdri.size = size
          hdri.file = `/files/hdri/${folder}/${filename}`
        }
        hdri.url = folder
        if (filename.includes('.png') || filename.includes('.jpg')) {
          hdri.image = `/files/hdri/${folder}/${filename}`
        } else if (filename.includes('.json')) {
          hdri.info = JSON.parse(fileContents)
        }
      })
      return hdri
    }

    hdri = null
  })

  return hdris.filter((a) => a)
}

export default function handler(req, res) {
  const hdris = getAllHdris()

  res.status(200).json(hdris)
}
