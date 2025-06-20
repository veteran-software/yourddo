import { useCallback, useMemo } from 'react'
import { shallowEqual } from 'react-redux'
import { useAppSelector } from '../../../redux/hooks.ts'
import type { Enhancement } from '../../../types/core.ts'
import type { CraftingIngredient } from '../../../types/crafting.ts'
import { deconstructShard } from '../../../utils/objectUtils.ts'
import { type ElementalList, subjugationElementalList } from '../helpers/elementalData.ts'
import useIngredientsMap from './useIngredientMap.ts'

const useSubjugationBasic = () => {
  const { subjugationItems, selectedDevastationFocused } = useAppSelector((state) => state.greenSteel, shallowEqual)

  const items: CraftingIngredient[] = useMemo(() => {
    if (selectedDevastationFocused) {
      const { focus } = deconstructShard(selectedDevastationFocused.requirements[1].name)

      return [...subjugationItems].filter(
        (item: CraftingIngredient) =>
          item.effectsAdded?.some((effect: Enhancement) => effect.name.includes(`Aspect of ${focus}`)) ?? false
      )
    }

    return [...subjugationItems]
  }, [selectedDevastationFocused, subjugationItems])

  const elemental: ElementalList[] = useMemo(() => subjugationElementalList, [])

  const isAspect = (elementName: string): boolean => {
    return elementName.includes('Balance') || elementName.includes('Existential') || elementName === 'Tempered'
  }

  const filterCallback = useCallback((item: CraftingIngredient, elementName: string, elements?: string[]) => {
    if ((elements?.[0] ?? '') === (elements?.[1] ?? '') && isAspect(elementName)) {
      return item.effectsAdded?.some((effect: Enhancement) => effect.name.includes(`Aspect of ${elementName}`)) ?? false
    } else {
      return item.effectsAdded?.some((effect: Enhancement) => effect.name.includes(elementName)) ?? false
    }
  }, [])

  const { ingredientsMap } = useIngredientsMap(items, elemental, filterCallback)

  return { ingredientsMap }
}

export default useSubjugationBasic
