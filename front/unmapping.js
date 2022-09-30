let data = {}
let maps = {}

async function updateData () {
  const newData = await getData()
  data = newData
  console.log('updated', data)
}

async function getData () {
  const response = await fetch('http://localhost:2228/api')
  const json = await response.json()
  return json
}

function placeMap (id) {
  const div = document.createElement('div')
  div.id = `map-${id}`
  div.className = 'map'
  document.querySelector('main').appendChild(div)

  const position = data.devices[id].routes[0]

  maps[id] = {}
  maps[id].map = L.map(`map-${id}`).setView([position.lat, position.lng], 18)
  L.tileLayer('https://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}', {
      attribution: ''
  }).addTo(maps[id].map)

  const latlngs = data.devices[id].routes.map((point) => [point.lat, point.lng])
  maps[id].line = L.polyline(latlngs, { color: 'blue', fill: false }).addTo(maps[id].map)

  data.devices[id].routes.map((point, index) => {
    L.circle([point.lat, point.lng], {
      color: index === 0 ? 'red' : 'blue',
      fillColor: index === 0 ? 'red' : 'blue',
      fillOpacity: 1,
      radius: index === 0 ? 10 : 1
    }).addTo(maps[id].map)
  })
}

function placeMaps () {
  const ids = Object.keys(data.devices)
  ids.map((id) => placeMap(id))
}

async function init () {
  await updateData()
  placeMaps()
}

init()
