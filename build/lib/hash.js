exports.rotate = function (hash, size = 24) {
  hash = hash.split('').reverse().join('')
  const r = new Array(24 * 24 / 4).fill(0)
  let c = 0

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x += 4) {
      let t = parseInt(hash.substr(c, 1), 16)

      for (let z = 0; z < 4; z++) {
        if (t & 8) {
          const x2 = y
          const y2 = x + z
          const ind = x2 + y2 * size

          r[Math.floor(ind / 4)] += Math.pow(2, ind % 4)
        }

        t = (t << 1) & 0xf
      }

      c++
    }
  }

  return r.map(d => d.toString(16)).join('')
}

exports.border = function (hash) {
  const b = [0, 0, 0, 0]
  let x = 0

  while (hash.substr((x++) * 6, 6) === '000000') {
    b[1]++
  }

  x = 23
  while (hash.substr(x-- * 6, 6) === '000000') {
    b[3]++
  }

  hash = exports.rotate(hash)

  x = 0

  while (hash.substr(x++ * 6, 6) === '000000') {
    b[0]++
  }

  x = 23

  while (hash.substr(x-- * 6, 6) === '000000') {
    b[2]++
  }

  return b
}

// console.log(exports.rotate('00000000000000c10000c10000c10000c10000c10000c10000c10000e30008ff000eff300fff70cffff1cfc9f1c1c1c100c10000c10000c10000e30000f700007700000000000000'))
// console.log(exports.rotate(exports.rotate('00000000000000c10000c10000c10000c10000c10000c10000c10000e30008ff000eff300fff70cffff1cfc9f1c1c1c100c10000c10000c10000e30000f700007700000000000000')))
