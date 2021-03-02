const fs = require('fs')
const meta = require('../meta/meta.json')
const mkdirp = require('mkdirp')

mkdirp.sync('icons')

console.log('Underscoring names')
meta.forEach(m => { m.name = m.name.replace(/ /g, '_') })

const ind = ['/* eslint-disable camelcase */']

meta.forEach(m => {
  const n = m.name
  const f = `icons/${n}.js`

  if (m.link >= 0) {
    const o = meta[m.link].name
    console.log(`Linking: ${n} --> ${o}`)
    fs.writeFile(f, `export {default} from './${o}'`, () => {})
  } else {
    console.log(`Writing: ${n}`)
    fs.writeFile(f, `export default ${JSON.stringify(m.data)}`, () => {})
  }

  ind.push(`export {default as ${n}} from './icons/${n}'`)
})

console.log('Writing: index.js')
fs.writeFile('index.js', ind.join('\n'), () => {})
