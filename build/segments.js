const {SVGPathData, SVGPathDataTransformer, SVGPathDataEncoder, SVGPathDataParser} = require('svg-pathdata')
const meta = require('../meta/meta.json')
const fs = require('fs')
const _ = require('lodash')
const compact = require('json-stringify-pretty-compact')
const render = require('./render.conf')

const segs = meta.reduce((r, icon) => {
  if (icon.link >= 0 || icon.data[0] === '<') {
    return r
  }

  let pd = new SVGPathData(new SVGPathData(icon.data).toAbs().encode())

  pd.commands.reduce((r, command) => {
    let last = r[r.length - 1]

    if (last.length) {
      if (command.type === SVGPathData.MOVE_TO) {
        last = []
        r.push(last)
      }
    }

    last.push(command)
    return r
  }, [[]]).forEach((segment) => {
    let d = new SVGPathData(segment)
    let b = d.getBounds()

    d = d.transform(SVGPathDataTransformer.TRANSLATE(-b.minX, -b.minY))
    b = d.getBounds()
    d = d.encode()

    if (d === 'M0 0V0z' || d === 'M-Infinity -Infinity') {
      return
    }

    d = (new SVGPathData(d)).transform(SVGPathDataTransformer.SCALE(24 / Math.max(b.maxX, b.maxY)))
    d = d.encode()
    r[d] = r[d] || {icons: []}
    r[d].icons.push(icon.id)
  })

  return r
}, {})

// console.log(Object.keys(segs))

fs.writeFileSync('./meta/segments.json', compact(segs, {maxLength: 2048}))

const segKeys = Object.keys(segs)
const ps = 24 * 4
const preview = `<svg xmlns="http://www.w3.org/2000/svg" width="${ps}" height="${ps * segKeys.length}" viewBox="0 0 24 ${24 * segKeys.length}">${
  segKeys.map((k, i) => `<path fill="${['red', 'blue', 'green'][i % 3]}" d="${k}" transform="translate(0,${i * 24})"/>`).join('')
  }</svg>`

fs.writeFileSync('./meta/segments.svg', preview)

const qs = segKeys.map(d => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="${d}"/></svg>`

  return new Promise((resolve) => {
    render.render(svg, (sharp) => {
      sharp
        .threshold(224)
        .raw()
        .toBuffer()
        .then(buf => {
          segs[d].hash = render.hash(buf)
          segs[d].pixels = render.density(buf)
          resolve()
        })
    })
  })
})

const conf = require('./icon.conf')
const maxLimit = conf.distance

Promise.all(qs).then(() => {
  let similar = []
  const meta = segKeys.map(id => ({id, ...segs[id]}))
  let l = meta.length

  for (let x = 0; x < l; x++) {
    for (let y = x + 1; y < l; y++) {
      if(meta[x].hash === meta[y].hash) {
        similar.push([x, y, 0])
        console.log(x, y, '===')
        continue
      }

      const limit = Math.min(maxLimit, Math.min(meta[x].pixels, meta[y].pixels))
      const diff = Math.abs(meta[x].pixels - meta[y].pixels)

      if(diff > limit) {
        continue
      }

      // const limit = 24 * 12
      const d = getDelta(meta[x].hash, meta[y].hash, limit)

      if (d < limit) {
        similar.push([x, y, d])
        console.log(x, y)
      }
    }
  }

  similar.sort((a, b) => {
    return a[2] - b[2]
  })

  fs.writeFileSync('meta/_similar_segments.json', JSON.stringify(similar))
  fs.writeFileSync('meta/_meta_segments.json', JSON.stringify(meta))
})

function getDelta (a, b, limit) {
  if (a === b) {
    return 0
  }

  let d = 0

  for (let i = 0; i < a.length; i++) {
    d += getSubDelta(a[i], b[i])

    if (d >= limit) {
      return d
    }
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
