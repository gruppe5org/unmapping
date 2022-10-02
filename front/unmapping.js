let data = {}
let maps = {}

const projects = [{
  title: 'Lieferando/Gorillas (names?)',
  content: 'add your content',
},{
  title:'Unknown destination/Chain Letter (names?)',
  content:'add your content',
},{
  title:'Water/Trash',
  content:'add your content',
}]

async function updateData () {
  const newData = await getData()
  data = newData
  console.log('updated', data)
}

async function getData () {
  const response = await fetch('/api')
  const json = await response.json()
  return json
}

function placeUi () {
  const maps = [...document.querySelectorAll('section')]

  maps.forEach((map) => {
    const popUp = document.createElement('div')
    popUp.className = 'pop-up'
    
    const button = document.createElement('button')
    button.addEventListener('click', (event) => {
      event.target.parentNode.querySelector('.pop-up').classList.toggle('open')
    })

    map.appendChild(button)
    map.appendChild(popUp)
  })
}

function placeContent () {
  const popUps = [...document.querySelectorAll('.pop-up')]

  popUps.forEach((popUp, index) => {
    const project = projects[index]

    Object.keys(project).forEach((key) => {
      const add = document.createElement('div')
      add.className = key
      add.innerHTML = project[key]
      popUp.appendChild(add)
    })
  })
}

function placeMap (id, again) {
  if (!again) {
    const section = document.createElement('section')
    section.id = `section-${id}`
    document.querySelector('main').appendChild(section)

    const div = document.createElement('div')
    div.id = `map-${id}`
    div.className = 'map'
    section.appendChild(div)
  
    const position = data.devices[id].routes[0]
  
    maps[id] = {}
    maps[id].map = L.map(`map-${id}`).setView([position.lat, position.lng], 18)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: ''
    }).addTo(maps[id].map)
  } else {
    maps[id].line.removeFrom(maps[id].map)
    maps[id].circle.removeFrom(maps[id].map)
    console.log('updated', id)
  }
  
  const latlngs = data.devices[id].routes.map((point) => [point.lat, point.lng])
  maps[id].line = L.polyline(latlngs, { color: 'blue', fill: false }).addTo(maps[id].map)
  maps[id].circle = L.featureGroup()
  data.devices[id].routes.map((point, index) => {
    L.circle([point.lat, point.lng], {
      color: index === 0 ? 'red' : 'blue',
      fillColor: index === 0 ? 'red' : 'blue',
      fillOpacity: 1,
      radius: index === 0 ? 5 : 1,
    }).addTo(maps[id].circle)
  })
  maps[id].map.addLayer(maps[id].circle)
}

function placeMaps (again) {
  const ids = Object.keys(data.devices)
  ids.map((id) => placeMap(id, again))
}

async function init () {
  await updateData()
  placeMaps()
  placeUi()
  placeContent()

  setInterval(async () => {
    await updateData()
    placeMaps(true)
  }, 60 * 1000)
}

init()
