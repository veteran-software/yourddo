import { useMemo } from 'react'
import { shallowEqual } from 'react-redux'
import { useAppSelector } from '../../../redux/hooks.ts'
import type { CraftingIngredient } from '../../../types/crafting.ts'
import { fullElemental } from '../helpers/elementalData.ts'
import { useIngredientsMap } from './useIngredientMap.ts'

export const useDevastationFocused = () => {
  const { devastationFocusedEffects } = useAppSelector(
    (state) => state.greenSteel,
    shallowEqual
  )

  const items: CraftingIngredient[] = useMemo(
    () => [...devastationFocusedEffects],
    [devastationFocusedEffects]
  )

  const elemental = useMemo(() => fullElemental, [])

  const filterCallback = (item: CraftingIngredient, elements: string[]) => {
    const reqs = item.requirements as CraftingIngredient[]

    const elementOneCheck: boolean =
      reqs[0]?.name.includes(elements[0]) ?? false
    const elementTwoCheck: boolean =
      reqs[1]?.description?.includes(elements[1]) ??
      reqs[1]?.name.includes(elements[1])

    return elementOneCheck && elementTwoCheck
  }

  const { ingredientsMap } = useIngredientsMap(items, elemental, filterCallback)

  return { ingredientsMap }
}
