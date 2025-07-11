import { Card, ListGroup, Stack } from 'react-bootstrap'
import type { Enhancement } from '../../../types/core.ts'
import type { CraftingIngredient } from '../../../types/crafting.ts'

const ItemDisplay = (props: Props) => {
  const { selectedItem } = props

  return (
    <Card className='w-100 h-100'>
      <Card.Header as='h5'>
        <Card.Title className='m-0'>{selectedItem.name}</Card.Title>
      </Card.Header>
      <Card.Body className='p-2'>
        <Stack direction='horizontal' gap={3} className='w-100 align-items-start'>
          {selectedItem.craftedIn && selectedItem.requirements && (
            <Card className='w-100'>
              <Card.Header>
                <Card.Title className='m-0' as='h6'>
                  Crafted In / Location:&nbsp;
                </Card.Title>
                <Card.Subtitle>{selectedItem.craftedIn ?? 'Unknown'}</Card.Subtitle>
              </Card.Header>

              <Card.Body className='p-0'>
                <ListGroup variant='flush'>
                  {selectedItem.requirements.map((req: CraftingIngredient) => (
                    <ListGroup.Item>
                      <Stack direction='horizontal' className='w-100 align-items-center justify-content-between'>
                        <strong>
                          <small>{req.name}</small>
                        </strong>
                        <span className='text-muted'>
                          <small>{req.quantity ?? 1}</small>
                        </span>
                      </Stack>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          )}

          {selectedItem.foundIn && (
            <Card className='w-100'>
              <Card.Header>
                <Card.Title className='m-0' as='h6'>
                  Found In
                </Card.Title>
              </Card.Header>

              <Card.Body className='p-0'>
                <ListGroup variant='flush'>
                  {selectedItem.foundIn.map((location: string) => (
                    <ListGroup.Item>{location}</ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          )}

          {selectedItem.effectsAdded && (
            <Card className='w-100'>
              <Card.Header>
                <Card.Title className='m-0' as='h6'>
                  Effects Added
                </Card.Title>
              </Card.Header>

              <Card.Body className='p-0'>
                <ListGroup variant='flush'>
                  {selectedItem.effectsAdded.length ? (
                    selectedItem.effectsAdded.map((effect: Enhancement) => (
                      <ListGroup.Item>
                        <small>
                          {effect.name}
                          {effect.modifier && effect.bonus ? ` (+${String(effect.modifier)} ${effect.bonus})` : ''}
                        </small>
                      </ListGroup.Item>
                    ))
                  ) : (
                    <ListGroup.Item>None</ListGroup.Item>
                  )}
                </ListGroup>
              </Card.Body>
            </Card>
          )}
        </Stack>
      </Card.Body>
    </Card>
  )
}

interface Props {
  selectedItem: CraftingIngredient
}

export default ItemDisplay
