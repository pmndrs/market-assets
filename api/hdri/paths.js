import path from 'path'
import fs from 'fs'

export const getAllHdriLinks = () => {
  const resources = path.join(__dirname, '../../files/hdri/')
  const folders = fs.readdirSync(resources)
  const hdris = folders
    .filter((folder) => {
      const newPath = path.join(resources, folder)
      return fs.statSync(newPath).isDirectory()
    })
    .map((a) => `/hdris/${a}`)

  return hdris
}

export default function handler(req, res) {
  const paths = getAllHdriLinks()

  res.status(200).json(paths)
}
