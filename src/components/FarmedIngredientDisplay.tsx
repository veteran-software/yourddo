import camelcase from 'camelcase'
import { useEffect, useState } from 'react'
import { Container, Image, ListGroup, Stack } from 'react-bootstrap'
import type { Ingredient } from '../types/ingredients.ts'
import NoteTooltip from './NoteTooltip.tsx'

const FarmedIngredientDisplay = (props: Props) => {
  const { ingredient, quantity } = props

  const [imageSrc, setImageSrc] = useState<string>()

  useEffect(() => {
    if (!ingredient) return
    void (async () => {
      const image = (await import(
        `../assets/icons/${camelcase(ingredient.name)}.png`
      )) as {
        default: string
      }
      setImageSrc(image.default)
    })()
  }, [ingredient])

  if (!ingredient) {
    return <></>
  }

  return (
    <ListGroup.Item>
      <Stack direction='horizontal' gap={3}>
        <Image src={imageSrc} alt={ingredient.name} title={ingredient.name} />

        <Stack direction='vertical' gap={0} className='text-wrap'>
          <Stack direction='horizontal' gap={2}>
            <strong>{ingredient.name}</strong>
            {ingredient.notes && (
              <NoteTooltip id={ingredient.name} text={ingredient.notes} />
            )}
          </Stack>
          <small>
            <strong>
              Farming Location{ingredient.foundIn.length > 1 ? 's' : ''}
            </strong>
            :{' '}
            {ingredient.foundIn
              .toSorted((a, b) => a.localeCompare(b))
              .join(', ')}
          </small>
        </Stack>

        <Container className='w-auto'>
          <strong>{String(quantity)}</strong>
        </Container>
      </Stack>
    </ListGroup.Item>
  )
}

interface Props {
  ingredient: Ingredient | undefined
  quantity: number
}

export default FarmedIngredientDisplay
