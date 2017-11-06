const compactJSON = require('json-stringify-pretty-compact')
const fs = require('fs')
const renderSvg = require('./lib/renderSvg')
const data = require('../meta/_loaded.json')

console.time('Rendering')

Promise.all(data.map(d => renderSvg(d.data))).then(files => {
  files.forEach((f, i) => {
    data[i].hash = f.hash
    data[i].pixels = f.pixels
  })

  console.timeEnd('Rendering')

  fs.writeFileSync('meta/_rendered.json', compactJSON(data, {maxLength: 2048}))
})
