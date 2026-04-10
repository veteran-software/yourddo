import { Badge } from 'react-bootstrap'
import type { Color, Variant } from 'react-bootstrap/esm/types'

const GenericBadge = (props: Props) => {
  const { badgeText, fontSize = '0.6rem' } = props

  let bg: Variant
  let text: Color

  switch (badgeText.toLowerCase()) {
    case 'conflicting':
      bg = 'warning'
      text = 'dark'
      break
    case 'equipped':
      bg = 'success'
      text = 'dark'
      break
    case 'upgrade':
    case 'select':
      bg = 'info'
      text = 'dark'
      break
    default:
      bg = 'primary'
      text = 'light'
      break
  }

  return (
    <Badge
      bg={bg}
      text={text}
      className='p-1 shadow-sm border border-1'
      style={{ fontSize: fontSize }}
    >
      {badgeText}
    </Badge>
  )
}

interface Props {
  badgeText: string
  fontSize?: string
}

export default GenericBadge
