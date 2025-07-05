import { useCallback, useMemo } from 'react'
import { shallowEqual } from 'react-redux'
import { useAppSelector } from '../../../../redux/hooks.ts'
import type { CraftingIngredient } from '../../../../types/crafting.ts'
import { deconstructLgsShard } from '../../../../utils/objectUtils.ts'
import { baseElemental, type ElementalList } from '../../common/helpers/elementalData.ts'
import useIngredientsMap from '../../heroic/hooks/useIngredientMap.ts'

const useInvasion = () => {
  const { invasionItems, selectedSubjugationItem } = useAppSelector((state) => state.legendaryGreenSteel, shallowEqual)

  const items: CraftingIngredient[] = useMemo(() => {
    return [...invasionItems].filter((item: CraftingIngredient) => {
      if (selectedSubjugationItem) {
        return selectedSubjugationItem.requirements?.[0].name.startsWith(deconstructLgsShard(item.name)?.focusP ?? '')
      }

      return true
    })
  }, [invasionItems, selectedSubjugationItem])

  const elemental: ElementalList[] = useMemo(() => baseElemental, [])

  const filterCallback = useCallback((item: CraftingIngredient, _elementName: string) => {
    return deconstructLgsShard(item.name)?.focusP === _elementName
  }, [])

  const { ingredientsMap } = useIngredientsMap(items, elemental, filterCallback)

  return { ingredientsMap }
}

export default useInvasion
