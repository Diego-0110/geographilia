import { useState } from 'react'

export function useGame (mapRef, sourceId, lang, continent, nextCountryCallback) {
  const [countries, setCountries] = useState([])
  const [remainCountries, setRemainCountries] = useState([])
  const [currentCountry, setCurrentCountry] = useState(null)
  const [countriesCoords, setCountriesCoords] = useState({})
  const [answers, setAnswers] = useState({})

  const regionNames = new Intl.DisplayNames([lang], { type: 'region' })

  const hasGameStarted = () => {
    return currentCountry !== null
  }

  const hasGameEnded = () => {
    return remainCountries.length < 1
  }

  const handleMapLoaded = () => {
    let features = mapRef.current.getSource(sourceId).serialize().data.features
    features = features.map((feat, index) => {
      return { id: index, ...feat }
    })
    const states = features.filter(feat => {
      return feat.properties.iso_3166_1_alpha_2_codes && feat.properties.status === 'Member State' &&
        feat.properties.continent === continent
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
    // console.log(randomCountryId)
    // console.log(remainCountries)
    if (currentCountry?.id !== undefined) { // Not first country
      mapRef.current.setFeatureState({ source: 'countries', id: currentCountry.id },
        { current: false })
    }
    setCurrentCountry({
      id: randomCountry.id,
      code: randomCountry.properties.iso_3166_1_alpha_2_codes
    })
    mapRef.current.setFeatureState({ source: 'countries', id: randomCountry.id },
      { current: true })
    nextCountryCallback(randomCountry)
  }

  const checkAnsweredCountry = (answeredCountry, callback) => {
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
    if (hasGameEnded()) {
      console.log('Game Ended')
      // TODO setGameStatus('ended')
    } else {
      const newRemainCoutries = remainCountries.filter(item => item !== currentCountry.id)
      setRemainCountries(newRemainCoutries)
      nextCountry(newRemainCoutries)
    }
  }

  return {
    answers,
    countriesCoords,
    countriesCount: countries.length,
    hasGameStarted,
    hasGameEnded,
    handleMapLoaded,
    isMapLoaded,
    nextCountry,
    checkAnsweredCountry
  }
}
