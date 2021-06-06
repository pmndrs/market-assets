require('dotenv').config()
import { getAssetFavorites } from '../../utils/endpoints/favorite'
import { supabase } from '../../utils/initSupabase'
import { cleanSupabaseData } from '../../utils/queries/cleanSupaBaseData'
import { listData } from '../../utils/queries/list'

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate')
  const assetType = req.query.type
  if (assetType === 'favorites') {
    const team = await getAssetFavorites(req.query.favs)
    res.status(200).json(team)
  } else {
    const { data, error } = await supabase
      .from(assetType)
      .select(listData[assetType])
      .order('id')
    if (error) {
      console.log(error)
    }
    const value = cleanSupabaseData(data)
    res.status(200).json(value)
  }
}
