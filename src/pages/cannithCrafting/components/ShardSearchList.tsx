import { ListGroup } from 'react-bootstrap'

const ShardSearchList = (props: Props) => {
  const { affixes, title } = props

  if (!affixes) {
    return <></>
  }

  return (
    <>
      <ListGroup.Item className='bg-light-subtle text-white'>
        <strong>{title}:</strong>
      </ListGroup.Item>
      {affixes
        .split(',')
        .toSorted((a: string, b: string) => a.trim().localeCompare(b.trim()))
        .map((prefix: string) => (
          <ListGroup.Item key={prefix}>
            &nbsp;&nbsp;
            {prefix.trim()}
          </ListGroup.Item>
        ))}
    </>
  )
}

interface Props {
  title: string
  affixes: string | null
}

export default ShardSearchList
