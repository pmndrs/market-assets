import { getAllAssetLinks } from '../../../utils/endpoints/paths'
import { getAllCategories } from '../../../utils/endpoints/categories'
import { getCreator } from '../../../utils/endpoints/creator'
import { getTeam } from '../../../utils/endpoints/team'
import { getAsset } from '../../../utils/endpoints/asset'

export default async function handler(req, res) {
  const assetType = req.query.type
  const name = req.query.name

  if (name === 'paths') {
    const paths = await getAllAssetLinks(assetType)
    res.status(200).json(paths)
  } else if (name === 'categories') {
    const paths = await getAllCategories(assetType)
    res.status(200).json(paths)
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
