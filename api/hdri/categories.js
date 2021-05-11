import { getAllHdris } from './'

const getAllCategories = () => {
  const models = getAllHdris()
  const categories = models.reduce((acc, curr) => {
    const cat = curr.category
    if (acc[cat]) {
      acc[cat].hdris.concat(acc)
    } else {
      acc[cat] = {
        name: cat,
        hdris: [curr],
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
