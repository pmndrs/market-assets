import { getAllMaterials } from './'

const getAllCategories = () => {
  const materials = getAllMaterials()
  const categories = materials.reduce((acc, curr) => {
    const cat = curr.category
    if (acc[cat]) {
      acc[cat].materials.concat(acc)
    } else {
      acc[cat] = {
        name: cat,
        materials: [curr],
      }
    }
    return acc
  }, {})

  return Object.values(categories)
}

export default function handler(req, res) {
  const categories = getAllCategories()

  res.status(200).json(categories)
}
