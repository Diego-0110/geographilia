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
import { Progress } from './ui/ui/progress'
const dataLayer = {
  id: 'data-fills',
  type: 'fill',
  paint: {
    'fill-color': [
      'case',
      ['==', ['feature-state', 'answer'], 'wrong'],
      '#f75c5c',
      ['==', ['feature-state', 'answer'], 'correct'],
      '#75ff70',
      '#555555'
    ],
    'fill-opacity': [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      0.7,
      ['!=', ['feature-state', 'answer'], null],
      1,
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
  const [officialCountries, setOfficialCountries] = useState([])
  const [currentCountry, setCurrentCountry] = useState({})
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
      { padding: 100, duration: 1000 }
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
  const newRandomCountry = () => {
    if (officialCountries < 1) {
      return
    }
    const randomCountryId = Math.floor(Math.random() * officialCountries.length)
    const randomCountry = officialCountries[randomCountryId]
    // console.log(randomCountryId)
    setCurrentCountry({
      id: randomCountry.id,
      code: randomCountry.properties.iso_3166_1_alpha_2_codes
    })
    mapRef.current.setFeatureState({ source: 'countries', id: randomCountry.id },
      { hover: true })
    zoomToCountry(randomCountry)
  }

  const handleLoad = (event) => {
    // console.log(mapRef.current.getStyle().layers)
    let features = mapRef.current.getSource('countries').serialize().data.features
    features = features.map((feat, index) => {
      return { id: index, ...feat }
    })
    const states = features.filter(feat => {
      return feat.properties.iso_3166_1_alpha_2_codes
    })
    setOfficialCountries(states)
    console.log(states)
    // newRandomCountry()
  }

  const onSubmit = (data) => {
    const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })
    const currentCountryName = regionNames.of(currentCountry.code || '')
    console.log(currentCountryName)
    console.log(data.country === currentCountryName)
    mapRef.current.setFeatureState({ source: 'countries', id: currentCountry.id },
      { answer: (data.country === currentCountryName) ? 'correct' : 'wrong' })
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
      >
        <GeolocateControl position="top-left" />
        <FullscreenControl position="top-left" />
        <NavigationControl position="top-left" />
        <ScaleControl />
        <Source id="countries" type="geojson" data={dataGeoJSON} generateId>
          <Layer {...dataLayer} />
          <Layer {...dataBorderLayer} />
        </Source>
      </Map>
      <Card className="absolute top-2 left-2 right-2 z-50 max-w-3xl mx-auto">
        <CardHeader className="gap-2">
          {/* <CardTitle>Guess the country</CardTitle> */}
          <div className="relative">
            <Progress value={50} />
            <Progress value={25} className="absolute top-0 bg-transparent"
              subClassName="bg-destructive"/>
          </div>
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
