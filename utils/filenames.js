export const thumbnail = 'thumbnail.png'
export const thumbnailJpg = 'thumbnail.jpg'
export const model = 'model.gltf'
export const info = 'info.json'
export const isMaterialOrHdr = (filename) =>
  filename.includes('.hdr') ||
  filename.includes('.exr') ||
  (filename.includes('.jpg') && filename !== thumbnailJpg)
