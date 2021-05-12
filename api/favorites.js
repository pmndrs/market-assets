import path from 'path'
import fs from 'fs'
import { thumbnail, info } from '../utils/filenames'

const isHDRI = (type) => type === 'hdri'

export default function handler(req, res) {
  const favs = req.query.favs.split(',').map((asset) => {
    const [type, name] = asset.split('/')

    return {
      type: isHDRI(type) ? type : type + 's',
      name,
    }
  })

  const favorites = favs.map((fav) => {
    let asset = {}
    const assetPath = path.join(__dirname, `../files/${fav.type}/${fav.name}`)

    if (fs.statSync(assetPath).isDirectory()) {
      // eslint-disable-next-line array-callback-return
      fs.readdirSync(assetPath).map((filename) => {
        const filePath = path.join(assetPath, filename)
        const fileContents = fs.readFileSync(filePath, 'utf-8')

        asset.link = `https://api.market.pmnd.rs/materials/material?name=${fav.type}`
        asset.id = `${isHDRI(fav.type) ? fav.type : fav.type.slice(0, -1)}/${
          fav.name
        }`

        if (filename === thumbnail) {
          asset.thumbnail = `/files/${fav.type}/${fav.name}/${filename}`
        }
        if (filename === info) {
          asset = {
            ...asset,
            ...JSON.parse(fileContents),
          }
        }
      })
      return asset
    }
  })

  res.status(200).json(favorites)
}
