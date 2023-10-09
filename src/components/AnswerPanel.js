import { Card, CardContent, CardHeader } from './ui/ui/card'
import { Progress } from './ui/ui/progress'
import { Input } from './ui/ui/input'
import { Button } from './ui/ui/button'
import { FilledCircle } from './icons'
import { useEffect, useState } from 'react'
import { GAME_STATUS } from '@constants/game'

export default function AnswerPanel ({
  answered, wrong, total, timer, updateTimer, onSubmit, onClick, handleSubmit, register, gameStatus
}) {
  const answeredPercent = answered / total * 100
  const wrongPercent = wrong / total * 100
  const [intervalId, setIntervalId] = useState()

  const handleSecondaryClick = (evt) => {
    if (!intervalId) {
      setIntervalId(setInterval(() => updateTimer(), 100))
    }
    onClick(evt)
  }

  useEffect(() => {
    if (gameStatus === GAME_STATUS.finished) {
      clearInterval(intervalId)
    }
  }, [gameStatus])

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader className="pb-3">
        <p className="flex gap-3 text-sm px-2 font-normal">
          <span className="flex gap-1 self-end text-primary">{answered - wrong} <FilledCircle size={16} /></span>
          <span className="flex gap-1 self-end text-destructive">{wrong} <FilledCircle size={16} /></span>
          <span className="text-[#2d72e0] self-end">{answered} / {total}</span>
          <span className="ml-auto font-mono font-bold text-lg">{timer.toFixed(1)} s</span>
        </p>
        <div className="relative">
          <Progress value={answeredPercent} />
          <Progress value={wrongPercent} className="absolute top-0 bg-transparent"
            subClassName="bg-destructive"/>
        </div>
      </CardHeader>
      <CardContent>
        {gameStatus === GAME_STATUS.finished
          ? <div className="flex flex-shrink-0 gap-2">
              <Button type="button">
                Show results
              </Button>
              <Button variant="secondary" type="button">
                Play again
              </Button>
            </div>
          : <form onSubmit={handleSubmit(onSubmit)} className="flex max-sm:flex-col items-end gap-2">
              <Input {...register('country', { required: true })}/>
              <div className="flex flex-shrink-0 gap-2">
                <Button type="submit">Check</Button>
                <Button variant="secondary" type="button" onClick={handleSecondaryClick}>
                  Random Country
                </Button>
              </div>
            </form>}
      </CardContent>
    </Card>
  )
}
