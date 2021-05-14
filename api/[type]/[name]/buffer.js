import { model } from '../../../utils/filenames'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { streamToString } from '../../../utils/streamToString'
import { s3 } from '../../../utils/s3'

const getBuffer = async (assetType, name) => {
  const data = await s3.send(
    new GetObjectCommand({
      Bucket: 'market.pmnd.rs',
      Key: `market-assets/${assetType}/${name}/${model}`,
    })
  )
  const body = await streamToString(data.Body)
  const info = JSON.parse(body)

  return info
}

export default async function handler(req, res) {
  const assetType = req.query.type
  const name = req.query.name
  const model = await getBuffer(assetType, name)
  res.status(200).json(model)
}
