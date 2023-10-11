import { useState } from 'react'
import { GAME_STATUS } from '@constants/game'

export function useGame (mapRef, sourceId, lang, continents, nextCountryCallback) {
  const [countries, setCountries] = useState([])
  const [remainCountries, setRemainCountries] = useState([])
  const [currentCountry, setCurrentCountry] = useState(null)
  const [countriesCoords, setCountriesCoords] = useState({})
  const [answers, setAnswers] = useState({})
  const [gameStatus, setGameStatus] = useState(GAME_STATUS.waiting)

  const regionNames = new Intl.DisplayNames([lang], { type: 'region' })

  const restart = () => {
    setRemainCountries(countries.map(feat => feat.id))
    setCurrentCountry(null)
    setAnswers({})
    setGameStatus(GAME_STATUS.waiting)
    mapRef.current.removeFeatureState({ source: 'countries' })
  }

  const hasGameStarted = () => {
    return gameStatus === GAME_STATUS.playing
  }

  const hasGameFinished = () => {
    return gameStatus === GAME_STATUS.finished
  }

  const handleMapLoaded = () => {
    let features = mapRef.current.getSource(sourceId).serialize().data.features
    features = features.map((feat, index) => {
      return { id: index, ...feat }
    })
    const states = features.filter(feat => {
      return feat.properties.iso_3166_1_alpha_2_codes && feat.properties.status === 'Member State' &&
        continents.includes(feat.properties.continent)
    })
    const newCountriesCoords = {}
    states.forEach(feat => {
      newCountriesCoords[String(feat.id)] = feat.properties.geo_point_2d
    })
    // console.log(newCountriesCoords)
    setCountriesCoords(newCountriesCoords)
    setCountries(states)
    setRemainCountries(states.map(feat => feat.id))
    // console.log(states)
  }

  const isMapLoaded = () => {
    return countries.length > 0
  }

  const nextCountry = (remainCountriesParam = remainCountries) => {
    if (remainCountriesParam.length < 1) {
      return
    }
    const randomCountryId = remainCountriesParam[Math.floor(Math.random() * remainCountriesParam.length)]
    const randomCountry = countries.find(item => item.id === randomCountryId)
    if (currentCountry?.id !== undefined) { // Not first country
      mapRef.current.setFeatureState({ source: 'countries', id: currentCountry.id },
        { current: false })
    } else {
      setGameStatus(GAME_STATUS.playing)
    }
    setCurrentCountry({
      id: randomCountryId,
      code: randomCountry.properties.iso_3166_1_alpha_2_codes
    })
    mapRef.current.setFeatureState({ source: 'countries', id: randomCountryId },
      { current: true })
    nextCountryCallback(randomCountry)
  }

  const checkAnsweredCountry = (answeredCountry) => {
    const currentCountryName = regionNames.of(currentCountry.code || '')
    console.log(currentCountryName)
    console.log(answeredCountry === currentCountryName)
    const validation = (answeredCountry === currentCountryName) ? 'correct' : 'wrong'
    mapRef.current.setFeatureState({ source: 'countries', id: currentCountry.id },
      { answer: validation })
    setAnswers({
      ...answers,
      [String(currentCountry.id)]:
      { validation, answer: answeredCountry, correctAnswer: currentCountryName }
    })
    const newRemainCountries = remainCountries.filter(item => item !== currentCountry.id)
    if (newRemainCountries.length < 1) {
      setGameStatus(GAME_STATUS.finished)
      console.log('Game Ended')
    } else {
      // console.log('new', newRemainCountries)
      setRemainCountries(newRemainCountries)
      nextCountry(newRemainCountries)
    }
  }

  return {
    answers,
    countriesCoords,
    countriesCount: countries.length,
    gameStatus,
    restart,
    hasGameStarted,
    hasGameFinished,
    handleMapLoaded,
    isMapLoaded,
    nextCountry,
    checkAnsweredCountry
  }
}
