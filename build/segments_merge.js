const similar = require('../meta/_similar_segments')
let meta = require('../meta/_meta_segments')
let icons = require('../meta/meta')
let fs = require('fs')

meta.forEach((d, i) => {
  d.index = i
  d.paths = [d.id]
})

similar.forEach((d, i) => {
  if(d[2] > 42) {
    return
  }

  let a = meta[d[0]]
  let b = meta[d[1]]

  while (meta[b.merged]) {
    // console.log(b.index, 'links to', b.merged)
    b = meta[b.merged]
  }

  if(a.icons && b.icons) {
    console.log(a.index, 'linking to', b.index)
    merge(a, b)
  }
})

meta = meta.filter(d => d.icons && d.icons.length > 3)

const max = Math.max.apply(null, meta.map(d => d.paths.length))
const maxIcons = Math.max.apply(null, meta.map(d => d.icons.length))

const w = (max + maxIcons) * 24
const h = meta.length * 24

let sum = meta.reduce((sum, m) => {
  sum += m.icons.length
  return sum
}, 0)

console.log(meta.length, max, sum, maxIcons)

const preview = `<svg xmlns="http://www.w3.org/2000/svg" width="${w*0.5}" height="${h*0.5}" viewBox="0 0 ${w} ${h}">${

  meta.map((meta, y) => {
    return meta.paths.map((path, x) => {
      return `<path d="${path}" transform="translate(${x*24},${y * 24})"/>`
    }).join('') +
    meta.icons.map((icon, x) => {
      return `<path d="${icons[icon].data}" transform="translate(${(max+x)*24},${y * 24})"/>`
    }).join('')
  }).join('')
  
}</svg>`

fs.writeFileSync('./meta/segment_groups.svg', preview)
fs.writeFileSync('./meta/segment_groups.json', JSON.stringify(meta))

function merge (from, to) {
  if(from === to) {
    console.log(from.index, to.index, '===')
  }

  from.icons.forEach(d => {
    if(to.icons.indexOf(d) === -1) {
      to.icons.push(d)
    }
  })

  if(to.paths.indexOf(from.id) === -1) {
    to.paths.push(from.id)
  }

  from.merged = to.index
  delete from.icons
}
