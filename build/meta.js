const readDir = require('recursive-readdir')
const path = require('path')
const compactJSON = require('json-stringify-pretty-compact')
const fs = require('fs')
const parseString = require('xml2js').parseString
const render = require('./render.conf')
const data = []
const meta = require('mdi-svg/meta.json')

require('../meta/_community.json').icons.forEach(d => {
  const m = {
    author: d.user.name,
    aliases: d.aliases,
    tags: (meta.find(m => d.name === m.name) || {}).tags
  }

  data.push({
    path: d.data,
    source: 'Community',
    name: d.name.replace(/[-_]/g, ' '),
    author: m.author,
    aliases: m.aliases && m.aliases.length ? m.aliases : undefined,
    tags: m.tags && m.tags.length ? m.tags : undefined
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

  parseString(svg, (err, parsed) => {
    render(svg, (sharp) => {
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
            hash
          })
        })
    })
  })
}

function lineToHex (buf, start) {
  let v = 0

  for (let i = 0; i < 4; i++) {
    v += buf[start + i] ? Math.pow(2, i) : 0
  }

  return v.toString(16)
}
