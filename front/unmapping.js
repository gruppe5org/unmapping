let data = {}
let maps = {}

const projects = [{
  title: '(Un)mapping the (In)visible [Conrad & Kjell]',
  content: 'The Global Positioning System (GPS), an initiative of the American Department of Defense, is a technology that uses 24 satellites which circle the earth to determine a location. There are thousands of applications for GPS systems, ranging from everything to helping hikers navigate in remote areas, to assisting farmers with precisely seeding their fields, to the navigation of drones to a defined target. The use of tracking technologies enables us to leverage space, place, time and geography from the received data in order to create meaning from information that has a geospatial component. In this workshop we will track and trace humans, animals, machines, packages or vehicles using locative technology. The retrieved datasets will be variously analysed, interpreted or narrated in form of an experimental website. The Global Positioning System (GPS), an initiative of the American Department of Defense, is a technology that uses 24 satellites which circle the earth to determine a location. There are thousands of applications for GPS systems, ranging from everything to helping hikers navigate in remote areas, to assisting farmers with precisely seeding their fields, to the navigation of drones to a defined target. The use of tracking technologies enables us to leverage space, place, time and geography from the received data in order to create meaning from information that has a geospatial component. In this workshop we will track and trace humans, animals, machines, packages or vehicles using locative technology. The retrieved datasets will be variously analysed, interpreted or narrated in form of an experimental website.',
},{
  title:'',
  content:'',
},{
  title:'',
  content:'',
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
    L.tileLayer('https://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}', {
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
      radius: index === 0 ? 10 : 1
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
