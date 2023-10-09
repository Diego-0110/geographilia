'use client'
import Game from '@components/Game'
import styles from './page.module.css'
// TODO Game Selection Menu
export default function Home () {
  return (
    <>
      <h1>Working...</h1>
      <p>You can try this examples: </p>
      <div className="flex flex-col gap-2 text-blue-500 underline">
        <a href="/country-guesser/Africa">Countries of Africa</a>
        <a href="/country-guesser/Asia">Countries of Asia</a>
        <a href="/country-guesser/Americas">Countries of Americas</a>
        <a href="/country-guesser/Europe">Countries of Europe</a>
        <a href="/country-guesser/Oceania">Countries of Oceania</a>
        <a href="/country-guesser/Africa/Asia/Americas/Europe/Oceania">All countries</a>
      </div>
    </>
  )
}
