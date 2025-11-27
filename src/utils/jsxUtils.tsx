import { Container, OverlayTrigger, Popover, Stack } from 'react-bootstrap'
import type { ItemRollup, Location } from '../components/trove/types.ts'
import type { Ingredient } from '../types/ingredients.ts'
import { formatNumber } from './objectUtils.ts'
import { normItem } from './troveUtils.ts'

// Local helper: convert common plural collectible names to singular for consistent Trove keys
const toSingularName = (materialName: string): string => {
  const raw = String(materialName || '').trim()
  if (!raw) return raw
  const lower = raw.toLowerCase()
  if (lower === 'cannith essences') return 'Cannith Essence'
  if (lower === 'purified eberron dragonshard fragments') return 'Purified Eberron Dragonshard Fragment'
  if (/[^aeiou]ies$/i.test(raw)) return raw.replace(/ies$/i, 'y')
  if (/(ches|shes|xes|zes|ses)$/i.test(raw)) return raw.replace(/es$/i, '')
  if (/(^.*[^s])s$/i.test(raw)) return raw.replace(/s$/i, '')
  return raw
}

export const getOwnedIngredients = (
  ingredient: Ingredient | undefined,
  quantityRequired: number | string,
  troveData: ItemRollup | null
): React.JSX.Element => {
  const getBinding = (ingredient: Ingredient | undefined, troveBinding?: string) => {
    // Prefer explicit binding on the ingredient if present
    if (ingredient?.binding?.type === 'Unbound') {
      return (
        <Container className='mb-2'>
          <span className='fw-bold text-success'>Unbound</span>
        </Container>
      )
    }
    if (ingredient?.binding?.to === 'Character') {
      return (
        <Container className='mb-2'>
          <span className='fw-bold text-danger'>Bound to Character</span>
        </Container>
      )
    }
    if (ingredient?.binding?.to === 'Account') {
      return (
        <Container className='mb-2'>
          <span className='fw-bold text-warning'>Bound to Account</span>
        </Container>
      )
    }

    // Fall back to binding string from Trove data if available
    if (troveBinding) {
      const b = troveBinding.toLowerCase()
      if (b.includes('unbound')) {
        return (
          <Container className='mb-2'>
            <span className='fw-bold text-success'>Unbound</span>
          </Container>
        )
      }
      if (b.includes('character')) {
        return (
          <Container className='mb-2'>
            <span className='fw-bold text-danger'>Bound to Character</span>
          </Container>
        )
      }
      if (b.includes('account')) {
        return (
          <Container className='mb-2'>
            <span className='fw-bold text-warning'>Bound to Account</span>
          </Container>
        )
      }
    }
    return <></>
  }

  if (ingredient && troveData) {
    const ingredientName = normItem(toSingularName(ingredient.name))
    const quantityRequiredNum = typeof quantityRequired === 'number' ? quantityRequired : Number(quantityRequired)

    const troveItem = troveData[ingredientName]

    const popover = (
      <Popover id={`ing-${ingredientName}`} className='m-0 p-0 position-fixed'>
        <Popover.Header as='h3'>{ingredient.name}</Popover.Header>

        <Popover.Body className='ps-1'>
          {getBinding(ingredient, troveItem?.binding)}
          <ul className='mb-0'>
            {(() => {
              const entries = Array.isArray(troveItem?.byCharacter)
                ? troveItem?.byCharacter
                : Object.entries((troveItem?.byCharacter as any) ?? {}).map(([character, locations]) => ({
                    character,
                    locations: locations as Record<Location, number>
                  }))
              return (entries ?? []).map(({ character, locations }) => {
                const location = Object.keys(locations).join(', ')
                const qty = Object.values(locations).reduce((sum, q) => sum + q, 0)
                return (
                  <li key={character}>
                    {character === '-' ? location : character} {character === '-' ? '' : `(${location})`}:{' '}
                    {formatNumber(qty)}
                  </li>
                )
              })
            })()}
          </ul>
        </Popover.Body>
      </Popover>
    )

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (troveItem) {
      const entries = Array.isArray(troveItem.byCharacter)
        ? troveItem.byCharacter
        : Object.entries((troveItem.byCharacter as any) ?? {}).map(([character, locations]) => ({
            character,
            locations: locations as Record<Location, number>
          }))
      const totalOwned: number = (entries as { character: string; locations: Record<Location, number> }[])
        .flatMap((e) => Object.values(e.locations))
        .reduce((sum: number, qty: number) => sum + qty, 0)

      let color = 'text-danger'
      if (totalOwned < quantityRequiredNum) color = 'text-warning'
      if (totalOwned >= quantityRequiredNum) color = 'text-success'

      return (
        <Container className='d-flex justify-content-end pe-1'>
          <OverlayTrigger trigger={['click', 'hover']} placement='auto' overlay={popover}>
            <Stack direction='horizontal' gap={2} className={color}>
              {formatNumber(totalOwned)}/{formatNumber(quantityRequiredNum)}
            </Stack>
          </OverlayTrigger>
        </Container>
      )
    }

    return (
      <Container className='d-flex justify-content-end pe-1'>
        <OverlayTrigger trigger={['click', 'hover']} placement='auto' overlay={popover}>
          <Stack direction='horizontal' gap={2} className='text-danger'>
            {formatNumber(0)}/{formatNumber(quantityRequiredNum)}
          </Stack>
        </OverlayTrigger>
      </Container>
    )
  }

  // No trove data: still format the required quantity for locale friendliness
  const quantityRequiredNum = typeof quantityRequired === 'number' ? quantityRequired : Number(quantityRequired)
  return <Container className='d-flex justify-content-end pe-1'>{formatNumber(quantityRequiredNum)}</Container>
}
