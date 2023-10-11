import { Card, CardContent, CardHeader } from './ui/ui/card'
import { Progress } from './ui/ui/progress'
import { Input } from './ui/ui/input'
import { Button } from './ui/ui/button'
import { FilledCircle } from './icons'

import { useForm } from 'react-hook-form'

export default function AnswerPanel ({
  answered, wrong, total, timer, onSubmit, onClick, className
}) {
  const { register, handleSubmit } = useForm()
  const answeredPercent = answered / total * 100
  const wrongPercent = wrong / total * 100

  return (
    <Card className={className}>
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
        <form onSubmit={handleSubmit(onSubmit)} className="flex max-sm:flex-col items-end gap-2">
          <Input {...register('country', { required: true })}/>
          <div className="flex flex-shrink-0 gap-2">
            <Button type="submit">Check</Button>
            <Button variant="secondary" type="button" onClick={onClick}>
              Random Country
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
