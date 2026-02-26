import { useCallback, useMemo } from 'react'
import { shallowEqual } from 'react-redux'
import { useAppSelector } from '../../../../redux/hooks.ts'
import type { Enhancement } from '../../../../types/core.ts'
import type { CraftingIngredient } from '../../../../types/crafting.ts'
import { deconstructHgsShard } from '../../../../utils/objectUtils.ts'
import { baseElemental, type ElementalList, subjugationElementalList } from '../../common/helpers/elementalData.ts'
import useIngredientsMap from './useIngredientMap.ts'

const useSubjugationBasic = () => {
  const {
    selectedInvasionItem,
    subjugationItems,
    selectedDevastationFocused,
    selectedSubjugationItem,
    selectedSubjugationSpell
  } = useAppSelector((state) => state.greenSteel, shallowEqual)

  const items: CraftingIngredient[] = useMemo(() => {
    let filteredItems = [...subjugationItems]

    if (selectedInvasionItem) {
      const { focus } = deconstructHgsShard(selectedInvasionItem.name)
      filteredItems = filteredItems.filter((item: CraftingIngredient) =>
        item.requirements?.some((ingredient: CraftingIngredient) => ingredient.name.startsWith(focus))
      )
    }

    if (selectedSubjugationSpell) {
      const spellAspect = selectedSubjugationSpell.effectsAdded?.find((effect: Enhancement) =>
        effect.name.includes('Aspect of')
      )?.name

      const specialAspect = selectedSubjugationSpell.effectsAdded?.find(
        (effect: Enhancement) =>
          effect.name.includes('Balance of Land and Sky') ||
          effect.name.includes('Existential Stalemate') ||
          effect.name.includes('Tempered')
      )?.name

      const targetAspect = spellAspect || specialAspect

      if (targetAspect) {
        filteredItems = filteredItems.filter((item: CraftingIngredient) =>
          item.effectsAdded?.some((effect: Enhancement) => effect.name === targetAspect)
        )
      } else {
        // Fallback to previous logic if no clear aspect is found (though there should be)
        filteredItems = filteredItems.filter((item: CraftingIngredient) => {
          const { focus: t2Focus, essence: t2Essence, gem: t2Gem } = deconstructHgsShard(item.name)
          const {
            focus: spellT2Focus,
            essence: spellT2Essence,
            gem: spellT2Gem
          } = deconstructHgsShard(selectedSubjugationSpell.requirements?.[1].name ?? '')

          const focusMatch =
            t2Focus === spellT2Focus || t2Focus.includes(spellT2Focus) || spellT2Focus.includes(t2Focus)
          return focusMatch && t2Essence === spellT2Essence && t2Gem === spellT2Gem
        })
      }
    }

    if (selectedDevastationFocused) {
      const { focus } = deconstructHgsShard(selectedDevastationFocused.requirements?.[1].name ?? '')
      filteredItems = filteredItems.filter(
        (item: CraftingIngredient) =>
          item.effectsAdded?.some((effect: Enhancement) => effect.name.includes(`Aspect of ${focus}`)) ?? false
      )
    }

    return filteredItems
  }, [
    selectedSubjugationItem,
    subjugationItems,
    selectedInvasionItem,
    selectedDevastationFocused,
    selectedSubjugationSpell
  ])

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
