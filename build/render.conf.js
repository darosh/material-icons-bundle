const sharp = require('sharp')
const iconConf = require('./icon.conf')

module.exports = function (svg, resolve) {
  sharp({
    create: {
      width: iconConf.size,
      height: iconConf.size,
      channels: 4,
      background: {r: 255, g: 255, b: 255, alpha: 255}
    }
  })
    .overlayWith(new Buffer(svg))
    .png()
    .toBuffer()
    .catch(x => console.error(x))
    .then(buf => {
      const gray = sharp(buf)
        .resize(iconConf.size)
        .threshold()
        .grayscale()
      resolve(gray)
    })
}
