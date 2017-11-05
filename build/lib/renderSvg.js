const render = require('../config/render.conf')

module.exports = function (pathOrSvg) {
  return new Promise(resolve => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">${pathOrSvg[0] === '<' ? `<g>${pathOrSvg}</g>>` : `<path d="${pathOrSvg}"></path>`}</svg>`
    const opacity = svg.includes('opacity')

    render.render(svg, (sharp) => {
      if (!opacity) {
        sharp = sharp.threshold(224)
      }

      sharp
        .raw()
        .toBuffer()
        .then(buf => {
          const hash = render.hash(buf)
          const pixels = render.density(buf)

          resolve({
            hash,
            pixels
          })
        })
    })
  })
}
