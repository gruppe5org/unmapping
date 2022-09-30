require('dotenv').config()
const path = require('path')
const fetch = require('node-fetch')
const express = require('express')
const cors = require('cors')

const state = {
  lastUpdate: Date.now(),
  devices: {}
}

const devices = [{
  url: 'https://www.finder-portal.com/viewmode_101893_c9d7a52741ca2d8c413b5f8406ab844656a2a153.html',
  dropoff: 1
}, {
  url: 'https://www.finder-portal.com/viewmode_158656_35389e7d8b92ad447d45b5e2bafca0acf41dbb3f.html',
  dropoff: 1
}, {
  url: 'https://www.finder-portal.com/viewmode_159742_34a6ced3c7054db5e903cfffb1a48c1cf482e0a7.html',
  dropoff: 1
}]

const app = express()
app.use(cors())

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
      .filter((point, i) => i % 6 === 0)
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
