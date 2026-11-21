import { useCallback, useMemo } from 'react'
import { shallowEqual } from 'react-redux'
import { useAppSelector } from '../../../../redux/hooks.ts'
import type { CraftingIngredient } from '../../../../types/crafting.ts'
import { deconstructHgsShard } from '../../../../utils/objectUtils.ts'
import { baseElemental, type ElementalList } from '../../common/helpers/elementalData.ts'
import useIngredientsMap from './useIngredientMap.ts'

const useInvasion = () => {
  const { invasionItems, selectedSubjugationItem, selectedSubjugationSpell } = useAppSelector(
    (state) => state.greenSteel,
    shallowEqual
  )

  const items: CraftingIngredient[] = useMemo(() => {
    return [...invasionItems].filter((item: CraftingIngredient) => {
      const { focus } = deconstructHgsShard(item.name)

      if (selectedSubjugationItem) {
        if (!selectedSubjugationItem.requirements?.[0].name.startsWith(focus)) {
          return false
        }
      }

      if (selectedSubjugationSpell) {
        const { focus: spellT1Focus } = deconstructHgsShard(selectedSubjugationSpell.requirements?.[0].name ?? '')

        // Ensure we handle "Positive" vs "Positive Energy" and "Negative" vs "Negative Energy"
        const normalizedSpellT1Focus =
          spellT1Focus === 'Positive' || spellT1Focus === 'Negative' ? `${spellT1Focus} Energy` : spellT1Focus
        const normalizedItemFocus = focus === 'Positive' || focus === 'Negative' ? `${focus} Energy` : focus

        if (
          !normalizedItemFocus.includes(normalizedSpellT1Focus) &&
          !normalizedSpellT1Focus.includes(normalizedItemFocus)
        ) {
          return false
        }
      }

      return true
    })
  }, [invasionItems, selectedSubjugationItem, selectedSubjugationSpell])

  const elemental: ElementalList[] = useMemo(() => baseElemental, [])

  const filterCallback = useCallback((item: CraftingIngredient, _elementName: string) => {
    return deconstructHgsShard(item.name).focus === _elementName
  }, [])

  const { ingredientsMap } = useIngredientsMap(items, elemental, filterCallback)

  return { ingredientsMap }
}

export default useInvasion
