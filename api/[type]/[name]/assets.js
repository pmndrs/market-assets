import { info } from '../../../utils/filenames'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { streamToString } from '../../../utils/streamToString'
import { s3 } from '../../../utils/s3'
import { getAllAssetType } from '..'

export const getInfo = async (type, slug) => {
  const data = await s3.send(
    new GetObjectCommand({
      Bucket: 'market-assets',
      Key: `market-assets/${type}/${slug}/${info}`,
    })
  )

  const models = (await getAllAssetType('models')).filter(
    (model) => model[type.slice(0, -1)] === slug
  )
  const hdris = (await getAllAssetType('hdris')).filter(
    (hdri) => hdri[type.slice(0, -1)] === slug
  )
  const materials = (await getAllAssetType('materials')).filter(
    (material) => material[type.slice(0, -1)] === slug
  )

  const body = await streamToString(data.Body)
  const creator = JSON.parse(body)

  return {
    ...creator,
    models,
    hdris,
    materials,
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate')
  const assetType = req.query.type
  if (assetType !== 'creators' && assetType !== 'teams') {
    res.status(404).json({})
    return
  }
  const name = req.query.name
  if (assetType === 'creators') {
    const data = await getInfo(assetType, name)
    res.status(200).json(data)
  }

  if (assetType === 'teams') {
    const data = await getInfo(assetType, name)
    res.status(200).json(data)
  }
}
