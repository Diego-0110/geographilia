'use client'
import { Card, CardContent, CardHeader } from '@components/ui/ui/card'
import { useForm } from 'react-hook-form'
import { Button } from '@components/ui/ui/button'

import { redirect, useRouter } from 'next/navigation'
// TODO Game Selection Menu
export default function Home () {
  const { push } = useRouter()
  const { register, handleSubmit } = useForm()

  const onSubmit = (data) => {
    push(`/country-guesser/${data.countries.join('/')}`)
  }
  return (
    <main className="flex justify-center items-center w-100 min-h-screen p-3">
      <Card className="max-w-xl flex-grow">
        <CardHeader>
          <h1 className="font-bold">Geographilia</h1>
        </CardHeader>
        <CardContent>
          <h1 className="font-bold">Preferences Selection</h1>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div>
              <input id="africa" type="checkbox"
                {...register('countries', { required: true })} value="Africa" />
              <label htmlFor="">Africa</label>
              <input id="Asia" type="checkbox"
                {...register('countries', { required: true })} value="Asia" />
              <label htmlFor="">Asia</label>
              <input id="americas" type="checkbox"
                {...register('countries', { required: true })} value="Americas" />
              <label htmlFor="">Americas</label>
              <input id="europe" type="checkbox"
                {...register('countries', { required: true })} value="Europe"/>
              <label htmlFor="">Europe</label>
              <input id="oceania" type="checkbox"
                {...register('countries', { required: true })} value="Oceania"/>
              <label htmlFor="">Oceania</label>
            </div>
            <Button type="submit">
              Play
            </Button>
          </form>
          <p>You can try this examples: </p>
          <div className="flex flex-col gap-2 text-blue-500 underline">
            <a href="/country-guesser/Africa">Countries of Africa</a>
            <a href="/country-guesser/Asia">Countries of Asia</a>
            <a href="/country-guesser/Americas">Countries of Americas</a>
            <a href="/country-guesser/Europe">Countries of Europe</a>
            <a href="/country-guesser/Oceania">Countries of Oceania</a>
            <a href="/country-guesser/Africa/Asia/Americas/Europe/Oceania">All countries</a>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
