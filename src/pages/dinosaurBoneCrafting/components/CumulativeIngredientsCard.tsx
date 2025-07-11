import { Card, ListGroup, Stack } from 'react-bootstrap'

const CumulativeIngredientsCard = (props: Props) => {
  const { ingredients } = props

  const sortedEntries = Object.entries(ingredients).sort(([a], [b]) => a.localeCompare(b))

  return (
    <Card className='w-100 h-100'>
      <Card.Header>
        <Card.Title className='m-0'>All Ingredients</Card.Title>
      </Card.Header>
      <Card.Body className='p-0'>
        {sortedEntries.length === 0 ? (
          <div className='text-muted text-center'>No ingredients to display</div>
        ) : (
          <ListGroup variant='flush'>
            {sortedEntries.map(([name, qty]) => (
              <ListGroup.Item key={name} className='p-2'>
                <Stack direction='horizontal' className='w-100 justify-content-between align-items-center'>
                  <span>{name}</span>
                  <span className='text-muted'>{qty}</span>
                </Stack>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card.Body>
    </Card>
  )
}

interface Props {
  ingredients: Record<string, number>
}

export default CumulativeIngredientsCard
