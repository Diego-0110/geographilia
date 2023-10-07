import { Card, CardContent, CardHeader } from './ui/ui/card'
import { Progress } from './ui/ui/progress'
import { Input } from './ui/ui/input'
import { Button } from './ui/ui/button'
import { FilledCircle } from './icons'

export default function AnswerPanel ({ answered, wrong, total, onSubmit, onClick, handleSubmit, register }) {
  const answeredPercent = answered / total * 100
  const wrongPercent = wrong / total * 100

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader className="pb-3">
        <p className="flex gap-3 text-sm px-2 font-normal">
          <span className="flex gap-1 text-primary">{answered - wrong} <FilledCircle size={16} /></span>
          <span className="flex gap-1 text-destructive">{wrong} <FilledCircle size={16} /></span>
          <span className="text-[#2d72e0]">{answered} / {total}</span>
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
