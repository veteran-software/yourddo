import { CloseButton, Popover } from 'react-bootstrap'
import type { OverlayInjectedProps } from 'react-bootstrap/OverlayTrigger'
import type { Ingredient } from '../../types/ingredients.ts'
import { renderBindingNode } from '../../utils/jsxUtils.tsx'
import { formatNumber } from '../../utils/objectUtils.ts'
import type { Location } from '../trove/types.ts'

interface CharacterEntry {
  character: string
  locations: Record<Location, number>
}

interface OverlayWrapperProps {
  id: string
  ingredient: Ingredient
  entries: CharacterEntry[]
  troveBinding?: string
}

const OverlayWrapper = (props: OverlayWrapperProps & Partial<OverlayInjectedProps>) => {
  const { id, ingredient, entries, troveBinding, ...popper } = props
  return (
    <Popover id={`ing-${id}`} className='m-0 p-0' {...popper}>
      <Popover.Header
        as='h3'
        className='d-flex align-items-center justify-content-between py-1 px-2'
        style={{ fontSize: '1rem' }}
      >
        <div className='flex-grow-1 text-center'>{ingredient.name}</div>
        <CloseButton
          className='ms-2'
          onClick={() => {
            if ('hide' in props && typeof props.hide === 'function') {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-call
              props.hide()
            }
          }}
        />
      </Popover.Header>
      <Popover.Body className='ps-1' style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {renderBindingNode(ingredient, troveBinding)}
        <ul className='mb-0'>
          {entries.map(({ character, locations }) => {
            const filteredLocations = Object.entries(locations)
              .filter(([, qty]) => qty > 0)
              .map(([loc]) => loc)
            const location = filteredLocations.join(', ')
            const qty = Object.values(locations).reduce((sum, q) => sum + q, 0)
            if (qty === 0) return null
            return (
              <li key={character}>
                {character === '-' ? location : character} {character === '-' ? '' : `(${location})`}:{' '}
                {formatNumber(qty)}
              </li>
            )
          })}
        </ul>
      </Popover.Body>
    </Popover>
  )
}

export default OverlayWrapper
