(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory()
  } else {
    root.IconDuplicates = factory(root.b)
  }
}(typeof self !== 'undefined' ? self : this, function () {
  const matches = {
    'airplanemode inactive': 'airplane off',
    'arrow drop down circle': 'arrow down drop circle',
    'arrow drop up': 'menu up',
    'attachment': 'attachment',
    'directions bike': 'bike',
    'directions walk': 'walk',
    'find replace': 'find replace',
    'fingerprint': 'fingerprint',
    'grid off': 'grid off',
    'local bar': 'martini',
    'notifications active': 'bell ring',
    'notifications none': 'bell outline',
    'notifications off': 'bell off',
    'notifications paused': 'bell sleep',
    'notifications': 'bell',
    'power settings new': 'power',
    'rowing': 'rowing',
    'strikethrough s': 'format strikethrough variant',
    'tab unselected': 'tab unselected',
    'tab': 'tab',
    'thumbs up down': 'thumbs up down',
    'touch app': 'gesture tap',
    'view headline': 'view headline',
    'work': 'briefcase'
    // 'sort by alpha': 'sort alphabetical', // for num sort consistency
  }

  dups.matches = matches

  return dups

  function dups (a, b, c) {
    if(a.source === 'Community') {
      const t = a
      a = b
      b = t
    }

    if (matches[a.name] === b.name) {
      return -1
    }

    if (c > 3) {
      return false
    }

    // number must match
    const num = /\d/.exec(a.name)

    if (num && !b.name.includes(num)) {
      return false
    }

    return (a.source !== b.source && b.author.startsWith('Google') && a.author.startsWith('Google')) && 1
  }
}))
