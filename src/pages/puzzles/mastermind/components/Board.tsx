import { Stack } from 'react-bootstrap'
import type { Color, FeedbackType } from '../types/types.ts'
import GuessRow from './GuessRow.tsx'

const Board = (props: Props) => {
  const { guesses } = props

  return (
    <Stack direction='vertical' gap={2} className='align-items-center'>
      {guesses.map((guess, i) => (
        <GuessRow key={i} code={guess.code} fb={guess.feedback} />
      ))}
    </Stack>
  )
}

interface Props {
  guesses: { code: Color[]; feedback: FeedbackType }[]
}

export default Board
