import { Card, CardContent, CardHeader } from './ui/ui/card'
import { Button } from './ui/ui/button'

export default function ResultsPanel ({ wrong, total, time, className, restart }) {
  const correctPercentage = (total - wrong) / total * 100
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <h2 className='font-bold'>
          Congratulations! You&apos;ve got {correctPercentage.toFixed(2)}% correct
          in {time.toFixed(2)} s
        </h2>
      </CardHeader>
      <CardContent>

        <div className="flex flex-shrink-0 gap-2">
          <Button type="button" onClick={restart}>
            Play again
          </Button>
          <Button variant="secondary" type="button">
            <a href="/">Play other game</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
