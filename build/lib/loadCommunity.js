const meta = require('@mdi/svg/meta.json')

module.exports = function () {
  return new Promise(resolve => {
    const data = []

    require('../../meta/_community.json').icons.forEach(d => {
      const f = meta.find(m => d.name === m.name) || {}

      const m = {
        author: d.user.name,
        aliases: d.aliases,
        tags: f.tags
      }

      data.push({
        source: 'Community',
        author: m.author,
        name: d.name.replace(/[-_]/g, ' '),
        aliases: m.aliases && m.aliases.length ? m.aliases : undefined,
        tags: m.tags && m.tags.length ? m.tags : undefined,
        version: f.version || '?',
        data: d.data
      })
    })

    resolve(data)
  })
}
