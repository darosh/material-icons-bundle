const parseString = require('xml2js').parseString

module.exports = function (svg) {
  return new Promise(resolve => {
    svg = svg.replace(/ fill="[^"]+"/gi, '')

    parseString(svg, (err, parsed) => {
      if (err) {
        throw (err)
      }

      let data = null

      if (Object.keys(parsed.svg).length === 2) {
        if (parsed.svg.path && (parsed.svg.path.length === 1) && (Object.keys(parsed.svg.path[0].$).length >= 1)) {
          delete parsed.svg.path[0].$['fill-opacity']
          delete parsed.svg.path[0].$['stroke-width']
          delete parsed.svg.path[0].$['stroke-linejoin']
          delete parsed.svg.path[0].$['fill']

          if (Object.keys(parsed.svg.path[0].$).length === 1) {
            data = parsed.svg.path[0].$.d.trim()
          }
        }
      }

      if (!data) {
        data = svg.replace(/[\n\r]/g, ' ')
          .replace(/ +/g, ' ')
          .replace(/.*<svg[^>]*>(.*)<\/svg>.*/gmi, '$1')
          .trim().replace('fill="#000000" fill-opacity="1" ', '')
      }

      resolve(data)
    })
  })
}
