import path from 'path'
import fs from 'fs'

const getTeam = (slug) => {
  const filePath = path.join(__dirname, '../../files/teams/', slug, 'info.json')
  const fileContents = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(fileContents)
}

export default function handler(req, res) {
  const team = getTeam(req.query.slug)

  res.status(200).json(team)
}
