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
import { FilledCircle } from './icons'
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
      ['==', ['feature-state', 'current'], true],
      '#2d72e0',
      '#555555'
    ],
    'fill-opacity': [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      0.7,
      ['!=', ['feature-state', 'answer'], null],
      1,
      ['==', ['feature-state', 'current'], true],
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
  const [remainCountries, setRemainCountries] = useState([])
  const [currentCountry, setCurrentCountry] = useState(null)
  const [answers, setAnswers] = useState({})
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
    if (officialCountries.length < 1) {
      return
    }
    const randomCountryId = remainCountries[Math.floor(Math.random() * remainCountries.length)]
    const randomCountry = officialCountries.find(item => item.id === randomCountryId)
    console.log(randomCountryId)
    console.log(remainCountries)
    if (currentCountry?.id !== undefined) {
      mapRef.current.setFeatureState({ source: 'countries', id: currentCountry.id },
        { current: false })
    }
    console.log(answers)
    if (Object.keys(answers).includes(String(currentCountry?.id))) {
      setRemainCountries(remainCountries.filter(item => item !== randomCountry.id))
    }
    setCurrentCountry({
      id: randomCountry.id,
      code: randomCountry.properties.iso_3166_1_alpha_2_codes
    })
    mapRef.current.setFeatureState({ source: 'countries', id: randomCountry.id },
      { current: true })
    zoomToCountry(randomCountry)
  }

  const handleLoad = (event) => {
    // console.log(mapRef.current.getStyle().layers)
    let features = mapRef.current.getSource('countries').serialize().data.features
    features = features.map((feat, index) => {
      return { id: index, ...feat }
    })
    const states = features.filter(feat => {
      return feat.properties.iso_3166_1_alpha_2_codes && feat.properties.status === 'Member State' &&
        feat.properties.continent === 'Europe'
    })
    setOfficialCountries(states)
    setRemainCountries(states.map(feat => feat.id))
    console.log(states)
    // newRandomCountry()
  }

  const onSubmit = (data) => {
    if (currentCountry === null) {
      return
    }
    const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })
    const currentCountryName = regionNames.of(currentCountry.code || '')
    console.log(currentCountryName)
    console.log(data.country === currentCountryName)
    const validation = (data.country === currentCountryName) ? 'correct' : 'wrong'
    mapRef.current.setFeatureState({ source: 'countries', id: currentCountry.id },
      { answer: validation })
    setAnswers({ ...answers, [String(currentCountry.id)]: { validation, answer: data.country } })
  }

  const totalAnswers = useMemo(() => Object.keys(answers).length, [answers])
  const totalAnswersPercent = useMemo(() => {
    return totalAnswers / officialCountries.length * 100
  }, [totalAnswers, officialCountries])
  const wrongAnswers = useMemo(() =>
    Object.keys(answers).filter(key => answers[key].validation === 'wrong').length, [answers])
  const wrongAnswersPercent = useMemo(() => {
    return wrongAnswers / officialCountries.length * 100
  }, [wrongAnswers, officialCountries])

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
        <NavigationControl position="top-right" />
        <ScaleControl />
        <Source id="countries" type="geojson" data={dataGeoJSON} generateId>
          <Layer {...dataLayer} />
          <Layer {...dataBorderLayer} />
        </Source>
      </Map>
      <div className="absolute top-2 left-2 right-2 z-50 pr-10">
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="pb-3">
            <p className="flex gap-3 text-sm px-2 font-normal">
              <span className="flex gap-1 text-primary">{totalAnswers - wrongAnswers} <FilledCircle size={16} /></span>
              <span className="flex gap-1 text-destructive">{wrongAnswers} <FilledCircle size={16} /></span>
              <span className="text-[#2d72e0]">{totalAnswers} / {officialCountries.length}</span>
            </p>
            <div className="relative">
              <Progress value={totalAnswersPercent} />
              <Progress value={wrongAnswersPercent} className="absolute top-0 bg-transparent"
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
      </div>
    </>
  )
}
