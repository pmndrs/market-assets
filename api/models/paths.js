import path from 'path'
import fs from 'fs'

export const getAllModelLinks = () => {
  const resources = path.join(__dirname, '../../files/models/')
  const folders = fs.readdirSync(resources)
  const models = folders
    .filter((folder) => {
      const newPath = path.join(resources, folder)
      return fs.statSync(newPath).isDirectory()
    })
    .map((a) => `/model/${a}`)

  return models
}

export default function handler(req, res) {
  const paths = getAllModelLinks()

  res.status(200).json(paths)
}
