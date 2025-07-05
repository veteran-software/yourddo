import { useCallback, useMemo } from 'react'
import { shallowEqual } from 'react-redux'
import { useAppSelector } from '../../../../redux/hooks.ts'
import type { Enhancement } from '../../../../types/core.ts'
import type { CraftingIngredient } from '../../../../types/crafting.ts'
import { deconstructHgsShard } from '../../../../utils/objectUtils.ts'
import { baseElemental, type ElementalList, subjugationElementalList } from '../../common/helpers/elementalData.ts'
import useIngredientsMap from './useIngredientMap.ts'

const useSubjugationBasic = () => {
  const { selectedInvasionItem, subjugationItems, selectedDevastationFocused, selectedSubjugationItem } =
    useAppSelector((state) => state.greenSteel, shallowEqual)

  const items: CraftingIngredient[] = useMemo(() => {
    if (selectedSubjugationItem && selectedInvasionItem) {
      const invasionFocus: string = deconstructHgsShard(selectedInvasionItem.name).focus
      const subjugationFocus: string = deconstructHgsShard(selectedSubjugationItem.name).focus
      const subjugationAspect: string | undefined = selectedSubjugationItem.effectsAdded?.at(-1)?.name

      const elementData = subjugationElementalList.filter(
        (el: ElementalList) => subjugationAspect?.includes(el.name) ?? false
      )
      if (
        elementData[0].elements[0] === invasionFocus &&
        elementData[0].elements[1] === subjugationFocus.split(' ')[0]
      ) {
        return [...subjugationItems].filter(
          (item: CraftingIngredient) =>
            item.effectsAdded?.some((effect: Enhancement) => effect.name.includes(invasionFocus)) ?? false
        )
      }

      if (
        elementData[1].elements[0] === invasionFocus &&
        elementData[1].elements[1] === subjugationFocus.split(' ')[0]
      ) {
        return [...subjugationItems].filter(
          (item: CraftingIngredient) =>
            item.effectsAdded?.some((effect: Enhancement) => effect.name.includes(subjugationFocus.split(' ')[0])) ??
            false
        )
      }
    }

    if (selectedInvasionItem) {
      const { focus } = deconstructHgsShard(selectedInvasionItem.name)

      return [...subjugationItems].filter((item: CraftingIngredient) =>
        // The T1 Focus is the Affinity for ingredient #1 for T2
        item.requirements?.some((ingredient: CraftingIngredient) => ingredient.name.startsWith(focus))
      )
    }

    if (selectedDevastationFocused) {
      const { focus } = deconstructHgsShard(selectedDevastationFocused.requirements?.[1].name ?? '')

      return [...subjugationItems].filter(
        (item: CraftingIngredient) =>
          item.effectsAdded?.some((effect: Enhancement) => effect.name.includes(`Aspect of ${focus}`)) ?? false
      )
    }

    return [...subjugationItems]
  }, [selectedSubjugationItem, subjugationItems, selectedInvasionItem, selectedDevastationFocused])

  const elemental: ElementalList[] = useMemo(() => subjugationElementalList, [])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const filterCallback = useCallback((item: CraftingIngredient, elementName: string, _elements?: string[]) => {
    const directMatchNamespaces = new Set(
      subjugationElementalList
        .filter((el: ElementalList) => !baseElemental.some((base: ElementalList) => base.name === el.name))
        .map((el: ElementalList) => el.name)
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
