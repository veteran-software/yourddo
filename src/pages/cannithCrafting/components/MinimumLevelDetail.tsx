import { ListGroup, Stack } from 'react-bootstrap'
import { titleCase } from 'title-case'

const MinLevelDetail = (props: Props) => {
  const { level, type } = props

  const boundLevel: number = level * 10
  const unboundLevel: number = boundLevel + 50
  const boundEssences: number = boundLevel
  const unboundEssences: number = unboundLevel * 2

  return (
    <>
      <ListGroup.Item>
        <Stack direction='horizontal' className='align-items-center justify-content-between'>
          <span>{titleCase(type)} Level:</span>
          <span>{type === 'bound' ? boundLevel : unboundLevel}</span>
        </Stack>
      </ListGroup.Item>

      <ListGroup.Item>
        <Stack direction='horizontal' className='align-items-center justify-content-between'>
          <span>{titleCase(type)} Essences:</span>
          <span>{type === 'bound' ? boundEssences : unboundEssences}</span>
        </Stack>
      </ListGroup.Item>
    </>
  )
}

interface Props {
  level: number
  type: 'bound' | 'unbound'
}

export default MinLevelDetail
