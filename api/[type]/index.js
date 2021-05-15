require('dotenv').config()

import { info, model, thumbnail, thumbnailJpg } from '../../utils/filenames'
import { omit } from 'lodash'
import { s3 } from '../../utils/s3'
import { streamToString } from '../../utils/streamToString'
import { getAssetFavorites } from '../../utils/endpoints/favorite'
import { getSize } from '../../utils/getSize'
const { ListObjectsCommand, GetObjectCommand } = require('@aws-sdk/client-s3')

const url = (key) =>
  `https://market-assets.fra1.cdn.digitaloceanspaces.com/${key}`

export const getAllAssetType = async (assetType) => {
  try {
    const data = await s3.send(
      new ListObjectsCommand({
        Bucket: 'market-assets',
        Prefix: `market-assets/${assetType}/`,
      })
    )

    const values = data.Contents.reduce((acc, curr) => {
      // eslint-disable-next-line no-unused-vars
      const [_, __, folder, fileName] = curr.Key.split('/')
      const current = omit(curr, ['Owner', 'StorageClass'])
      if (folder === '.DS_Store' || fileName === '.DS_Store') return acc
      const returnObj = {
        ...current,
        id: `${assetType.slice(0, -1)}/${folder}`,
        link: `https://api.market-assets/${assetType}/${folder}`,
      }
      if (acc[folder]) {
        acc[folder] = acc[folder].concat(returnObj)
      } else {
        acc[folder] = [returnObj]
      }

      return acc
    }, {})
    const filesValues = Object.values(values).map(async (files) => {
      const singleFile = files.map(async (file) => {
        // eslint-disable-next-line no-unused-vars
        const [_, type, folder, fileName] = file.Key.split('/')
        let asset = { ...omit(file, ['ETag', 'LastModified', 'Key', 'Size']) }
        if (fileName === thumbnail || fileName === thumbnailJpg) {
          asset.thumbnail = url(file.Key)
        }

        if (fileName === model) {
          const { size, highPoly } = getSize(file.Size, fileName)
          asset.size = size
          asset.highPoly = highPoly
        }
        if (
          fileName.includes('.hdr') ||
          fileName.includes('.exr') ||
          (fileName.includes('.jpg') && fileName !== thumbnailJpg)
        ) {
          const { size } = getSize(file.Size, fileName)
          asset.size = size
        }
        if (fileName === info) {
          const data = await s3.send(
            new GetObjectCommand({
              Bucket: 'market-assets',
              Key: file.Key,
            })
          )
          const body = await streamToString(data.Body)
          const info = JSON.parse(body)

          if (info.maps) {
            info.maps = Object.keys(info.maps).reduce((acc, curr) => {
              acc[
                curr
              ] = `https://market-assets.fra1.cdn.digitaloceanspaces.com/market-assets/${type}/${folder}/${info.maps[curr]}`

              return acc
            }, {})
            info.sizes = {}
            Object.values(info.maps).map((link, i) => {
              // const { size } = getSize(file.Size, true)
              const name = Object.keys(info.maps)[i]
              info.sizes[name] = file.Size
              return null
            })
          }
          asset = {
            ...asset,
            ...info,
          }
        }

        return asset
      })
      const allAssets = await Promise.all(singleFile)
      return allAssets.reduce((r, c) => Object.assign(r, c), {})
    })
    const assets = await Promise.all(filesValues)

    return assets
  } catch (err) {
    console.log('Error', err)
  }
}

export default async function handler(req, res) {
  const assetType = req.query.type
  if (assetType === 'favorites') {
    const team = await getAssetFavorites(req.query.favs)
    res.status(200).json(team)
  } else {
    const assets = await getAllAssetType(assetType)

    res.status(200).json(assets)
  }
}
