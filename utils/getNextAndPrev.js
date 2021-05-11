import fs from 'fs'
import omit from 'lodash.omit'
import path from 'path'

const getDirectories = (source) =>
  fs
    .readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)

const omitData = (data) => {
  return omit(data, ['category', 'license', 'creator'])
}

export const getNextAndPrev = (folder, name) => {
  const allDirs = getDirectories(folder)
  const currentIndex = allDirs.findIndex((n) => n === name)
  const [nextDir, prevDir] = [
    allDirs[currentIndex + 1],
    allDirs[currentIndex - 1],
  ]
  let data = {}
  if (currentIndex < allDirs.length - 1) {
    const nextInfoPath = path.join(folder, nextDir, 'info.json')
    const nextData = JSON.parse(fs.readFileSync(nextInfoPath, 'utf-8'))
    data.next = {
      url: nextDir,
      ...omitData(nextData),
    }
  }
  if (currentIndex > 0) {
    const prevInfoPath = path.join(folder, prevDir, 'info.json')
    const prevData = JSON.parse(fs.readFileSync(prevInfoPath, 'utf-8'))
    data.prev = {
      url: prevDir,
      ...omitData(prevData),
    }
  }

  return data
}
