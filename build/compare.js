const fs = require('fs')
const meta = require('../meta/_rendered.json')
const conf = require('./config/icon.conf')
const maxLimit = conf.distance

console.time('Comparing')

let similar = []
let l = meta.length

const m1 = 0x55555555
const m2 = 0x33333333
const m4 = 0x0f0f0f0f
const m8 = 0x00ff00ff
const m16 = 0x0000ffff

function count (x) {
  x = (x & m1) + ((x >> 1) & m1)
  x = (x & m2) + ((x >> 2) & m2)
  x = (x & m4) + ((x >> 4) & m4)
  x = (x & m8) + ((x >> 8) & m8)
  x = (x & m16) + ((x >> 16) & m16)
  return x
}

for (let x = 0; x < l; x++) {
  for (let y = x + 1; y < l; y++) {
    const limit = Math.min(maxLimit, Math.min(meta[x].pixels, meta[y].pixels))
    const diff = Math.abs(meta[x].pixels - meta[y].pixels)

    if (diff > limit) {
      continue
    }

    const d = getDelta(meta[x].hash, meta[y].hash, limit)

    if (d < limit) {
      similar.push([x, y, d])
    }
  }
}

similar.sort((a, b) => {
  return a[2] - b[2]
})

console.timeEnd('Comparing')

fs.writeFileSync('meta/_similar.json', JSON.stringify(similar))

function getDelta (a, b, limit) {
  if (a === b) {
    return 0
  }

  let d = 0

  for (let i = 0; i < a.length; i += 8) {
    d += count(parseInt(a.substr(i, 8), 16) ^ parseInt(b.substr(i, 8), 16))

    if (d >= limit) {
      return d
    }
  }

  return d
}
