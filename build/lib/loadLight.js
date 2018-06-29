const readDir = require('recursive-readdir')
const path = require('path')
const readSvgFile = require('./readSvgFile')

module.exports = function () {
  return new Promise(resolve => {
    const data = []

    readDir('./node_modules/MaterialDesignLight/icons/svg', (err, files) => {
      if (err) {
        throw (err)
      }

      files.forEach(file => {
        const segments = file.split(path.sep)

        data.push({
          file: file,
          source: 'Light',
          author: 'Templarian',
          name: segments[segments.length - 1].replace(/\.svg$/, '').replace(/[-]/g, ' ') + ' light',
          version: 'Light',
          tags: ['light']
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
