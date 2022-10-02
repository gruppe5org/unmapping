let data = {}
let maps = {}

const projects = [{
  title: '<p><span style="font-weight: bold;">Gig</span></p>',
  content: '<p>Our project was trying to unveil the invisible borders drawn by the routes of the workers in the gig economy. By analysing the transport ways drivers took while delivering food, groceries or transporting people we hoped to see a new ways how people behave due to the limitations imposed by the tech companies (e.g. areas where food is being delivered) or the routes taken most often by the workers. After talking to someone at an event hosted in a union building in Berlin, we got some insight into the industry but we are still looking for a gig economy worker to take your tracker.</p><img src="/media/group-01/gig-economy1.jpeg"/><img src="/media/group-01/gig-economy2.jpeg"/><img src="/media/group-01/gig-economy3.jpeg"/><img src="/media/group-01/gig-economy4.jpeg"/><img src="/media/group-01/gig-economy5.jpeg"/><img src="/media/group-01/gig-economy6.jpeg"/><img src="/media/group-01/gig-economy7.jpeg"/><img src="/media/group-01/gig-economy8.jpeg"/>',
},{
  title:'<p><span style="font-weight: bold;">Error 404: no (Emer)data</span> (Ebba Petrén, Jeremy Pine, Marie-Sophie Seifert)</p>',
  content:'<p>In the 2010s, personal data belonging to millions of Facebook users was collected without their consent by British consulting firm Cambridge Analytica (CA), predominantly to be used for political advertising. When CA were accused for this crime, the directors of CA created a successor firms called Emerdata Limited. There is almost no information on these company avaliable online. No linkedin. No website. Nothing about what they do. This is an artistic intervention in order to gain information about this secretive company and its directors. They have all our data. We want some of theirs.<br><br>We sent a package to the New York City address of the company. Inside that package was a GPS-tracker   nested inside two other packages, the first addressed to the attention of Rebekah Mercer, the billionaire who owns Emerdata and funds global right wing movments. The innermost package was addressed to the company\'s data science team. We claimed that the GPS tracker was actually a storage device containing sensitive data about population trends and high profile individuals but they will probably find out it\'s not as soon as they examine the tracker. We hope the package will travel to different officies inside the company and thereby reveal something about its geography, organizational structure and security procedures.</p><img src="/media/group-02/1.jpg"/>',
},{
  title:'<p><span style="font-weight: bold;">Let it flow</span></p>',
  content:'<p>Add your content</p>',
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
    })
      .addTo(maps[id].circle)
      .bindPopup(
        `<p>Lat: <strong>${Number(point.lat).toFixed(
          6
        )}</strong></p><p>Lng: <strong>${Number(point.lng).toFixed(
          6
        )}</strong></p><p>Speed: <strong>${
          point.speed
        }</strong></p><p>Timestamp: <strong>${new Date(
          point.dateunix * 1000
        ).toLocaleDateString('de-DE', {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric'
        })}</strong></p><p>Maps: <strong><a href="https://maps.google.com/?q=${
          point.lat
        },${point.lng}" target="_blank">maps.google.com</a></strong></p>`
      )
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
