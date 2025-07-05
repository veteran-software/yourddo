import { useCallback, useMemo } from 'react'
import { shallowEqual } from 'react-redux'
import { useAppSelector } from '../../../../redux/hooks.ts'
import type { CraftingIngredient } from '../../../../types/crafting.ts'
import { deconstructHgsShard } from '../../../../utils/objectUtils.ts'
import { baseElemental, type ElementalList } from '../../common/helpers/elementalData.ts'
import useIngredientsMap from './useIngredientMap.ts'

const useInvasion = () => {
  const { invasionItems, selectedSubjugationItem } = useAppSelector((state) => state.greenSteel, shallowEqual)

  const items: CraftingIngredient[] = useMemo(() => {
    return [...invasionItems].filter((item: CraftingIngredient) => {
      if (selectedSubjugationItem) {
        return selectedSubjugationItem.requirements?.[0].name.startsWith(deconstructHgsShard(item.name).focus)
      }

      return true
    })
  }, [invasionItems, selectedSubjugationItem])

  const elemental: ElementalList[] = useMemo(() => baseElemental, [])

  const filterCallback = useCallback((item: CraftingIngredient, _elementName: string) => {
    return deconstructHgsShard(item.name).focus === _elementName
  }, [])

  const { ingredientsMap } = useIngredientsMap(items, elemental, filterCallback)

  return { ingredientsMap }
}

export default useInvasion
