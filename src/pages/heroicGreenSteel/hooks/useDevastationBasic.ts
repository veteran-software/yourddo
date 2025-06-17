import { useCallback, useMemo } from 'react'
import { shallowEqual } from 'react-redux'
import { useAppSelector } from '../../../redux/hooks.ts'
import type { CraftingIngredient } from '../../../types/crafting.ts'
import { baseElemental, type ElementalList } from '../helpers/elementalData.ts'
import useIngredientsMap from './useIngredientMap.ts'

export const useDevastationBasic = () => {
  const { devastationBasicItems } = useAppSelector(
    (state) => state.greenSteel,
    shallowEqual
  )

  const items: CraftingIngredient[] = useMemo(
    () => [...devastationBasicItems],
    [devastationBasicItems]
  )

  const elemental: ElementalList[] = useMemo(() => baseElemental, [])

  const filterCallback = useCallback(
    (item: CraftingIngredient, _elementName: string, elements: string[]) => {
      const reqs = item.requirements as CraftingIngredient[]
      return reqs[1]?.name.includes(elements[0])
    },
    []
  )

  const { ingredientsMap } = useIngredientsMap(items, elemental, filterCallback)

  return { ingredientsMap }
}
