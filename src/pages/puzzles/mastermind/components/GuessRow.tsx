import { Stack } from 'react-bootstrap'
import type { Color, FeedbackType } from '../types/types.ts'
import Feedback from './Feedback.tsx'
import Peg from './Peg.tsx'

const GuessRow = (props: Props) => {
  const { code, fb } = props

  return (
    <Stack direction='horizontal' gap={2} className='align-items-center'>
      {code.map((c, i) => (
        <Peg key={i} color={c} />
      ))}

      <Feedback black={fb.black} white={fb.white} />
    </Stack>
  )
}

interface Props {
  code: Color[]
  fb: FeedbackType
}

export default GuessRow
