import { Button, OverlayTrigger, Popover, Stack } from 'react-bootstrap'
import { FaRegQuestionCircle } from 'react-icons/fa'

const InstructionsPopover = (props: Props) => {
  const { instructionsText } = props

  const popover = (
    <Popover id='instructions-popover'>
      <Popover.Header as='h3'>Crafting Instructions</Popover.Header>
      <Popover.Body>{instructionsText}</Popover.Body>
    </Popover>
  )

  return (
    <OverlayTrigger trigger='click' placement='auto' overlay={popover}>
      <Button size='sm' variant='outline-info' className='py-0 d-flex align-items-center'>
        <Stack direction='horizontal' gap={1} className='align-items-center'>
          Crafting Instructions
          <FaRegQuestionCircle size={13} />
        </Stack>
      </Button>
    </OverlayTrigger>
  )
}

interface Props {
  instructionsText: string
}

export default InstructionsPopover
