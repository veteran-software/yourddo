import { Container, Stack } from 'react-bootstrap'
import { FaGhost, FaRegCircleDown, FaRegCircleUp } from 'react-icons/fa6'

const ServerStatusDisplay = (props: Props) => {
  const { isGhost = false, name, up } = props

  const getIcon = (up: boolean | undefined) => {
    if (up === undefined) {
      return <FaRegCircleDown size={15} color={'red'} />
    }

    if (isGhost) {
      return up ? <FaGhost size={15} color={'green'} /> : <FaGhost size={15} color={'red'} />
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
  isGhost: boolean
  name: string
  up: boolean | undefined
}

export default ServerStatusDisplay
