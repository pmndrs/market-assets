import { getAllCategories } from '../../../utils/endpoints/categories'
import { getCreator } from '../../../utils/endpoints/creator'
import { getTeam } from '../../../utils/endpoints/team'
import { getAsset } from '../../../utils/endpoints/asset'

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate')
  const assetType = req.query.type
  const name = req.query.name

  if (name === 'categories') {
    const categories = await getAllCategories(assetType)
    res.status(200).json(categories)
  } else if (assetType === 'creators') {
    const creator = await getCreator(name)
    res.status(200).json(creator)
  } else if (assetType === 'teams') {
    const team = await getTeam(name)
    res.status(200).json(team)
  } else {
    const asset = await getAsset(assetType, name)
    res.status(200).json(asset)
  }
}
