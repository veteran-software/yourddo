import camelcase from 'camelcase'
import { useEffect, useState } from 'react'
import { Container, Image, Stack } from 'react-bootstrap'
import type { CraftingIngredient } from '../types/crafting.ts'

const CraftedIngredientDisplay = (props: Props) => {
  const { ingredient, quantity } = props

  const [imageSrc, setImageSrc] = useState<string>()

  useEffect(() => {
    if (!ingredient) return
    void (async () => {
      let formattedName = ingredient.name
      if (formattedName.toLowerCase().includes('shard of') && formattedName.toLowerCase().includes('power')) {
        formattedName = ingredient.name
          .replace('Ethereal', '')
          .replace('Material', '')
          .replace('Dominion', '')
          .replace('Opposition', '')
          .replace('Escalation', '')
          .trim()
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
    <Stack direction='horizontal' gap={3}>
      <Image src={imageSrc} alt={ingredient.name} title={ingredient.name} />

      <Stack direction='vertical' gap={0}>
        <strong>{ingredient.name}</strong>
        <small>Crafting Location: {ingredient.craftedIn}</small>
      </Stack>

      <Container className='w-auto'>
        <strong>{String(quantity)}</strong>
      </Container>
    </Stack>
  )
}

interface Props {
  ingredient: CraftingIngredient | undefined
  quantity: number
}

export default CraftedIngredientDisplay
