import camelcase from 'camelcase'
import { Card, Container, ListGroup, Stack } from 'react-bootstrap'
import FallbackImage from '../../../components/common/FallbackImage.tsx'
import { ingredients as ings } from '../../../data/ingredients.ts'
import type { Ingredient } from '../../../types/ingredients.ts'
import { ICON_BASE } from '../../../utils/constants.ts'
import { formatIngredientName } from '../../../utils/utils.ts'

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
            {sortedEntries.map(([name, qty]) => {
              const ingredient = ings.find((ingredient: Ingredient) => ingredient.name === name)
              const formattedName: string = formatIngredientName(ingredient?.image ?? ingredient?.name ?? '')
              const imageSrc = `${ICON_BASE}${camelcase(formattedName)}.png`

              return (
                <ListGroup.Item key={name} className='p-2'>
                  <Stack direction='horizontal' className='w-100 justify-content-between align-items-center'>
                    <Container className='m-0 p-0 text-start'>
                      <FallbackImage src={imageSrc} alt={name} width='26px' />
                      &nbsp;
                      <span>{name}</span>
                    </Container>
                    <Container className='m-0 p-0 text-end'>
                      <span className='text-muted'>{qty}</span>
                    </Container>
                  </Stack>
                </ListGroup.Item>
              )
            })}
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
