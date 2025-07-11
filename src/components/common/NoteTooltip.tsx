import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { FaCircleExclamation } from 'react-icons/fa6'

const NoteTooltip = (props: Props) => {
  const { id, text } = props

  return (
    <OverlayTrigger placement='auto' overlay={<Tooltip id={id}>{text}</Tooltip>}>
      <FaCircleExclamation color='red' />
    </OverlayTrigger>
  )
}

interface Props {
  id: string
  text: string
}

export default NoteTooltip
