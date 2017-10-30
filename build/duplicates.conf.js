(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory()
  } else {
    root.IconDuplicates = factory(root.b)
  }
}(typeof self !== 'undefined' ? self : this, function () {
  return function (a, b, c) {
    if (c > 23) {
      return false
    }

    const num = /\d/.exec(a.name)

    // number must match
    if (num && !b.name.includes(num)) {
      return false
    }

    // do not close
    if (a.name.includes('open') && !b.name.includes('open')) {
      return false
    }

    if (b.name.includes('open') && !a.name.includes('open')) {
      return false
    }

    if (a.name.includes('minus') || b.name.includes('minus')) {
      return false
    }

    if (a.name.includes('plus') || b.name.includes('plus')) {
      return false
    }

    if (a.name.includes(' out') || b.name.includes(' out')) {
      return false
    }

    if (a.name.endsWith(' in') || b.name.endsWith(' in')) {
      return false
    }

    if (a.name.includes('party') && !b.name.includes('party')) {
      return false
    }

    if (b.name.includes('party') && !a.name.includes('party')) {
      return false
    }

    if (c > 10 && a.name !== b.name) {
      return false
    }

    return a.source !== b.source && a.author === b.author && a.author.startsWith('Google');
  }
}))
