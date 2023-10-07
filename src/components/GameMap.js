import {
  Map, NavigationControl, Marker,
  ScaleControl, Source, Layer
} from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Badge } from './ui/ui/badge'

import dataGeoJSON from '@app/api/countries.json'
import { countriesFillLayer, countriesLineLayer } from '@constants/gameMapLayers'

export default function GameMap ({
  mapRef, handleClick, handleHover, handleMouseLeave, handleIdle,
  answers, countriesCoords
}) {
  return (
    <Map
      ref={mapRef}
      initialViewState={{
        longitude: -122.4,
        latitude: 37.8,
        zoom: 4
      }}
      className="bg-cyan-500"
      style={{ width: '100%', height: '100vh', backgroundColor: 'rgb(186 230 253)' }}
      interactiveLayerIds={[countriesFillLayer.id]}
      onClick={handleClick}
      onMouseMove={handleHover}
      onMouseLeave={handleMouseLeave}
      onIdle={handleIdle}
      maplibreLogo
    >
      <NavigationControl position="top-right" />
      <ScaleControl />
      <Source id="countries" type="geojson" data={dataGeoJSON} generateId>
        <Layer {...countriesFillLayer} />
        <Layer {...countriesLineLayer} />
      </Source>
      {Object.keys(answers).map(id => {
        const { lon, lat } = countriesCoords[String(id)]
        const additionalStyles = answers[id].validation === 'wrong' ? ' bg-sky-600' : ''
        return (
          <Marker key={id} longitude={lon} latitude={lat} anchor="center" className="group/marker relative z-0 hover:z-40">
            <div className="flex flex-col gap-1 items-center">
              <Badge className={'text-sm group-hover/marker:text-base' + additionalStyles}>
                {answers[id].correctAnswer}
              </Badge>
              {answers[id].validation === 'wrong' &&
                <Badge className="line-through decoration-current bg-destructive text-sm group-hover/marker:text-base">
                  {answers[id].answer}
                </Badge>}
            </div>
          </Marker>
        )
      })}
    </Map>
  )
}
