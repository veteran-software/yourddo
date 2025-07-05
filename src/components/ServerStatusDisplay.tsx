import type { DateTime } from 'luxon'
import { Container, Stack } from 'react-bootstrap'
import { FaRegQuestionCircle } from 'react-icons/fa'
import { FaCircleNotch, FaRegCircleDown, FaRegCircleUp } from 'react-icons/fa6'
import { formatDateWithOrdinal } from '../utils/dateTimeUtils.ts'

const ServerStatusDisplay = (props: Props) => {
  const { comingSoon = false, comingSoonDate = undefined, name, up } = props

  const getIcon = (up: boolean | undefined) => {
    if (up === undefined && !comingSoon) {
      return <FaRegQuestionCircle size={15} color='yellow' />
    }

    if (comingSoon && comingSoonDate) {
      return (
        <FaCircleNotch
          title={`Coming ${formatDateWithOrdinal(comingSoonDate.toLocal())}!`}
          size={15}
          color='gray'
          style={{ animation: 'spin 1s linear infinite' }}
        />
      )
    }

    return up ? <FaRegCircleUp size={15} color={'green'} /> : <FaRegCircleDown size={15} color={'red'} />
  }

  return (
    <Container className='w-auto m-0 p-0'>
      <Stack direction='horizontal' gap={1} className='align-items-center'>
        <strong>{name}</strong>
        {getIcon(up)}
      </Stack>
    </Container>
  )
}

interface Props {
  comingSoon?: boolean
  comingSoonDate?: DateTime
  name: string
  up: boolean | undefined
}

export default ServerStatusDisplay
