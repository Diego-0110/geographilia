import {
  Map, GeolocateControl, FullscreenControl, NavigationControl,
  ScaleControl, Source, Layer
} from 'react-map-gl/maplibre'
import bbox from '@turf/bbox'
import { useRef, useState, useMemo } from 'react'
import 'maplibre-gl/dist/maplibre-gl.css'

import dataGeoJSON from '@app/api/countries.json'
import { Button } from './ui/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/ui/card'
import { Input } from './ui/ui/input'
import { useForm } from 'react-hook-form'
const dataLayer = {
  id: 'data-fills',
  type: 'fill',
  paint: {
    'fill-color': '#555555',
    'fill-opacity': [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      0.7,
      0
    ]
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

export default function MainMap () {
  const [hoverCountry, setHoverCountry] = useState('')
  const mapRef = useRef()
  const { register, handleSubmit, watch } = useForm()

  const zoomToCountry = (feature) => {
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

  const onClick = (event) => {
    const feature = event.features[0]
    if (feature) {
      zoomToCountry(feature)
    }
  }
  const handleHover = (event) => {
    if (event.features.length > 0) {
      const newValue = event.features.length ? event.features[0].id : ''
      if (newValue !== hoverCountry) {
        if (hoverCountry !== '') {
          mapRef.current.setFeatureState({ source: 'countries', id: hoverCountry },
            { hover: false })
        }
        // console.log(newValue)
        setHoverCountry(newValue)
        mapRef.current.setFeatureState({ source: 'countries', id: newValue },
          { hover: true })
      }
    }
  }
  const handleMouseLeave = (event) => {
    if (hoverCountry !== '') {
      mapRef.current.setFeatureState({ source: 'countries', id: hoverCountry },
        { hover: false })
    }
    setHoverCountry('')
  }
  const newRandomCountry = (event) => {
    const countries = mapRef.current.getSource('countries').serialize().data.features
    const randomCountryId = Math.floor(Math.random() * countries.length)
    const randomCountry = countries[randomCountryId]
    // console.log(randomCountryId)
    mapRef.current.setFeatureState({ source: 'countries', id: randomCountryId },
      { hover: true })
    zoomToCountry(randomCountry)
  }

  const handleLoad = (event) => {
    // console.log(mapRef.current.getStyle().layers)
    console.log(mapRef.current.getSource('countries').serialize())
    newRandomCountry(event)
  }

  const onSubmit = (data) => {
    console.log(data)
  }
  return (
    <>
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: -122.4,
          latitude: 37.8,
          zoom: 4
        }}
        style={{ width: '100%', height: '100vh' }}
        interactiveLayerIds={['data-fills']}
        onClick={onClick}
        onMouseMove={handleHover}
        onMouseLeave={handleMouseLeave}
        onLoad={handleLoad}
        maplibreLogo
        // mapStyle="https://demotiles.maplibre.org/style.json"
      >
        <GeolocateControl position="top-left" />
        <FullscreenControl position="top-left" />
        <NavigationControl position="top-left" />
        <ScaleControl />
        <Source id="countries" type="geojson" data={dataGeoJSON} generateId>
          <Layer {...dataLayer} />
          <Layer {...dataBorderLayer} />
          {/* <Layer beforeId="geolines-label" {...dataLayer} />
          <Layer beforeId="geolines-label" {...dataBorderLayer} /> */}
          {/* <Layer beforeId='geolines' {...dataHighlightLayer} filter={filter}/> */}
        </Source>
      </Map>
      <Card className="absolute top-2 left-2 right-2 z-50 max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Guess the country</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-end gap-2">
            <Input {...register('country', { required: true })}/>
            <div className="flex gap-2">
              <Button variant="secondary" type="button" onClick={newRandomCountry}>
                Random Country
              </Button>
              <Button type="submit">Check</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  )
}
