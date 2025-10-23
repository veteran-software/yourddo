import { Container, OverlayTrigger, Popover, Stack } from 'react-bootstrap'
import type { ItemRollup, Location } from '../components/trove/types.ts'
import type { Ingredient } from '../types/ingredients.ts'
import { formatNumber } from './objectUtils.ts'
import { normItem } from './troveUtils.ts'

export const getOwnedIngredients = (
  ingredient: Ingredient | undefined,
  quantityRequired: number | string,
  troveData: ItemRollup | null
): React.JSX.Element => {
  const getBinding = (ingredient: Ingredient | undefined) => {
    if (!ingredient) return <></>

    if (ingredient.binding?.type === 'Unbound') {
      return (
        <Container className='mb-2'>
          <span className='fw-bold text-success'>Unbound</span>
        </Container>
      )
    }

    if (ingredient.binding?.to === 'Character') {
      return (
        <Container className='mb-2'>
          <span className='fw-bold text-danger'>Bound to Character</span>
        </Container>
      )
    } else if (ingredient.binding?.to === 'Account') {
      return (
        <Container className='mb-2'>
          <span className='fw-bold text-warning'>Bound to Account</span>
        </Container>
      )
    }
  }

  if (ingredient && troveData) {
    const ingredientName = normItem(ingredient.name)
    const quantityRequiredNum = typeof quantityRequired === 'number' ? quantityRequired : Number(quantityRequired)

    const troveItem = troveData[ingredientName]

    const popover = (
      <Popover id={`ing-${ingredientName}`} className='m-0 p-0 position-fixed'>
        <Popover.Header as='h3'>{ingredient.name}</Popover.Header>

        <Popover.Body className='ps-1'>
          {getBinding(ingredient)}
          <ul className='mb-0'>
            {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
            {Object.entries(troveItem?.byCharacter ?? {}).map(([character, locMap]) => {
              const location: string = Object.keys(locMap).join(', ')

              return (
                <li key={character}>
                  {character === '-' ? location : character} {character === '-' ? '' : `(${location})`}:{' '}
                  {Object.values(locMap).reduce((sum, qty) => sum + qty, 0)}
                </li>
              )
            })}
          </ul>
        </Popover.Body>
      </Popover>
    )

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (troveItem) {
      const totalOwned: number = Object.values(troveItem.byCharacter)
        .flatMap((locMap: Record<Location, number>) => Object.values(locMap))
        .reduce((sum: number, qty: number) => sum + qty, 0)

      let color = 'text-danger'
      if (totalOwned < quantityRequiredNum) color = 'text-warning'
      if (totalOwned >= quantityRequiredNum) color = 'text-success'

      return (
        <Container className='d-flex justify-content-end pe-1'>
          <OverlayTrigger trigger={['click', 'hover']} placement='auto' overlay={popover}>
            <Stack direction='horizontal' gap={2} className={color}>
              {formatNumber(totalOwned)}/{quantityRequired}
            </Stack>
          </OverlayTrigger>
        </Container>
      )
    }

    return (
      <Container className='d-flex justify-content-end pe-1'>
        <OverlayTrigger trigger={['click', 'hover']} placement='auto' overlay={popover}>
          <Stack direction='horizontal' gap={2} className='text-danger'>
            0/{quantityRequired}
          </Stack>
        </OverlayTrigger>
      </Container>
    )
  }

  return <Container className='d-flex justify-content-end pe-1'>{quantityRequired}</Container>
}
