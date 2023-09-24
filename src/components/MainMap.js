import {
  Map, GeolocateControl, FullscreenControl, NavigationControl,
  ScaleControl, Source, Layer
} from 'react-map-gl/maplibre'
import bbox from '@turf/bbox'
import { useRef, useState, useMemo } from 'react'
import 'maplibre-gl/dist/maplibre-gl.css'

import dataGeoJSON from '@app/api/countries.json'
const dataLayer = {
  id: 'data',
  type: 'fill',
  paint: {
    'fill-color': 'transparent',
    'fill-opacity': 1
  }
}
const dataBorderLayer = {
  id: 'data-border',
  type: 'line',
  paint: {
    'line-color': '#555555',
    'line-width': 2
  }
}
const dataHighlightLayer = {
  id: 'data-hl',
  type: 'fill',
  paint: {
    'fill-color': '#555555',
    'fill-opacity': 0.7
  }
}

export default function MainMap () {
  const [hoverCountry, setHoverCountry] = useState('')
  const mapRef = useRef()

  const onClick = (event) => {
    const feature = event.features[0]
    if (feature) {
      // calculate the bounding box of the feature
      const [minLng, minLat, maxLng, maxLat] = bbox(feature)

      mapRef.current.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat]
        ],
        { padding: 40, duration: 1000 }
      )
    }
  }
  const handleHover = (event) => {
    const newValue = event.features.length ? event.features[0].properties.ISO_A3 : ''
    newValue !== hoverCountry && setHoverCountry(newValue)
  }
  const filter = useMemo(() => ['in', 'ISO_A3', hoverCountry], [hoverCountry])

  const handleLoad = (event) => {
    const countries = dataGeoJSON.features.map((feature) => feature.properties)
    console.log(countries[Math.floor(Math.random() * countries.length)])
  }
  return (
    <Map
      ref={mapRef}
      initialViewState={{
        longitude: -122.4,
        latitude: 37.8,
        zoom: 4
      }}
      style={{ width: '100%', height: '100vh' }}
      interactiveLayerIds={['data']}
      onClick={onClick}
      onMouseMove={handleHover}
      onLoad={handleLoad}
      maplibreLogo
      mapStyle="https://demotiles.maplibre.org/style.json"
    >
      <GeolocateControl position="top-left" />
      <FullscreenControl position="top-left" />
      <NavigationControl position="top-left" />
      <ScaleControl />
      <Source type="geojson" data={dataGeoJSON}>
        <Layer {...dataLayer} />
        <Layer beforeId='geolines' {...dataBorderLayer} />
        <Layer beforeId='geolines' {...dataHighlightLayer} filter={filter}/>
      </Source>
    </Map>
  )
}
