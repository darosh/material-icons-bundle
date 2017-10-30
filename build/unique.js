const fs = require('fs')
const _ = require('lodash')
const compact = require('json-stringify-pretty-compact')
let meta = require('../meta/meta.json')
let similar = require('../meta/similar.json')

let count = 0

console.log('Merging same linked names')

meta = meta.filter(m => {
  if (m.link >= 0 && m.name === meta[m.link].name) {
    console.log(`Merging: ${++count}. ${m.name}`)
    const t = meta[m.link]
    merge(m, t)
    return false
  } else {
    return true
  }
})

update()

const grouped = _.groupBy(meta, 'name')
Object.keys(grouped).filter(d => grouped[d].length > 1).forEach(d => {
  const g = _.groupBy(grouped[d], (d) => {
    while (d.link >= 0) {
      d = meta[d.link]
    }

    return d.id
  })

  if (Object.keys(g).length === 1) {
    // console.log('Same ' + d, grouped[d].length)

    if (grouped[d][0].source === 'Community') {
      merge(grouped[d][0], grouped[d][1])
    } else {
      merge(grouped[d][1], grouped[d][0])
    }
  }
})

meta = meta.filter(d => !d.delete)

console.log('Renaming duplicated names')

const names = {}
meta.forEach(m => {
  if (names[m.name]) {
    if (m.source === 'Google') {
      m = names[m.name]
    }

    const original = m.name

    while (names[m.name]) {
      m.name += ' alt'
    }

    console.log(`Renaming: (${m.source}) ${original} --> ${m.name}`)
  }

  names[m.name] = m
})

console.log('Sorting by name')
meta.sort((a, b) => a.name.localeCompare(b.name))

update()

console.log('Correcting Google legacy authorship')
meta.forEach((m, i) => {
  if (m.link >= 0 && m.author === 'Google legacy' && meta[m.link].author === 'Google') {
    m.author = 'Google'
  }
})

console.log('Writing meta/meta.json')
fs.writeFileSync('meta/meta.json', compact(meta, {maxLength: 4096}))

console.log('Writing meta/similar.json')
fs.writeFileSync('meta/similar.json', JSON.stringify(similar))

function merge (m, t) {
  m.delete = true
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
}

function update () {
  console.log('Updating IDs')
  const ids = {}

  meta.forEach((m, i) => {
    ids[m.id] = i
    m.id = i
  })

  console.log('Updating link IDs')
  meta.forEach((m, i) => {
    if (m.link >= 0) {
      m.link = ids[m.link]
    }
  })

  console.log('Updating similar index IDs')
  similar = similar.map(d => [ids[d[0]], ids[d[1]], d[2]])
}
