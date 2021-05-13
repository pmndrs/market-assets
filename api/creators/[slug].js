import path from 'path'
import fs from 'fs'

const getCreator = (slug) => {
  const filePath = path.join(__dirname, '../../files/creators/', slug, 'info.json')
  const fileContents = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(fileContents)
}

export default function handler(req, res) {
  const creator = getCreator(req.query.slug)

  res.status(200).json(creator)
}
