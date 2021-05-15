import { GetObjectCommand } from '@aws-sdk/client-s3'
import { s3 } from '../../utils/s3'
import { streamToString } from '../../utils/streamToString'
import { info } from '../filenames'

export const getTeam = async (slug) => {
  console.log(`market-assets/team/${slug}/${info}`)
  const data = await s3.send(
    new GetObjectCommand({
      Bucket: 'market-assets',
      Key: `market-assets/teams/${slug}/${info}`,
    })
  )

  const body = await streamToString(data.Body)
  const creator = JSON.parse(body)

  return creator
}
