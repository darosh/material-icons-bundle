const axios = require('axios')
const fs = require('fs')

axios.defaults.baseURL = 'https://materialdesignicons.com/api'

axios.get('/init').then(res => {
  axios.get(`/package/${res.data.packages[0].id}`).then(res => {
    fs.writeFileSync('meta/_community.json', JSON.stringify(res.data))
  })
})
