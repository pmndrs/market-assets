import { omit } from 'lodash'

require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')
const { glob } = require('glob')
// const fsExtra = require('fs-extra')
const { getAsset } = require('../utils/endpoints/asset')
// const CDN_URL = (key) =>
//   `https://market-assets.fra1.cdn.digitaloceanspaces.com/${key}`
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
async function delay(ms) {
  // return await for better async stack trace support in case of errors.
  return await new Promise((resolve) => setTimeout(resolve, ms))
}

export default async function handler(req, res) {
  const files = glob.sync('files/models/**/*.json', {})
  const all = files.map(async (file) => {
    try {
      const url = file.split('models/')[1].split('/info.json')[0]
      await delay(80000)
      const a = await getAsset('models', url)
      return a
    } catch (e) {
      console.log(e)
      //
    }
  })

  const lo = await Promise.all(all)
  const aaaa = lo.map(async (a) => {
    if (!a) return
    await delay(200)
    const creator = await supabase
      .from('creators')
      .select('id')
      .eq('name', a.creator.length ? a.creator[0].name : a.creator.name)
    await delay(200)
    const team = a.team
      ? await supabase.from('teams').select('id').eq('url', a.team.url)
      : { data: [{ id: null }] }

    if (!creator.data.length) {
      await supabase.from('creators').insert(a.creator)
    }
    if (!team.data.length) {
      await supabase.from('teams').insert(a.team)
    }
    return {
      ...omit(a, ['id', 'lastModified', 'link']),
      creator: creator.data[0].id,
      team: team.data[0].id,
      _id: a.id,
    }
  })
  const aaaaaa = await Promise.all(aaaa)

  const result = await supabase
    .from('materials')
    .insert(aaaaaa.filter((exists) => exists))
  res.json(result)
}
