const fs = require('fs')
const meta = require('../meta/meta.json')
const mkdirp = require('mkdirp')
// let compact = require('json-stringify-pretty-compact')

mkdirp.sync('icons')

let index = meta.reduce((r, m) => {
  r[m.name.replace(/ /g, '_')] = m.data || meta[m.link].data
  return r
}, {})

index = Object.keys(index).sort().reduce((r, name) => {
  r[name] = index[name]
  return r
}, {})

// fs.writeFileSync('index.json', compact(index, {maxLength: 1024}))

let ind = ['/* eslint-disable camelcase */']

meta.map(d => d.name).sort().forEach(k => {
  let m = meta.find(d => d.name === k)
  let n = m.name.replace(/ /g, '_')

  let f

  if (m.link >= 0) {
    const o = meta[m.link].name.replace(/ /g, '_')
    let t = `export {default} from './${o}'`
    f = `icons/${n}.js`
    fs.writeFile(f, t, () => {})
  } else {
    f = `icons/${n}.js`
    fs.writeFile(f, `export default ${JSON.stringify(m.data)}`, () => {})
  }

  ind.push(`export {default as ${n}} from './icons/${n}'`)
})

fs.writeFile('index.js', ind.join('\n'), () => {})
