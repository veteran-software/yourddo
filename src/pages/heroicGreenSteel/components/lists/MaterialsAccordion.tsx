import { Fragment } from 'react'
import { Accordion, ListGroup } from 'react-bootstrap'
import CraftedIngredientDisplay from '../../../../components/CraftedIngredientDisplay.tsx'
import FarmedIngredientDisplay from '../../../../components/FarmedIngredientDisplay.tsx'
import { altarOfDevastation } from '../../../../data/altarOfDevastation.ts'
import { altarOfFecundity } from '../../../../data/altarOfFecundity.ts'
import { altarOfInvasion } from '../../../../data/altarOfInvasion.ts'
import { altarOfSubjugation } from '../../../../data/altarOfSubjugation.ts'
import { ingredients } from '../../../../data/ingredients.ts'
import type { CraftingIngredient } from '../../../../types/crafting.ts'
import { findIngredientByName } from '../../../../utils/objectUtils.ts'

const MaterialsAccordion = (props: Props) => {
  const { craftedMaterials, rawMaterials } = props

  return (
    <Accordion alwaysOpen={false} className='rounded-0'>
      {Object.entries(rawMaterials).length > 0 && (
        <Accordion.Item eventKey='0' className='rounded-0'>
          <Accordion.Header>Materials to Farm</Accordion.Header>
          <Accordion.Body className='p-0'>
            <ListGroup variant='flush'>
              {Object.entries(rawMaterials).map(([name, count]: [name: string, count: number]) => {
                // Don't want to display the weapons required to charge depleted cells
                // It's basically ingredient bloat
                const pattern = new RegExp(`\\b(${prefixes.join('|')})\\s+(${suffixes.join('|')})\\b`, 'i')

                if (pattern.test(name)) {
                  return <Fragment key={name} />
                }

                if (findIngredientByName(name, ingredients as CraftingIngredient[]) === undefined) {
                  console.debug(name)
                }

                return (
                  <ListGroup.Item key={name}>
                    <FarmedIngredientDisplay
                      ingredient={findIngredientByName(name, ingredients as CraftingIngredient[])}
                      quantity={count}
                    />
                  </ListGroup.Item>
                )
              })}
            </ListGroup>
          </Accordion.Body>
        </Accordion.Item>
      )}

      {Object.entries(craftedMaterials).length > 0 && (
        <Accordion.Item eventKey='1' className='rounded-0'>
          <Accordion.Header>Materials to Craft</Accordion.Header>
          <Accordion.Body className='p-0'>
            <ListGroup variant='flush'>
              {Object.entries(craftedMaterials).map(([name, count]: [name: string, count: number]) => {
                return (
                  <ListGroup.Item key={name}>
                    <CraftedIngredientDisplay
                      ingredient={findIngredientByName(name, [
                        ...altarOfFecundity,
                        ...altarOfInvasion,
                        ...altarOfSubjugation,
                        ...altarOfDevastation
                      ])}
                      quantity={count}
                    />
                  </ListGroup.Item>
                )
              })}
            </ListGroup>
          </Accordion.Body>
        </Accordion.Item>
      )}
    </Accordion>
  )
}

interface Props {
  rawMaterials: Record<string, number>
  craftedMaterials: Record<string, number>
}

export default MaterialsAccordion

const prefixes = [
  'green steel',
  'enchanted',
  'earth',
  'air',
  'fire',
  'water',
  'positive energy',
  'negative energy',
  'ash',
  'dust',
  'ice',
  'lightning',
  'magma',
  'mineral',
  'ooze',
  'radiance',
  'salt',
  'smoke',
  'steam',
  'vacuum',
  'land',
  'stalemate',
  'tempered'
]

const suffixes = ['accessory', 'weapon']
