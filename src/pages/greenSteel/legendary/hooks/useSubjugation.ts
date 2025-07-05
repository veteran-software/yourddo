import { useCallback, useMemo } from 'react'
import { shallowEqual } from 'react-redux'
import { useAppSelector } from '../../../../redux/hooks.ts'
import type { CraftingIngredient } from '../../../../types/crafting.ts'
import { deconstructLgsShard } from '../../../../utils/objectUtils.ts'
import { baseElemental, type ElementalList } from '../../common/helpers/elementalData.ts'
import useIngredientsMap from '../../heroic/hooks/useIngredientMap.ts'

const useSubjugation = () => {
  const { subjugationItems } = useAppSelector((state) => state.legendaryGreenSteel, shallowEqual)

  const items: CraftingIngredient[] = useMemo(() => {
    return [...subjugationItems]
  }, [subjugationItems])

  const elemental: ElementalList[] = useMemo(() => baseElemental, [])

  const filterCallback = useCallback((item: CraftingIngredient, elementName: string) => {
    return deconstructLgsShard(item.name)?.focusP === elementName
  }, [])

  const { ingredientsMap } = useIngredientsMap(items, elemental, filterCallback)

  return { ingredientsMap }
}

export default useSubjugation
