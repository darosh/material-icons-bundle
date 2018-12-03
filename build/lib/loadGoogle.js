const readDir = require('recursive-readdir')
const path = require('path')
const readSvgFile = require('./readSvgFile')

module.exports = function () {
  return new Promise(resolve => {
    const data = []

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
        if (err) {
          console.error(err)
        }

        files.forEach(file => {
          const segments = file.split(path.sep)

          data.push({
            file: file,
            source: 'Google',
            author: 'Google',
            name: segments[segments.length - 1].replace(/^ic_/, '').replace(/_24px\.svg$/, '').replace(/[-_]/g, ' '),
            category: segments[segments.length - 4],
            version: 'Google ' + require('material-design-icons/package.json').version
          })
        })

        Promise.all(data.map(d => readSvgFile(d.file))).then(files => {
          files.forEach((f, i) => {
            delete data[i].file
            data[i].data = f
          })

          resolve(data)
        })
      })
  })
}
