const compactJSON = require('json-stringify-pretty-compact')
const { writeFileSync } = require('fs')
const { getHashes } = require('similar-icons')
const items = require('../meta/_loaded.json')

console.time('Rendering')

;(async () => {
  const hashes = await getHashes({ items, toSVG }).then()

  hashes.forEach((f, i) => {
    items[i].hash = f.hash
    items[i].pixels = f.pixels
  })

  console.timeEnd('Rendering')

  writeFileSync('meta/_rendered.json', compactJSON(items, { maxLength: 2048 }))
})()

function pathToSVG (pathOrSvg) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">${
    pathOrSvg[0] === '<' ? `<g>${pathOrSvg}</g>>` : `<path d="${pathOrSvg}"></path>`
  }</svg>`
}

function toSVG ({ data, name }) {
  console.log(name)

  return pathToSVG(data)
}
