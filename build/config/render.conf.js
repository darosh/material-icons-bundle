const sharp = require('sharp')
const iconConf = require('./icon.conf')

exports.render = function (svg, resolve) {
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
        // .threshold()
        .grayscale()
      resolve(gray)
    })
}

exports.hash = function (buf) {
  return (new Array(buf.length / 4).fill(0)).map((d, i) => lineToHex(buf, i * 4)).join('')
}

function lineToHex (buf, start) {
  let v = 0
  let x = Math.floor(start / iconConf.size)

  for (let i = 0; i < 4; i++) {
    v += buf[start + i] && (buf[start + i] === 255 || (i ^ x) % 2) ? 0 : Math.pow(2, i)
  }

  return v.toString(16)
}

exports.density = function (buf) {
  let v = 0
  let i = 0

  for (let x = 0; x < iconConf.size; x++) {
    for (let y = 0; y < iconConf.size; y++) {
      v += buf[i] && (buf[i] === 255 || (x ^ y) % 2) ? 0 : 1
      i++
    }
  }

  return v
}

