'use client'
import { Card, CardContent, CardHeader } from '@components/ui/ui/card'
import { useForm } from 'react-hook-form'
import { Button } from '@components/ui/ui/button'

import { useRouter } from 'next/navigation'
import CheckBoxLabeled from '@components/ui/ui/CheckboxLabeled'
// TODO Game Selection Menu
export default function Home () {
  const { push } = useRouter()
  const { register, handleSubmit } = useForm()

  const onSubmit = (data) => {
    console.log(data)
    push(`/country-guesser/${data.countries.join('/')}`)
  }
  return (
    <main className="flex justify-center items-center w-100 min-h-screen p-3">
      <Card className="max-w-lg flex-grow">
        <CardHeader>
          <h1 className="font-bold text-4xl">Geographilia</h1>
        </CardHeader>
        <CardContent>
          <h1 className="font-bold text-2xl mb-2">Preferences Selection</h1>
          <form onSubmit={handleSubmit(onSubmit)}>
            <h2 className="font-bold text-xl text-muted-foreground mb-2">Select Continents</h2>
            <div className="flex gap-x-3 flex-wrap [&>*]:basis-28 mb-4">
              <CheckBoxLabeled id="africa" value="Africa" register={register}
                name="countries">
                Africa
              </CheckBoxLabeled>
              <CheckBoxLabeled id="asia" value="Asia" register={register}
                name="countries">
                Asia
              </CheckBoxLabeled>
              <CheckBoxLabeled id="americas" value="Americas" register={register}
                name="countries">
                Americas
              </CheckBoxLabeled>
              <CheckBoxLabeled id="europe" value="Europe" register={register}
                name="countries">
                Europe
              </CheckBoxLabeled>
              <CheckBoxLabeled id="oceania" value="Oceania" register={register}
                name="countries">
                Oceania
              </CheckBoxLabeled>
            </div>
            <div className="flex justify-end mt-10">
              <Button type="submit">
                Play
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
