import { Card, CardContent, CardHeader } from './ui/ui/card'
import { Button } from './ui/ui/button'

export default function ResultsPanel ({ wrong, total, time }) {
  const correctPercentage = (total - wrong) / total * 100
  return (
    <Card className="absolute margin-auto right-0 left-0 top-1/2 h-max max-w-xl mx-auto">
      <CardHeader className="pb-3">
        <h2 className='font-bold'>
          Congratulations! You&apos;ve got {correctPercentage.toFixed(2)}% correct
          in {time.toFixed(2)} s
        </h2>
      </CardHeader>
      <CardContent>

        <div className="flex flex-shrink-0 gap-2">
          <Button type="button">
            Show results
          </Button>
          <Button variant="secondary" type="button">
            Play again
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
