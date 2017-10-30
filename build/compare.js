const meta = require('../meta/_meta.json')
const fs = require('fs')
const base = 24
const limit = base * base / 6

let similar = []
let l = meta.length

for (let x = 0; x < l; x++) {
  for (let y = x + 1; y < l; y++) {
    similar.push([x, y, getDelta(meta[x].hash, meta[y].hash)])
  }
}

similar = similar.filter(d => d[2] < limit).sort((a, b) => {
  return a[2] - b[2]
})

fs.writeFileSync('meta/_similar.json', JSON.stringify(similar))

function getDelta (a, b) {
  if (a === b) {
    return 0
  }

  let d = 0

  for (let i = 0; i < a.length; i++) {
    d += getSubDelta(a[i], b[i])
  }

  return d
}

function getSubDelta (a, b) {
  if (a === b) {
    return 0
  }

  let x = parseInt(a, 16) ^ parseInt(b, 16)
  let d = 0

  while (x) {
    d += x & 1
    x = x >>> 1
  }

  return d
}
