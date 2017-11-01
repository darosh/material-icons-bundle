const readDir = require('recursive-readdir')
const path = require('path')
const compactJSON = require('json-stringify-pretty-compact')
const fs = require('fs')
const parseString = require('xml2js').parseString
const render = require('./render.conf')
const data = []
const meta = require('mdi-svg/meta.json')
const size = require('./icon.conf').size

require('../meta/_community.json').icons.forEach(d => {
  const f = meta.find(m => d.name === m.name) || {}

  const m = {
    author: d.user.name,
    aliases: d.aliases,
    tags: f.tags
  }

  data.push({
    path: d.data,
    source: 'Community',
    name: d.name.replace(/[-_]/g, ' '),
    author: m.author,
    aliases: m.aliases && m.aliases.length ? m.aliases : undefined,
    tags: m.tags && m.tags.length ? m.tags : undefined,
    version: f.version || '?'
  })
})

readDir('node_modules/material-design-icons',
  [(file, stats) => {
    const segments = file.split(path.sep)

    if (stats.isFile()) {
      return (segments[segments.length - 2] !== 'production' || !file.endsWith('_24px.svg'))
    } else {
      const last = segments[segments.length - 1]
      return last.startsWith('drawable-') || last.endsWith('x_web') || (last === 'ios')
    }
  }],
  (err, files) => {
    files.forEach(file => {
      const segments = file.split(path.sep)

      data.push({
        file: file,
        category: segments[segments.length - 4],
        source: 'Google',
        author: 'Google',
        version: 'Google ' + require('material-design-icons/package.json').version,
        name: segments[segments.length - 1].replace(/^ic_/, '').replace(/_24px\.svg$/, '').replace(/[-_]/g, ' ')
      })
    })

    Promise.all(data.map(d => readFileAsync(d.file, d.path))).then(files => {
      files.forEach((f, i) => {
        data[i].path = undefined
        data[i].file = undefined
        data[i].data = f.data
        // data[i].optimized = optimized
        data[i].hash = f.hash
        data[i].pixels = f.pixels
      })

      fs.writeFileSync('meta/_meta.json', compactJSON(data, {maxLength: 1024}))
    })
  })

function readFileAsync (filename, path) {
  return new Promise(function (resolve, reject) {
    if (filename) {
      fs.readFile(filename, 'utf8', (err, svg) => {
        if (err) {
          reject(err)
        } else {
          parseSvg(svg, resolve)
        }
      })
    } else {
      parseSvg(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="${path}"></path></svg>`, resolve)
    }
  })
}

function parseSvg (svg, resolve) {
  svg = svg.replace(/ fill="[^"]+"/gi, '')

  const opacity = svg.includes('opacity')

  parseString(svg, (err, parsed) => {
    render(svg, (sharp) => {
      if(!opacity) {
        sharp = sharp.threshold(224)
      }

      sharp
        .raw()
        .toBuffer()
        .then(buf => {
          const hash = (new Array(buf.length / 4).fill(0)).map((d, i) => lineToHex(buf, i * 4)).join('')

          let data

          if (Object.keys(parsed.svg).length === 2) {
            if (parsed.svg.path && (parsed.svg.path.length === 1) && (Object.keys(parsed.svg.path[0].$).length === 1)) {
              data = parsed.svg.path[0].$.d
            }
          }

          if (!data) {
            data = svg.replace(/.*<svg[^>]*>(.*)<\/svg>.*/gmi, '$1')
          }

          resolve({
            data,
            hash,
            pixels: density(buf)
          })
        })
    })
  })
}

function lineToHex (buf, start) {
  let v = 0
  let x = Math.floor(start / size)

  for (let i = 0; i < 4; i++) {
    v += buf[start + i] && (buf[start + i] === 255 || (i ^ x) % 2) ? 0 : Math.pow(2, i)
  }

  return v.toString(16)
}

function density (buf) {
  let v = 0
  let i = 0

  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      v += buf[i] && (buf[i] === 255 || (x ^ y) % 2) ? 0 : 1
      i++
    }
  }

  return v
}
