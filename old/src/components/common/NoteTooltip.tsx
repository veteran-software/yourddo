import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { FaCircleExclamation } from 'react-icons/fa6'

const NoteTooltip = (props: Props) => {
  const { color = 'red', id, text } = props

  return (
    <OverlayTrigger placement='auto' overlay={<Tooltip id={id}>{text}</Tooltip>}>
      <FaCircleExclamation color={color} />
    </OverlayTrigger>
  )
}

interface Props {
  id: string
  text: string
  color?: string
}

export default NoteTooltip
