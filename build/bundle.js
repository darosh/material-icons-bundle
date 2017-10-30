const fs = require('fs')
const _ = require('lodash')
const meta = require('../meta/_meta.json')
const patch = require('./patch.conf')
const duplicates = require('./duplicates.conf')
let similar = require('../meta/_similar.json')

meta.forEach((m, i) => (m.id = i))

let reducedSimilar = []

let count = 0
similar.forEach(d => {
  const a = meta[d[0]]
  const b = meta[d[1]]

  if (d[2] === 0 || duplicates(a, b, d[2])) {
    console.log(`${++count}. ${a.name} (${a.source}) === ${b.name} (${b.source})`)

    if (a.source === b.source || a.source === 'Community') {
      link(a, b)
    } else {
      link(b, a)
    }
  } else {
    reducedSimilar.push(d)
  }
})

similar = reducedSimilar

const bundle = meta.map(m => {
  const b = {}

  b.id = m.id
  b.name = m.name
  b.link = m.link
  b.source = m.source
  b.category = m.category
  b.aliases = m.aliases
  b.author = m.author
  b.tags = m.tags

  if (b.tags) {
    b.tags = b.tags.map(d => (patch.tags[d] === null ? false : (patch.tags[d] || d))).filter(d => d)
    b.tags = b.tags.length ? b.tags : undefined
  }

  if (b.link >= 0) {
    let x = b
    while (x.link >= 0) {
      x = meta[x.link]
    }

    b.link = x.id
  } else {
    b.data = m.data
  }

  return b
})

similar = similar.filter(d => d[2] > 0).filter(d => !(meta[d[0]].link >= 0) && !(meta[d[1]].link >= 0))

bundle.forEach((d, i) => {
  d.name = d.name.replace(/^(\d)/, ' $1')

  if(d.source === 'Community' && d.author === 'Google') {
    d.author = 'Google legacy'
  }

  if (d.category) {
    d.tags = _.uniq(d.tags || []).concat([d.category])
    delete d.category
  }

  if (d.aliases) {
    d.aliases = d.aliases.map(d => d.replace(/-/g, ' '))
  }

  if (d.data && d.data[0] === '<') {
    bundle[i].tags = d.tags || []
    d.tags.push('multi-shape')
  }

  patch.extract['*'].forEach(p => {
    const t = Array.isArray(p) ? p[0] : p
    const v = Array.isArray(p) ? p[1] : p

    if (d.name.includes(t)) {
      bundle[i].tags = d.tags || []

      if (d.tags.indexOf(v) === -1) {
        d.tags.push(v)
      }
    }
  })
})

fs.writeFileSync('meta/similar.json', JSON.stringify(similar))
fs.writeFileSync('meta/meta.json', JSON.stringify(bundle))

function link (a, b) {
  while (b.link) {
    b = meta[b.link]
  }

  a.link = b.id
}
