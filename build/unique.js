const fs = require('fs')
const _ = require('lodash')
let meta = require('../meta/meta.json')
let similar = require('../meta/similar.json')
let compact = require('json-stringify-pretty-compact')

let count = 0

meta = meta.filter(m => {
  if (m.link >= 0 && m.name === meta[m.link].name) {
    console.log(`${++count}. ${m.name}`)
    const t = meta[m.link]

    if (m.aliases) {
      t.aliases = _.uniq((t.aliases || []).concat(m.aliases))
    }

    if (m.tags) {
      t.tags = _.uniq((t.tags || []).concat(m.tags))
    }

    if (m.category) {
      if (t.category) {
        t.tags = _.uniq((t.tags || []).concat([m.category]))
      } else {
        t.category = m.category
      }
    }

    return false
  } else {
    return true
  }
})

const names = {}

meta.reverse()

meta.forEach(m => {
  if (names[m.name]) {
    console.log('duplicate', m.name)

    while (names[m.name]) {
      m.name += ' alt'
    }
  }

  names[m.name] = true
})

meta.reverse()

const ids = {}

meta.forEach((m, i) => {
  ids[m.id] = i
  m.id = i
})

meta.forEach((m, i) => {
  if (m.link >= 0) {
    m.link = ids[m.link]
  }
})

meta.forEach((m, i) => {
  if (m.link >= 0 && m.author === 'Google legacy' && meta[m.link].author === 'Google') {
    m.author = 'Google'
  }
})

similar = similar.map(d => [ids[d[0]], ids[d[1]], d[2]])

fs.writeFileSync('meta/meta.json', compact(meta, {maxLength: 4096}))
fs.writeFileSync('meta/similar.json', JSON.stringify(similar))
