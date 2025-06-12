import { Container, Stack } from 'react-bootstrap'
import NoteTooltip from '../../../components/NoteTooltip.tsx'

const DropdownItemTitle = (props: Props) => {
  const { notes, subtitle, title } = props

  if (!title) {
    return <h5>Unknown Item</h5>
  }

  return (
    <h6 className='d-flex flex-row justify-content-between'>
      <Stack direction='horizontal' gap={2} className='align-items-center'>
        {notes && (
          <NoteTooltip id={`${title}-${subtitle ?? ''}`} text={notes} />
        )}
        <strong>{title}</strong>
      </Stack>

      {subtitle && (
        <Container
          className='m-0 p-0 w-auto d-none d-md-block'
          style={{ fontSize: '0.7rem' }}
        >
          ({subtitle})
        </Container>
      )}
    </h6>
  )
}

interface Props {
  subtitle?: string
  title: string | undefined
  notes?: string
}

export default DropdownItemTitle
