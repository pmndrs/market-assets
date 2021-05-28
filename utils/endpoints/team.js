import { GetObjectCommand } from '@aws-sdk/client-s3'
import { s3 } from '../../utils/s3'
import { streamToString } from '../../utils/streamToString'
import { info } from '../filenames'
import { CDN_URL } from '../urls'

export const getTeam = async (slug) => {
  const data = await s3.send(
    new GetObjectCommand({
      Bucket: 'market-assets',
      Key: `market-assets/teams/${slug}/${info}`,
    })
  )

  const body = await streamToString(data.Body)
  const team = JSON.parse(body)

  if (team.logo) {
    return {
      ...team,
      logo: CDN_URL(`market-assets/teams/${slug}/${team.logo}`),
    }
  } else {
    return team
  }
}
