import bbox from '@turf/bbox'
import { useRef, useMemo } from 'react'

import { useForm } from 'react-hook-form'
import AnswerPanel from './AnswerPanel'
import { useHoverMap } from '@utils/hooks/useHoverMap'
import GameMap from './GameMap'
import { useGame } from '@utils/hooks/useGame'

const SOURCE_ID = 'countries'

export default function Game ({ lang = 'en', continent = 'Europe' }) {
  const mapRef = useRef()
  const [handleHover, handleMouseLeave] = useHoverMap(mapRef, SOURCE_ID)
  const {
    answers,
    countriesCoords,
    countriesCount,
    hasGameStarted,
    hasGameEnded,
    handleMapLoaded,
    isMapLoaded,
    nextCountry,
    checkAnsweredCountry
  } = useGame(mapRef, SOURCE_ID, lang, continent, next => zoomToCountry(next))
  const { register, handleSubmit } = useForm()

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

  const handleClick = (event) => {
    const feature = event.features[0]
    if (feature) {
      zoomToCountry(feature)
    }
  }

  const newRandomCountry = () => {
    const next = nextCountry()
    if (next) {
      zoomToCountry(next)
      return true
    }
    return false
  }

  const handleLoad = (event) => {
    // Countries array is initialized the first time onIdle event is emit
    if (isMapLoaded()) {
      return
    }
    handleMapLoaded()
  }

  const onSubmit = (data) => {
    if (!hasGameStarted()) {
      return
    }
    checkAnsweredCountry(data.country)
  }

  const totalAnswers = useMemo(() => Object.keys(answers).length, [answers])
  const wrongAnswers = useMemo(() =>
    Object.keys(answers).filter(key => answers[key].validation === 'wrong').length,
  [answers])

  return (
    <>
      <GameMap mapRef={mapRef} handleClick={handleClick} handleIdle={handleLoad}
        handleHover={handleHover} handleMouseLeave={handleMouseLeave} answers={answers}
        countriesCoords={countriesCoords} />
      <div className="absolute top-2 left-2 right-2 z-50 pr-10">
        <AnswerPanel answered={totalAnswers} wrong={wrongAnswers} total={countriesCount}
          onSubmit={onSubmit} onClick={() => nextCountry()} handleSubmit={handleSubmit} register={register}/>
      </div>
    </>
  )
}
