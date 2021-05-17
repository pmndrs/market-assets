require('dotenv').config()

import { info, model, thumbnail, thumbnailJpg } from '../filenames'
import { omit } from 'lodash'
import { s3 } from '../s3'
import { streamToString } from '../streamToString'
import { getSize } from '../getSize'
import { API, CDN_URL } from '../urls'

const { ListObjectsCommand, GetObjectCommand } = require('@aws-sdk/client-s3')

export const getAssetFavorites = async (favs) => {
  try {
    const favorites = favs.split(',').map((fav) => {
      const [type, name] = fav.split('/')

      return `${type}s/${name}`
    })
    const favData = favorites.map(async (fav) => {
      const [assetType, name] = fav.split('/')
      const data = await s3.send(
        new ListObjectsCommand({
          Bucket: 'market-assets',
          Prefix: `market-assets/${assetType}/${name}/`,
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
          link: `${API}${assetType}/${folder}`,
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
            asset.thumbnail = CDN_URL(file.Key)
          }

          if (fileName === model) {
            const { size, highPoly } = getSize(file.Size, fileName)
            asset.size = size
            asset.highPoly = highPoly
            asset.file = CDN_URL(file.Key)
          }
          if (
            fileName.includes('.hdr') ||
            fileName.includes('.exr') ||
            (fileName.includes('.jpg') && fileName !== thumbnailJpg)
          ) {
            const { size } = getSize(file.Size, fileName)
            asset.size = size
            asset.file = CDN_URL(file.Key)
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

      return assets[0]
    })

    const data = await Promise.all(favData)

    return data
  } catch (err) {
    console.log('Error', err)
  }
}
