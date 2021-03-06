const fs = require('fs')
const _ = require('lodash')
const compact = require('json-stringify-pretty-compact')
const meta = require('../meta/_rendered.json')
const patch = require('./config/patch.conf')
const duplicates = require('./config/duplicates.conf')
let similar = require('../meta/_similar.json')

console.log('Adding IDs')
meta.forEach((m, i) => (m.id = i))

console.log('Linking duplicates')
let count = 0

Object.keys(duplicates.matches).forEach(m => {
  const n = duplicates.matches[m]

  const a = (meta.find(d => d.name === m && d.source === 'Google') || meta.find(d => d.name === m && d.source !== 'Google')).id
  let b = (meta.find(d => d.name === n && d.source !== 'Google') || meta.find(d => d.name === n && d.source === 'Google'))

  if (b) {
    b = b.id
  } else {
    return
  }

  const aa = Math.min(a, b)
  const bb = Math.max(a, b)

  const f = similar.find(d => (d[0] === aa) && (d[1] === bb))

  if (!f) {
    console.log('Adding duplicate', m, '-->', n)
    similar.push([aa, bb, 1])
  } else {
    f[2] = 1
    console.log('Replacing duplicate', m, '-->', n)
  }
})

similar.forEach(testDupl)

function testDupl (d) {
  const a = meta[d[0]]
  const b = meta[d[1]]

  const exact = ((d[2] === 0) && !(a.source === 'Light' || b.source === 'Light')) || (duplicates && duplicates(a, b, d[2]))

  // console.log('Matching', a.name, b.name, exact)

  if (exact) {
    d.delete = true
    if (a.source === b.source) {
      if (b.name.length <= a.name.length) {
        link(a, b, exact)
      } else {
        link(b, a, exact)
      }
    } else if (a.source === 'Community') {
      link(a, b, exact)
    } else {
      link(b, a, exact)
    }
  }
}

similar = similar.filter(d => !d.delete)

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
  b.version = m.version
  b.pixels = b.link >= 0 ? undefined : m.pixels
  b.exact = m.exact
  b.border = require('./lib/hash').border(m.hash)
  b.frame = Math.min.apply(null, b.border)

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
    b.data = m.exact !== true ? m.data : undefined
  } else {
    b.data = m.data
  }

  return b
})

similar = similar.filter(d => d[2] > 0).filter(d => !(meta[d[0]].link >= 0) && !(meta[d[1]].link >= 0))

bundle.forEach((d, i) => {
  d.name = d.name.replace(/^(\d)/, ' $1').replace(/^export$/, ' export').replace(/^import$/, ' import')

  if (d.source === 'Community' && d.author === 'Google') {
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

  if (d.tags) {
    d.tags = _.uniq(d.tags.map(i => i.toLowerCase()))
  }

  patch.extract['*'].forEach(p => {
    const t = Array.isArray(p) ? p[0] : p
    const v = Array.isArray(p) ? p[1] : p
    let s = null

    if (typeof t === 'function') {
      s = t(d.name)
    } else if (d.name.includes(t)) {
      s = v
    }

    if (s) {
      bundle[i].tags = d.tags || []

      if (d.tags.indexOf(s) === -1) {
        d.tags.push(s)
      }
    }
  })
})

console.log('Writing meta/meta.json')
fs.writeFileSync('meta/meta.json', compact(bundle, { maxLength: 4096 }))

console.log('Writing meta/similar.json')
fs.writeFileSync('meta/similar.json', JSON.stringify(similar))

function link (a, b, exact) {
  while (b.link) {
    b = meta[b.link]
  }

  if (a.link >= 0 && (meta[a.link].name === a.name)) {
    console.log(`Skipping: ${a.name} (${a.source}) --> ${b.name} (${b.source})`)
    return
  }

  console.log(`Linking: ${++count}. ${a.name} (${a.source}) --> ${b.name} (${b.source})`)

  a.exact = exact
  a.link = b.id
}
