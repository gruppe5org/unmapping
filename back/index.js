require('dotenv').config()
const path = require('path')
const fetch = require('node-fetch')
const express = require('express')

const state = {
  lastUpdate: Date.now(),
  devices: {}
}

const devices = []

const app = express()

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
  state.devices = await devices.reduce(async (prevDevices, url) => {
    const devices = await prevDevices
    const id = url.match(/\d+/)[0]
    const cookie = await getCookie(url)
    const routes = await getAllRoutes(id, cookie)

    if (!state.devices[id]) {
      devices[id] = {}
    } else {
      devices[id] = state.devices[id]
    }

    devices[id].routes = routes
    return devices
  }, {})

  return state.devices
}

async function update () {
  await fetchDevices()
  
  state.lastUpdate = Date.now()
  console.log(`${state.lastUpdate} devices updated`)

  return state.devices
}

async function init () {
  setInterval(update, 30 * 1000)
  setInterval(store, 2 * 60 * 60 * 1000)
  await update()
}

init()
