import { getSize } from '../../utils/getSize'
import path from 'path'
import fs from 'fs'

export const getAllMaterials = () => {
  const resources = path.join(__dirname, '../../files/materials/')
  const folders = fs.readdirSync(resources)
  // eslint-disable-next-line array-callback-return
  const materials = folders.map((folder) => {
    let material = {}
    const newPath = path.join(resources, folder)
    if (fs.statSync(newPath).isDirectory()) {
      // eslint-disable-next-line array-callback-return
      fs.readdirSync(newPath).map((filename) => {
        const filePath = path.join(resources, folder, filename)
        const fileContents = fs.readFileSync(filePath, 'utf-8')
        material.url = folder

        if (filename.includes('.json')) {
          const info = JSON.parse(fileContents)

          if (info.links) {
            info.sizes = {}
            Object.values(info.links).map((link, i) => {
              const mapLink = path.join(process.cwd(), `files${link}`)
              const { size } = getSize(mapLink, true)
              const name = Object.keys(info.links)[i]
              info.sizes[name] = size
              return null
            })
          }
          material = {
            ...material,
            info,
          }
        }

        if (filename.includes('render.')) {
          material.preview = `/files/materials/${folder}/${filename}`
        } else {
          if (filename.includes('.exr') || filename.includes('.jpg')) {
            const { size } = getSize(filePath)
            material.size = size
          }
        }
      })
      return material
    }

    material = null
  })

  return materials.filter((a) => a)
}

export default function handler(req, res) {
  const materials = getAllMaterials()

  res.status(200).json(materials)
}
