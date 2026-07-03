import { Badge } from 'react-bootstrap'
import type { Color, Variant } from 'react-bootstrap/esm/types'

const GenericBadge = (props: Props) => {
  const { badgeText, fontSize = '0.6rem', onClick } = props

  let bg: Variant
  let text: Color

  switch (badgeText.toLowerCase()) {
    case 'conflicting':
    case 'redundant':
      bg = 'warning'
      text = 'dark'
      break
    case 'upgrade':
      bg = 'success'
      text = 'light'
      break
    case 'over ml':
      bg = 'secondary'
      text = 'light'
      break
    case 'equipped':
      bg = 'success'
      text = 'dark'
      break
    case 'select':
      bg = 'info'
      text = 'dark'
      break
    case 'overpowered':
      bg = 'danger'
      text = 'light'
      break
    default:
      bg = 'primary'
      text = 'light'
      break
  }

  return (
    <Badge
      as={onClick ? 'button' : 'span'}
      bg={bg}
      text={text}
      className={`p-1 shadow-sm border border-1 ${onClick ? 'cursor-pointer' : ''}`}
      style={{ fontSize: fontSize }}
      onClick={onClick}
      {...(onClick ? { type: 'button' } : {})}
    >
      {badgeText}
    </Badge>
  )
}

interface Props {
  badgeText: string
  fontSize?: string
  onClick?: () => void
}

export default GenericBadge
