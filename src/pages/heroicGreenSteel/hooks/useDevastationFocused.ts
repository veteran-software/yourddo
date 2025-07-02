import { useCallback, useMemo } from 'react'
import { shallowEqual } from 'react-redux'
import { useAppSelector } from '../../../redux/hooks.ts'
import type { CraftingIngredient } from '../../../types/crafting.ts'
import { deconstructHgsShard } from '../../../utils/objectUtils.ts'
import { devastationElementalList, type ElementalList } from '../helpers/elementalData.ts'
import useIngredientsMap from './useIngredientMap.ts'

const useDevastationFocused = () => {
  const { devastationFocusedEffects, selectedInvasionItem, selectedSubjugationItem } = useAppSelector(
    (state) => state.greenSteel,
    shallowEqual
  )

  const items: CraftingIngredient[] = useMemo(() => {
    // T1 and T2 are both selected
    if (selectedInvasionItem && selectedSubjugationItem) {
      return [...devastationFocusedEffects].filter((ingredient: CraftingIngredient) => {
        const requiredSubjugationShard: string | undefined = ingredient.requirements?.[1].description

        // Triple Shard (Basic Element)
        if (!requiredSubjugationShard) {
          const t1Focus: string = deconstructHgsShard(selectedInvasionItem.name).focus
          const t2Focus: string = deconstructHgsShard(selectedSubjugationItem.name).focus
          const t3Focus: string = deconstructHgsShard(ingredient.name).focus

          return t1Focus === t2Focus && t2Focus === t3Focus
        }

        const ingredientNameFocus: string = deconstructHgsShard(ingredient.name).focus
        const subjugationAspect: string | undefined = selectedSubjugationItem.effectsAdded?.at(-1)?.name

        if (!subjugationAspect) return false

        return subjugationAspect.includes(ingredientNameFocus)
      })
    }

    // Only T2 is selected
    if (!selectedInvasionItem && selectedSubjugationItem) {
      return [...devastationFocusedEffects].filter((ingredient: CraftingIngredient) => {
        const ingredientNameFocus: string = deconstructHgsShard(ingredient.name).focus
        const subjugationAspect: string | undefined = selectedSubjugationItem.effectsAdded?.at(-1)?.name

        if (!subjugationAspect) return false

        return subjugationAspect.includes(ingredientNameFocus)
      })
    }

    return [...devastationFocusedEffects]
  }, [devastationFocusedEffects, selectedInvasionItem, selectedSubjugationItem])

  const elemental: ElementalList[] = useMemo(() => devastationElementalList, [])

  const filterCallback = useCallback((item: CraftingIngredient, _elementName: string, elements?: string[]) => {
    const reqs: CraftingIngredient[] | undefined = item.requirements

    if (!reqs) return false

    const elementOneCheck: boolean = reqs[0]?.name.includes(elements?.[0] ?? '') ?? false
    const elementTwoCheck: boolean =
      reqs[1]?.description?.includes(elements?.[1] ?? '') ?? reqs[1]?.name.includes(elements?.[1] ?? '')

    return elementOneCheck && elementTwoCheck
  }, [])

  const { ingredientsMap } = useIngredientsMap(items, elemental, filterCallback)

  return { ingredientsMap }
}

export default useDevastationFocused
