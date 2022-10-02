require('dotenv').config()
const path = require('path')
const fetch = require('node-fetch')
const express = require('express')
const cors = require('cors')

const state = {
  lastUpdate: Date.now(),
  devices: {}
}

const devices = [ {
  url: 'https://www.finder-portal.com/viewmode_1137497_ef6d30b1c9f33531e43967250f0a751f92e9d5ee.html',
  dropoff: 1
}, {
  url: 'https://www.finder-portal.com/viewmode_1137501_e1f4dfa55f274080743b6c7092c7bf7feaa83622.html',
  dropoff: 1
},{
  url: 'https://www.finder-portal.com/viewmode_1137502_d5968f18d8b264cc4a1b7d61dc07f58118da3f08.html',
  dropoff: 1
}]

const app = express()
app.use(cors())

app.use('/', express.static(path.join(__dirname, '../front')))
app.get('/api', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(JSON.stringify(state, null, 2))
})

app.listen(2228, () => {
  console.log(`serving`)
})

async function getCookie(url) {
  const response = await fetch(url)
  return response.headers.raw()['set-cookie'][0].split(';')[0]
}

async function getAllRoutes(id, cookie) {
  const body = new URLSearchParams()
  body.append('data', 'allRoutes')
  body.append(`options[${id}]`, '5')

  const response = await fetch('https://www.finder-portal.com/data/endpoints.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      cookie: cookie
    }, 
    body: body
  })

  const json = await response.json()
  console.log(json)
  return json[id]
}

async function fetchDevices () {
  state.devices = await devices.reduce(async (prevDevices, device) => {
    const devices = await prevDevices
    const id = device.url.match(/\d+/)[0]
    const cookie = await getCookie(device.url)
    const routes = await getAllRoutes(id, cookie)

    if (!state.devices[id]) {
      devices[id] = {}
    } else {
      devices[id] = state.devices[id]
    }

    devices[id].routes = routes
      //.filter((point, i) => i % 6 === 0)
      .slice(0, -device.dropoff)
    console.log(id, devices[id].routes.length)
    return devices
  
    devices[id].routes = routes
    return devices
  }, {})

  return state.devices
}

async function update () {
  try {
    await fetchDevices()
  } catch (error) {
    console.log(error)
  }
  
  state.lastUpdate = Date.now()
  console.log(`${state.lastUpdate} devices updated`)

  return state.devices
}

async function init () {
  setInterval(update, 60 * 1000)
  await update()
}

init()
