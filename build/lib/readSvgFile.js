const fs = require('fs')
const extractSvg = require('./extractSvg')

module.exports = function (filename) {
  return new Promise(function (resolve, reject) {
    fs.readFile(filename, 'utf8', (err, svg) => {
      if (err) {
        reject(err)
      } else {
        extractSvg(svg).then(resolve)
      }
    })
  })
}
