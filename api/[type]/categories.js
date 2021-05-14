import { getAllAssetType } from './'

const getAllCategories = async (assetType) => {
  const assets = await getAllAssetType(assetType)
  const categories = assets.reduce((acc, curr) => {
    const cat = curr.category
    if (acc[cat]) {
      const currentCat = acc[cat]
      currentCat[assetType].concat(curr)
    } else {
      acc[cat] = {
        name: cat,
        [assetType]: [curr],
      }
    }
    return acc
  }, {})

  return Object.values(categories)
}

export default async function handler(req, res) {
  const assetType = req.query.type
  const categories = await getAllCategories(assetType)

  res.status(200).json(categories)
}
