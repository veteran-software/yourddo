import * as React from 'react'
import { Accordion, ListGroup } from 'react-bootstrap'
import { FaExclamationTriangle } from 'react-icons/fa'
import type { CraftingIngredient } from '../../../../types/crafting.ts'
import DualShardInstructions from './DualShardInstructions.tsx'

const TierAccordionItem = (props: Props) => {
  const { altarName, eventKey, getDisplay, selectedItem, showDualShardWarning, tier } = props

  if (!selectedItem) return null

  const hasDualShard = selectedItem.requirements.some((selected) => selected.name.includes('Dual Shard'))

  return (
    <Accordion.Item eventKey={eventKey} className='rounded-0'>
      <Accordion.Header>
        {showDualShardWarning && hasDualShard && (
          <span className='align-bottom'>
            <FaExclamationTriangle color='yellow' />
            &nbsp;
          </span>
        )}
        [{tier}] : {selectedItem.name}
      </Accordion.Header>
      <Accordion.Body className='p-0'>
        <ListGroup variant='flush'>
          <ListGroup.Item variant='secondary' className='text-center'>
            <small>
              Combine the following ingredients in the <strong>{altarName}</strong>.<br />
              Hover or tap on the ingredient image to learn more about each ingredient.
            </small>
          </ListGroup.Item>
          {hasDualShard && showDualShardWarning && <DualShardInstructions selectedItem={selectedItem} />}
          {selectedItem.requirements.map((ingredient) => getDisplay(ingredient))}
        </ListGroup>
      </Accordion.Body>
    </Accordion.Item>
  )
}

interface Props {
  eventKey: string
  tier: string
  altarName: string
  selectedItem?: {
    name: string
    requirements: CraftingIngredient[]
  }
  getDisplay: (requirement: CraftingIngredient) => React.JSX.Element
  showDualShardWarning?: boolean
}

export default TierAccordionItem
