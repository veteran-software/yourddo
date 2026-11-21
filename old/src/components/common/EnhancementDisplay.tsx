import { Container } from 'react-bootstrap'
import { FaCaretRight } from 'react-icons/fa6'
import type { Enhancement } from '../../types/core.ts'

const EnhancementDisplay = (props: Props) => {
  const { enhancement } = props

  if (!enhancement) {
    return <></>
  }

  return (
    <Container className='align-top' key={`displayed-enhancement-${enhancement.name}`}>
      <FaCaretRight size={15} />
      &nbsp;
      <strong>{enhancement.name}</strong>:{' '}
      <span className='d-none d-md-inline-block' style={{ color: 'goldenrod' }}>
        {enhancement.description}
      </span>
    </Container>
  )
}

interface Props {
  enhancement: Enhancement | undefined
}

export default EnhancementDisplay
