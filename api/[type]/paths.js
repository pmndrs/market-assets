import { s3 } from '../../utils/s3'
import { ListObjectsCommand } from '@aws-sdk/client-s3'

export const getAllMaterialLinks = async (assetType) => {
  const data = await s3.send(
    new ListObjectsCommand({
      Bucket: 'market.pmnd.rs',
      Prefix: `market-assets/${assetType}/`,
      Delimiter: '/',
    })
  )
  const folders = data.CommonPrefixes
  const assets = folders.map((a) => {
    const url = a.Prefix.split('market-assets/')[1]
    const [type, folder] = url.split('/')

    return `/${type.slice(0, -1)}/${folder}`
  })

  return assets
}

export default async function handler(req, res) {
  const paths = await getAllMaterialLinks(req.query.type)

  res.status(200).json(paths)
}
