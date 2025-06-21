import { useCallback, useMemo } from 'react'
import { shallowEqual } from 'react-redux'
import { useAppSelector } from '../../../redux/hooks.ts'
import type { Enhancement } from '../../../types/core.ts'
import type { CraftingIngredient } from '../../../types/crafting.ts'
import { deconstructShard } from '../../../utils/objectUtils.ts'
import { baseElemental, type ElementalList, subjugationElementalList } from '../helpers/elementalData.ts'
import useIngredientsMap from './useIngredientMap.ts'

const useSubjugationBasic = () => {
  const { selectedInvasionItem, subjugationItems, selectedDevastationFocused } = useAppSelector(
    (state) => state.greenSteel,
    shallowEqual
  )

  const items: CraftingIngredient[] = useMemo(() => {
    if (selectedInvasionItem) {
      const { focus } = deconstructShard(selectedInvasionItem.name)

      return [...subjugationItems].filter((item: CraftingIngredient) =>
        // The T1 Focus is the Affinity for ingredient #1 for T2
        item.requirements.some((ingredient: CraftingIngredient) => ingredient.name.startsWith(focus))
      )
    }

    if (selectedDevastationFocused) {
      const { focus } = deconstructShard(selectedDevastationFocused.requirements[1].name)

      return [...subjugationItems].filter(
        (item: CraftingIngredient) =>
          item.effectsAdded?.some((effect: Enhancement) => effect.name.includes(`Aspect of ${focus}`)) ?? false
      )
    }

    return [...subjugationItems]
  }, [selectedInvasionItem, selectedDevastationFocused, subjugationItems])

  const elemental: ElementalList[] = useMemo(() => subjugationElementalList, [])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const filterCallback = useCallback((item: CraftingIngredient, elementName: string, _elements?: string[]) => {
    const directMatchNamespaces = new Set(
      subjugationElementalList.filter((el) => !baseElemental.some((base) => base.name === el.name)).map((el) => el.name)
    )

    if (directMatchNamespaces.has(elementName)) {
      // For composite elements (Ash, Magma, etc.) and special cases (Balance, Stalemate, etc.)
      return item.effectsAdded?.some((effect: Enhancement) => effect.name.includes(elementName)) ?? false
    } else {
      // For base elements (Fire, Water, etc.), require "Aspect of" prefix
      return item.effectsAdded?.some((effect: Enhancement) => effect.name === `Aspect of ${elementName}`) ?? false
    }
  }, [])

  const { ingredientsMap } = useIngredientsMap(items, elemental, filterCallback)

  return { ingredientsMap }
}

export default useSubjugationBasic
