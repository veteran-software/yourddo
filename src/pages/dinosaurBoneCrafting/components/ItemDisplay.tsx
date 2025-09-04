import camelcase from 'camelcase'
import { Card, ListGroup, Stack } from 'react-bootstrap'
import FallbackImage from '../../../components/common/FallbackImage.tsx'
import NoteTooltip from '../../../components/common/NoteTooltip.tsx'
import { ingredients } from '../../../data/ingredients.ts'
import type { Enhancement } from '../../../types/core.ts'
import type { CraftingIngredient } from '../../../types/crafting.ts'
import type { Ingredient } from '../../../types/ingredients.ts'
import { ICON_BASE } from '../../../utils/constants.ts'
import { formatIngredientName } from '../../../utils/utils.ts'

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
                  Crafted In / Location:
                </Card.Title>
                <Card.Subtitle>{selectedItem.craftedIn ?? 'Unknown'}</Card.Subtitle>
              </Card.Header>

              <Card.Body className='p-0'>
                <ListGroup variant='flush'>
                  {selectedItem.requirements.map((req: CraftingIngredient, idx: number) => {
                    const ingredient: Ingredient | undefined = ingredients.find(
                      (ingredient: Ingredient) => ingredient.name === req.name
                    )
                    const formattedName: string = formatIngredientName(ingredient?.image ?? ingredient?.name ?? '')
                    const imageSrc = `${ICON_BASE}${camelcase(formattedName)}.png`

                    return (
                      <ListGroup.Item key={`${req.name}-${String(idx)}`}>
                        <Stack direction='horizontal' className='w-100 align-items-center justify-content-between'>
                          <strong>
                            <FallbackImage src={imageSrc} alt={req.name} width='26px' />
                            &nbsp;
                            <small>{req.name}</small>
                          </strong>
                          <span className='text-muted'>
                            <small>{req.quantity ?? 1}</small>
                          </span>
                        </Stack>
                      </ListGroup.Item>
                    )
                  })}
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
                  {selectedItem.foundIn.map((location: string, idx: number) => (
                    <ListGroup.Item key={`${location}-${String(idx)}`}>{location}</ListGroup.Item>
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
                    selectedItem.effectsAdded.map((effect: Enhancement, idx: number) => (
                      <ListGroup.Item key={`${effect.name}-${String(idx)}`}>
                        <small>
                          {effect.name}
                          {effect.modifier && effect.bonus ? ` (+${String(effect.modifier)} ${effect.bonus})` : ''}
                        </small>
                        {effect.notes && (
                          <>
                            &nbsp;
                            <NoteTooltip id={effect.name} text={effect.notes} color={'yellow'} />
                          </>
                        )}
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
