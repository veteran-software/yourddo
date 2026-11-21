import { Container } from 'react-bootstrap'
import type { IconType } from 'react-icons'
import { FaDiceFive, FaDiceFour, FaDiceOne, FaDiceSix, FaDiceThree, FaDiceTwo } from 'react-icons/fa'
import { type Color, COLOR_MAP } from '../types/types.ts'

const DICE_ICONS: Record<number, IconType> = {
  1: FaDiceOne,
  2: FaDiceTwo,
  3: FaDiceThree,
  4: FaDiceFour,
  5: FaDiceFive,
  6: FaDiceSix
}

const Peg = (props: Props) => {
  const { color, onClick } = props

  const bg: string = color ? COLOR_MAP[color as Color] : '#ddd'
  const DiceIcon: IconType | null = color ? DICE_ICONS[color] : null

  return (
    <Container
      className='d-flex align-items-center justify-content-center border border-light-subtle rounded-5 p-0 m-0'
      onClick={onClick}
      style={{
        width: 40,
        height: 40,
        background: bg,
        cursor: onClick ? 'pointer' : 'default'
      }}
    >
      {DiceIcon && (
        <div
          style={{
            background: 'rgba(0,0,0,0.6)', // dark background behind icon
            borderRadius: '50%',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <DiceIcon color='#fff' size='1.3em' />
        </div>
      )}
    </Container>
  )
}

interface Props {
  color: number | null
  onClick?: () => void
}

export default Peg
