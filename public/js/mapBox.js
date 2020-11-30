

export function displayMap(locations){

  mapboxgl.accessToken = 'pk.eyJ1IjoiZ2hhbmE3OTg5IiwiYSI6ImNraTJtcGxybTA3aGYyeXN5eDhzNWl6cDcifQ.rxPUIIPA0uWG4Zw-fmxIOg';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/ghana7989/cki2n5aoh4e4i19pgqtebhm9o',
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((location) => {
    // Add a marker
    const el = document.createElement('div')
    el.className = 'marker'

    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    }).setLngLat(location.coordinates).addTo(map)

    // adding a pop up at location point
    new mapboxgl.Popup({
      offset: 30
    }).setLngLat(location.coordinates)
      .setHTML(`<p>Day ${location.day}: ${location.description}</p>`)
      .addTo(map)

    // Adding Boundaries
    bounds.extend(location.coordinates)
  })

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 200,
      left: 100,
      right: 100
    }
  })
}
