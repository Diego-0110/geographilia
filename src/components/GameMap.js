import {
  Map, NavigationControl, Marker,
  ScaleControl, Source, Layer
} from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import Badge from './ui/ui/badge'

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
        longitude: 0,
        latitude: 30,
        zoom: 2
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
        const variant = answers[id].validation === 'wrong' ? 'red' : 'green'
        return (
          <Marker key={id} longitude={lon} latitude={lat} anchor="center" className="group/marker relative z-0 hover:z-40">
            <div className="absolute -bottom-2 group-hover/marker:bottom-full left-0 right-0 max-w-xs mx-auto flex flex-col gap-1 items-center scale-0 group-hover/marker:scale-100 opacity-0 group-hover/marker:opacity-100 transition-all ease-in-out whitespace-nowrap">
              <Badge variant={variant}>
                {answers[id].answer}
              </Badge>
              {answers[id].validation === 'wrong' &&
                <Badge className="text-sm px-2 py-0">
                  {answers[id].correctAnswer}
                </Badge>}
            </div>
            <div className="w-5 h-5 rounded-full bg-sky-600 border-2 border-white"></div>
          </Marker>
        )
      })}
    </Map>
  )
}
