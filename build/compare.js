const { writeFileSync } = require('fs')
const { compareHashes } = require('similar-icons')
const hashes = require('../meta/_rendered.json')

;(async () => {
  console.time('Comparing')
  const similar = await compareHashes({ hashes })
  similar.sort((a, b) => a[2] - b[2])
  console.timeEnd('Comparing')
  writeFileSync('meta/_similar.json', JSON.stringify(similar))
})()
