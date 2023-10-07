import { useState } from 'react'

export function useGame (mapRef, sourceId, lang, continent) {
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
        feat.properties.continent === 'Europe'
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

  const nextCountry = () => {
    if (remainCountries.length < 1) {
      return false
    }
    const randomCountryId = remainCountries[Math.floor(Math.random() * remainCountries.length)]
    const randomCountry = countries.find(item => item.id === randomCountryId)
    // console.log(randomCountryId)
    // console.log(remainCountries)
    if (currentCountry?.id !== undefined) {
      mapRef.current.setFeatureState({ source: 'countries', id: currentCountry.id },
        { current: false })
    }
    // console.log(answers)
    if (Object.keys(answers).includes(String(currentCountry?.id))) {
      setRemainCountries(remainCountries.filter(item => item !== randomCountry.id))
    }
    setCurrentCountry({
      id: randomCountry.id,
      code: randomCountry.properties.iso_3166_1_alpha_2_codes
    })
    mapRef.current.setFeatureState({ source: 'countries', id: randomCountry.id },
      { current: true })
    return randomCountry
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
