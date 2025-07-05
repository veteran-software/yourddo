import { Fragment, useMemo } from 'react'
import { ListGroup } from 'react-bootstrap'
import FarmedIngredientDisplay from '../../../components/FarmedIngredientDisplay.tsx'
import { ingredients } from '../../../data/ingredients.ts'
import type { Ingredient } from '../../../types/ingredients.ts'
import { rawMaterialsText } from '../../../utils/strings.ts'

const RawMaterialList = (props: Props) => {
  const { rawMaterials } = props

  const ingredientsMap: Record<string, Ingredient> = Object.fromEntries(
    ingredients.map((ingredient) => [ingredient.name, ingredient])
  )

  const sortedMaterials = useMemo(
    () => Object.entries(rawMaterials).sort(([a], [b]) => a.localeCompare(b)),
    [rawMaterials]
  )

  if (Object.entries(rawMaterials).length === 0) return <></>

  return Object.entries(rawMaterials).length > 0 ? (
    <ListGroup>
      <ListGroup.Item variant={'secondary'}>
        <strong>{rawMaterialsText}</strong>
      </ListGroup.Item>

      {sortedMaterials.map(([ing, count], idx: number) => {
        if (/\b(enchanted)\s+(accessory|weapon)\b/i.test(ing)) {
          return <Fragment key={`${ing}-${String(count)}-${String(idx)}`} />
        }

        return (
          <ListGroup.Item key={`${ing}-${String(count)}`}>
            <FarmedIngredientDisplay key={ing} ingredient={ingredientsMap[ing]} quantity={count} />
          </ListGroup.Item>
        )
      })}
    </ListGroup>
  ) : (
    <></>
  )
}

interface Props {
  rawMaterials: Record<string, number> // Raw material name mapped to quantity
}

export default RawMaterialList
