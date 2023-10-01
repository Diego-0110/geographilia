import {
  Map, NavigationControl, Marker,
  ScaleControl, Source, Layer
} from 'react-map-gl/maplibre'
import bbox from '@turf/bbox'
import area from '@turf/area'
import { useRef, useState, useMemo } from 'react'
import 'maplibre-gl/dist/maplibre-gl.css'

import dataGeoJSON from '@app/api/countries.json'
import { Button } from './ui/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/ui/card'
import { Input } from './ui/ui/input'
import { useForm } from 'react-hook-form'
import { Progress } from './ui/ui/progress'
import { FilledCircle } from './icons'
import { Badge } from './ui/ui/badge'
import AnswerPanel from './AnswerPanel'
const dataLayer = {
  id: 'data-fills',
  type: 'fill',
  paint: {
    'fill-color': [
      'case',
      ['==', ['feature-state', 'answer'], 'wrong'],
      '#f87171',
      ['==', ['feature-state', 'answer'], 'correct'],
      '#4ade80',
      ['==', ['feature-state', 'current'], true],
      '#60a5fa',
      ['==', ['feature-state', 'hover'], true],
      '#a1a1aa',
      '#f4f4f5'
    ],
    'fill-opacity': [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      0.7,
      1
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

const badgesLayer = {
  id: 'badges',
  type: 'symbol',
  paint: {
    'icon-size': ['interpolate', ['linear'], ['zoom'], 10, 1, 15, 0.5]
  }
}

export default function MainMap () {
  const [hoverCountry, setHoverCountry] = useState('')
  const [officialCountries, setOfficialCountries] = useState([])
  const [remainCountries, setRemainCountries] = useState([])
  const [currentCountry, setCurrentCountry] = useState(null)
  const [countriesCoords, setCountriesCoords] = useState({})
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
    const newCountriesCoords = {}
    states.forEach(feat => {
      newCountriesCoords[String(feat.id)] = feat.properties.geo_point_2d
    })
    console.log(newCountriesCoords)
    setCountriesCoords(newCountriesCoords)
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
    setAnswers({
      ...answers,
      [String(currentCountry.id)]:
      { validation, answer: data.country, correctAnswer: currentCountryName }
    })
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
        className="bg-cyan-500"
        style={{ width: '100%', height: '100vh', backgroundColor: 'rgb(186 230 253)' }}
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
        {Object.keys(answers).map(id => {
          const { lon, lat } = countriesCoords[String(id)]
          const additionalStyles = answers[id].validation === 'wrong' ? ' bg-sky-600' : ''
          return (
            <Marker key={id} longitude={lon} latitude={lat} anchor="center" className="group/marker relative z-0 hover:z-40">
              <div className="flex flex-col gap-1 items-center">
                <Badge className={'text-sm group-hover/marker:text-base' + additionalStyles}>{answers[id].correctAnswer}</Badge>
                {answers[id].validation === 'wrong' &&
                <Badge className="line-through decoration-current bg-destructive text-sm group-hover/marker:text-base">{answers[id].answer}</Badge>}
              </div>
            </Marker>
          )
        })}
      </Map>
      <div className="absolute top-2 left-2 right-2 z-50 pr-10">
        <AnswerPanel answered={totalAnswers} wrong={wrongAnswers} total={officialCountries.length}
          onSubmit={onSubmit} onClick={newRandomCountry} handleSubmit={handleSubmit} register={register}/>
      </div>
    </>
  )
}
