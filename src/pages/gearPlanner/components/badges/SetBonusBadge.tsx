import { Badge } from 'react-bootstrap'

const SetBonusBadge = (props: Props) => {
  const { openSetBonusBrowser, setName } = props

  return (
    <Badge
      as={openSetBonusBrowser ? 'button' : 'span'}
      key={setName}
      bg='warning'
      text='dark'
      className='ms-1 p-1 shadow-sm border border-1 set-bonus-badge-clickable'
      style={{ fontSize: '0.6rem' }}
      onClick={(e) => {
        e.stopPropagation()
        if (openSetBonusBrowser) {
          openSetBonusBrowser(setName)
        }
      }}
      {...(openSetBonusBrowser ? { type: 'button' } : {})}
    >
      Set: {setName}
    </Badge>
  )
}

interface Props {
  setName: string
  openSetBonusBrowser?: (setName: string) => void
}

export default SetBonusBadge
