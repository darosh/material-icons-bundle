const fs = require('fs')
const stringify = require('json-stringify-pretty-compact')

Promise.all([
  require('./lib/loadCommunity')(),
  // require('./lib/loadLight')(),
  require('./lib/loadGoogle')()
]).then(sets => {
  const loaded = sets.reduce((r, s) => {return r.concat(s)}, [])
  fs.writeFileSync('./meta/_loaded.json', stringify(loaded, {maxLength: 2048}))
})
