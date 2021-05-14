import { s3 } from '../s3'
import { ListObjectsCommand } from '@aws-sdk/client-s3'

export const getAllAssetLinks = async (assetType) => {
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
