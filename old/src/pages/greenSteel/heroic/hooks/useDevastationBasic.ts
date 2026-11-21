import { useCallback, useMemo } from 'react'
import { shallowEqual } from 'react-redux'
import { useAppSelector } from '../../../../redux/hooks.ts'
import type { CraftingIngredient } from '../../../../types/crafting.ts'
import { baseElemental, type ElementalList } from '../../common/helpers/elementalData.ts'
import useIngredientsMap from './useIngredientMap.ts'

export const useDevastationBasic = () => {
  const { devastationBasicItems } = useAppSelector((state) => state.greenSteel, shallowEqual)

  const items: CraftingIngredient[] = useMemo(() => [...devastationBasicItems], [devastationBasicItems])
  const elemental: ElementalList[] = useMemo(() => baseElemental, [])

  const filterCallback = useCallback(
    (item: CraftingIngredient, elementName: string) => item.name.includes(elementName),
    []
  )

  const { ingredientsMap } = useIngredientsMap(items, elemental, filterCallback)

  return { ingredientsMap }
}
