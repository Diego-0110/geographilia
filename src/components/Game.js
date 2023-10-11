import bbox from '@turf/bbox'
import { useRef, useMemo, useState, useEffect } from 'react'

import AnswerPanel from './AnswerPanel'
import { useHoverMap } from '@utils/hooks/useHoverMap'
import GameMap from './GameMap'
import { useGame } from '@utils/hooks/useGame'
import { GAME_STATUS } from '@constants/game'
import ResultsPanel from './ResultsPanel'

const SOURCE_ID = 'countries'

export default function Game ({ lang = 'en', continents = ['Europe'] }) {
  const mapRef = useRef()
  const [handleHover, handleMouseLeave] = useHoverMap(mapRef, SOURCE_ID)
  const {
    answers,
    countriesCoords,
    countriesCount,
    gameStatus,
    restart: restartUseGame,
    handleMapLoaded,
    isMapLoaded,
    nextCountry,
    checkAnsweredCountry
  } = useGame(mapRef, SOURCE_ID, lang, continents, next => zoomToCountry(next))
  const [timer, setTimer] = useState(0)
  const [intervalId, setIntervalId] = useState()

  useEffect(() => {
    if (gameStatus === GAME_STATUS.finished && intervalId !== null) {
      clearInterval(intervalId)
    }
  }, [gameStatus])

  const restartGame = () => {
    restartUseGame()
    setTimer(0)
    setIntervalId(null)
  }

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

  const handleLoad = (event) => {
    // Countries array is initialized the first time onIdle event is emit
    if (isMapLoaded()) {
      return
    }
    handleMapLoaded()
  }

  const onSubmit = (data) => {
    if (gameStatus !== GAME_STATUS.playing) {
      return
    }
    checkAnsweredCountry(data.country)
  }

  const handleNextCountry = () => {
    if (!intervalId) {
      setIntervalId(setInterval(() => setTimer(val => val + 0.1), 100))
    }
    nextCountry()
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
      <div className="absolute top-2 left-2 right-2 z-50 mr-10">
        {gameStatus === GAME_STATUS.finished
          ? <ResultsPanel className="max-w-3xl mx-auto" total={countriesCount}
              wrong={wrongAnswers} time={timer} restart={restartGame} />
          : <AnswerPanel className="max-w-3xl mx-auto" answered={totalAnswers}
              wrong={wrongAnswers} total={countriesCount} timer={timer}
              onSubmit={onSubmit} onClick={handleNextCountry} />}
      </div>
    </>
  )
}
