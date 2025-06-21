import camelcase from 'camelcase'
import { useEffect, useState } from 'react'
import { Container, Image, Stack } from 'react-bootstrap'
import type { CraftingIngredient } from '../types/crafting.ts'
import type { Ingredient } from '../types/ingredients.ts'
import { FOCI } from '../utils/constants.ts'

const CraftedIngredientDisplay = (props: Props) => {
  const { ingredient, quantity } = props

  const [imageSrc, setImageSrc] = useState<string>()

  useEffect(() => {
    if (!ingredient) return

    void (async () => {
      let formattedName: string = ingredient.name

      if (/\bshard\s+of(?:\s+\w+)?\s+power\b/i.test(formattedName)) {
        formattedName = ingredient.name
          .replace(/\b(ethereal|material|dominion|opposition|escalation)\b/gi, '')
          .replace(/\s+/g, ' ')
          .trim()
      }

      const regex = new RegExp(`\\b(${FOCI.join('|')})\\s+(Weapon|Accessory)\\b`, 'gi')
      if (regex.test(formattedName)) {
        formattedName = `Green Steel ${formattedName}`
      }

      const image = (await import(`../assets/icons/${camelcase(formattedName)}.png`)) as {
        default: string
      }

      setImageSrc(image.default)
    })()
  }, [ingredient])

  if (!ingredient) {
    return <></>
  }

  return (
    <Stack direction='horizontal' gap={3} className='align-items-center'>
      <Image src={imageSrc} alt={ingredient.name} title={ingredient.name} />

      <Stack direction='vertical' gap={0} className='text-wrap justify-content-center'>
        {ingredient.name}
        {(ingredient as CraftingIngredient).craftedIn && (
          <small>Crafting Location: {(ingredient as CraftingIngredient).craftedIn}</small>
        )}
      </Stack>

      <Container className='w-auto'>
        <strong>{String(quantity)}</strong>
      </Container>
    </Stack>
  )
}

interface Props {
  ingredient: CraftingIngredient | Ingredient | undefined
  quantity: number
}

export default CraftedIngredientDisplay
