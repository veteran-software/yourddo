import { Container, OverlayTrigger, Popover, Stack } from 'react-bootstrap'
import type { ItemRollup, Location } from '../components/trove/types.ts'
import type { Ingredient } from '../types/ingredients.ts'
import { formatNumber } from './objectUtils.ts'
import { normItem } from './troveUtils.ts'

// Local helper: convert common plural collectible names to singular for consistent Trove keys
const toSingularName = (materialName: string): string => {
  const raw = (materialName || '').trim()
  if (!raw) return raw
  const lower = raw.toLowerCase()
  if (lower === 'cannith essences') return 'Cannith Essence'
  if (lower === 'purified eberron dragonshard fragments') return 'Purified Eberron Dragonshard Fragment'
  if (/[^aeiou]ies$/i.test(raw)) return raw.replace(/ies$/i, 'y')
  if (/(ches|shes|xes|zes|ses)$/i.test(raw)) return raw.replace(/es$/i, '')
  if (/(^.*[^s])s$/i.test(raw)) return raw.replace(/s$/i, '')
  return raw
}

// ----- Extracted helpers to reduce cognitive complexity in getOwnedIngredients -----
interface CharacterEntry { character: string; locations: Record<Location, number> }

const renderBindingNode = (ingredient: Ingredient | undefined, troveBinding?: string): React.JSX.Element => {
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

const normalizeEntries = (byCharacter: unknown): CharacterEntry[] => {
  if (Array.isArray(byCharacter)) return byCharacter as CharacterEntry[]
  const map = byCharacter as Record<string, Record<Location, number>> ?? {}
  return Object.entries(map).map(([character, locations]) => ({ character, locations }))
}

const computeTotalOwned = (entries: CharacterEntry[]): number =>
  entries.flatMap((e) => Object.values(e.locations)).reduce((sum, qty) => sum + qty, 0)

const qtyColorClass = (owned: number, required: number): string => {
  if (owned <= 0) return 'text-danger'
  if (owned < required) return 'text-warning'
  return 'text-success'
}

const buildPopover = (
  id: string,
  ingredient: Ingredient,
  entries: CharacterEntry[],
  troveBinding?: string
): React.JSX.Element => (
  <Popover id={`ing-${id}`} className='m-0 p-0 position-fixed'>
    <Popover.Header as='h3'>{ingredient.name}</Popover.Header>
    <Popover.Body className='ps-1'>
      {renderBindingNode(ingredient, troveBinding)}
      <ul className='mb-0'>
        {entries.map(({ character, locations }) => {
          const location = Object.keys(locations).join(', ')
          const qty = Object.values(locations).reduce((sum, q) => sum + q, 0)
          return (
            <li key={character}>
              {character === '-' ? location : character} {character === '-' ? '' : `(${location})`}: {formatNumber(qty)}
            </li>
          )
        })}
      </ul>
    </Popover.Body>
  </Popover>
)

export const getOwnedIngredients = (
  ingredient: Ingredient | undefined,
  quantityRequired: number | string,
  troveData: ItemRollup | null
): React.JSX.Element => {
  if (ingredient && troveData) {
    const ingredientKey = normItem(toSingularName(ingredient.name))
    const requiredNum = typeof quantityRequired === 'number' ? quantityRequired : Number(quantityRequired)
    const troveItem = troveData[ingredientKey]
    const entries = troveItem ? normalizeEntries(troveItem.byCharacter) : []
    const popover = buildPopover(ingredientKey, ingredient, entries, troveItem?.binding)

    if (troveItem) {
      const totalOwned = computeTotalOwned(entries)
      const color = qtyColorClass(totalOwned, requiredNum)
      return (
        <Container className='d-flex justify-content-end pe-1'>
          <OverlayTrigger trigger={['click', 'hover']} placement='auto' overlay={popover}>
            <Stack direction='horizontal' gap={2} className={color}>
              {formatNumber(totalOwned)}/{formatNumber(requiredNum)}
            </Stack>
          </OverlayTrigger>
        </Container>
      )
    }

    // trove present but item not owned
    return (
      <Container className='d-flex justify-content-end pe-1'>
        <OverlayTrigger trigger={['click', 'hover']} placement='auto' overlay={popover}>
          <Stack direction='horizontal' gap={2} className='text-danger'>
            {formatNumber(0)}/{formatNumber(requiredNum)}
          </Stack>
        </OverlayTrigger>
      </Container>
    )
  }

  // No trove data: still format the required quantity for locale friendliness
  const quantityRequiredNum = typeof quantityRequired === 'number' ? quantityRequired : Number(quantityRequired)
  return <Container className='d-flex justify-content-end pe-1'>{formatNumber(quantityRequiredNum)}</Container>
}
