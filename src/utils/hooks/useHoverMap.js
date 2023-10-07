import { useState } from 'react'

export function useHoverMap (mapRef, sourceId) {
  const [hover, setHover] = useState('')

  const handleHover = (evt) => {
    if (evt.features.length > 0) {
      const newValue = evt.features.length ? evt.features[0].id : ''
      if (newValue !== hover) {
        if (hover !== '') {
          mapRef.current.setFeatureState({ source: sourceId, id: hover },
            { hover: false })
        }
        setHover(newValue)
        mapRef.current.setFeatureState({ source: sourceId, id: newValue },
          { hover: true })
      }
    }
  }

  const handleMouseLeave = () => {
    if (hover !== '') {
      mapRef.current.setFeatureState({ source: sourceId, id: hover },
        { hover: false })
    }
    setHover('')
  }

  return [handleHover, handleMouseLeave]
}
