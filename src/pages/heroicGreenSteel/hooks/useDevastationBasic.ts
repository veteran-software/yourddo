import { useEffect, useMemo, useState } from 'react'
import { shallowEqual } from 'react-redux'
import { useAppSelector } from '../../../redux/hooks.ts'
import type { CraftingIngredient } from '../../../types/crafting.ts'

export const useDevastationBasic = () => {
  const { devastationBasicItems } = useAppSelector(
    (state) => state.greenSteel,
    shallowEqual
  )

  const items: CraftingIngredient[] = useMemo(
    () => [...devastationBasicItems],
    [devastationBasicItems]
  )

  const [ingredientsMap, setIngredientsMap] = useState<
    Record<string, CraftingIngredient[]>
  >({})

  const elemental: ElementalList[] = useMemo(() => {
    return [
      {
        name: 'Air',
        elements: ['Air', 'Air']
      },
      {
        name: 'Earth',
        elements: ['Earth', 'Earth']
      },
      {
        name: 'Fire',
        elements: ['Fire', 'Fire']
      },
      {
        name: 'Water',
        elements: ['Water', 'Water']
      },
      {
        name: 'Negative Energy',
        elements: ['Negative', 'Negative']
      },
      {
        name: 'Positive Energy',
        elements: ['Positive', 'Positive']
      }
    ] as ElementalList[]
  }, [])

  useEffect(() => {
    const updatedMap: Record<string, CraftingIngredient[]> = {}
    elemental.forEach((ele) => {
      updatedMap[ele.name] = items.filter((item: CraftingIngredient) => {
        const reqs: CraftingIngredient[] =
          item.requirements as CraftingIngredient[]

        return reqs[1].name.includes(ele.name)
      })
    })

    setIngredientsMap(updatedMap)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items])

  return { ingredientsMap }
}

export interface ElementalList {
  name: string
  elements: string[]
  ingredients: CraftingIngredient[]
}
