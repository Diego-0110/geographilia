'use client'
import Game from '@components/Game'

export default function GamePage ({ params }) {
  return (
    <>
      <Game continents={params.region}/>
    </>
  )
}
