import { Stack } from 'react-bootstrap'

const WeaponMultiplier = (props: Props) => {
  const { slot, level } = props

  if (!slot.toLowerCase().startsWith('weapon')) return <></>

  let multiplier = ''
  if (level >= 1 && level <= 9) {
    multiplier = '+1[W]'
  } else if (level >= 10 && level <= 19) {
    multiplier = '+1.5[W]'
  } else if (level >= 20 && level <= 23) {
    multiplier = '+2[W]'
  } else if (level >= 24 && level <= 27) {
    multiplier = '+3[W]'
  } else if (level >= 28 && level <= 34) {
    multiplier = '+4[W]'
  }

  return (
    <Stack direction='horizontal' className='align-items-center justify-content-between'>
      <span>Weapon Dice Multiplier</span>
      <span>{multiplier}</span>
    </Stack>
  )
}

interface Props {
  slot: string
  level: number
}

export default WeaponMultiplier
