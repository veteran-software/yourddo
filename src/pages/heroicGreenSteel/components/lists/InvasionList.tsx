import * as React from 'react'
import { Accordion, ListGroup } from 'react-bootstrap'
import { shallowEqual } from 'react-redux'
import { altarOfInvasion } from '../../../../data/altarOfInvasion.ts'
import { useAppSelector } from '../../../../redux/hooks.ts'
import type { CraftingIngredient } from '../../../../types/crafting.ts'

const InvasionList = (props: Props) => {
  const { callback } = props

  const { selectedInvasionItem } = useAppSelector((state) => state.greenSteel, shallowEqual)

  if (selectedInvasionItem) {
    return (
      <Accordion.Item eventKey='3' className='rounded-0'>
        <Accordion.Header>[Base Item] : {selectedInvasionItem.name}</Accordion.Header>
        <Accordion.Body className='p-0'>
          <ListGroup variant='flush'>
            {selectedInvasionItem.requirements.map((ingredient: CraftingIngredient) => (
              <ListGroup.Item key={ingredient.name}>{callback(ingredient, altarOfInvasion)}</ListGroup.Item>
            ))}
          </ListGroup>
        </Accordion.Body>
      </Accordion.Item>
    )
  }

  return <></>
}

interface Props {
  callback: (requirement: CraftingIngredient, whereToLook: CraftingIngredient[]) => React.JSX.Element
}

export default InvasionList
