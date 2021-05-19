require('dotenv').config()

import { info, model, thumbnail, thumbnailJpg } from '../filenames'
import { omit } from 'lodash'
import { s3 } from '../s3'
import { streamToString } from '../streamToString'
import { getSize } from '../getSize'
import { getCreator } from './creator'
import { getTeam } from './team'
import fetch from 'node-fetch'
import { API, CDN_URL, FATHOM } from '../urls'
import { ListObjectsCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { NodeIO } from '@gltf-transform/core'
import { inspect } from '@gltf-transform/functions'
import {
  DracoMeshCompression,
  MaterialsUnlit,
  Unlit,
} from '@gltf-transform/extensions'
import draco3d from 'draco3dgltf'

const getViews = async (id) => {
  const data = await fetch(FATHOM).then((a) => a.json())

  const assetViews = data.find((d) => d.pathname === `/${id}`) || {}

  return assetViews
}

export const getAsset = async (assetType, name) => {
  try {
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
      const id = `${assetType.slice(0, -1)}/${folder}`
      const returnObj = {
        ...current,
        id,
        link: `${API}${assetType}/${folder}`,
        lastModified: curr.LastModified,
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
          try {
            const io = new NodeIO()
              .registerExtensions([DracoMeshCompression, MaterialsUnlit])
              .registerDependencies({
                'draco3d.decoder': await draco3d.createDecoderModule(),
                'draco3d.encoder': await draco3d.createEncoderModule(),
              })
            const json = await fetch(asset.file).then((rsp) => rsp.json())
            const document = io.readJSON({ json })
            document
              .createExtension(DracoMeshCompression)
              .setRequired(true)
              .setEncoderOptions({
                method: DracoMeshCompression.EncoderMethod.EDGEBREAKER,
                encodeSpeed: 5,
                decodeSpeed: 5,
              })
            document.createExtension(MaterialsUnlit)
            const report = inspect(document)
            console.log(report)
          } catch (e) {
            console.log('-----------', e, '-----------')
          }
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

          if (typeof info.creator === 'string') {
            info.creator = await getCreator(info.creator)
          }

          if (typeof info.team === 'string') {
            info.team = await getTeam(info.team)
          }

          if (info.maps) {
            info.maps = Object.keys(info.maps).reduce((acc, curr) => {
              acc[curr] = CDN_URL(
                `market-assets/${type}/${folder}/${info.maps[curr]}`
              )

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
    const assetViews = await getViews(assets[0].id)
    return {
      ...assets[0],
      views: parseInt(assetViews.views || 0),
    }
  } catch (err) {
    console.log('Error', err)
  }
}
