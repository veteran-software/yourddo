import * as React from 'react'
import { Accordion, ListGroup } from 'react-bootstrap'
import { shallowEqual } from 'react-redux'
import { altarOfFecundity } from '../../../../data/altarOfFecundity.ts'
import { useAppSelector } from '../../../../redux/hooks.ts'
import type { CraftingIngredient } from '../../../../types/crafting.ts'

const FecundityList = (props: Props) => {
  const { callback } = props

  const { selectedFecundityItem } = useAppSelector((state) => state.greenSteel, shallowEqual)

  if (selectedFecundityItem) {
    return (
      <Accordion.Item eventKey='2' className='rounded-0'>
        <Accordion.Header>[Base Item] : {selectedFecundityItem.name}</Accordion.Header>
        <Accordion.Body className='p-0'>
          <ListGroup variant='flush'>
            <ListGroup.Item variant='secondary' className='text-center'>
              <small>
                Combine the following ingredients in the <strong>Altar of Fecundity</strong>.<br />
                Hover or tap on the ingredient image to learn more about each ingredient.
              </small>
            </ListGroup.Item>
            {selectedFecundityItem.requirements.map((ingredient: CraftingIngredient) =>
              callback(ingredient, altarOfFecundity)
            )}
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

export default FecundityList
