'use client'
import MainMap from '@components/MainMap'
import { Button } from '@components/ui/ui/button'
import styles from './page.module.css'

export default function Home () {
  return (
    <>
      <Button onClick={() => console.log('A')}>Click me</Button>
      <MainMap />
    </>
  )
}
