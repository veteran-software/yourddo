import { Badge } from 'react-bootstrap'
import type { Color, Variant } from 'react-bootstrap/esm/types'

const GenericBadge = (props: Props) => {
  const { badgeText, fontSize = '0.6rem', onClick } = props

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
      className={`p-1 shadow-sm border border-1 ${onClick ? 'cursor-pointer' : ''}`}
      style={{ fontSize: fontSize }}
      onClick={onClick}
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
