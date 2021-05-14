import { getAllAssetType } from '../../api/[type]'

export const getAllCategories = async (assetType) => {
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
