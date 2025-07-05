import { useCallback, useMemo } from 'react'
import { shallowEqual } from 'react-redux'
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks.ts'
import { resetSubjugationItem } from '../../../../redux/slices/lgsSlice.ts'
import type { AppDispatch } from '../../../../redux/store.ts'
import type { CraftingIngredient } from '../../../../types/crafting.ts'
import { deconstructLgsShard } from '../../../../utils/objectUtils.ts'
import { baseElemental, type ElementalList } from '../../common/helpers/elementalData.ts'
import useIngredientsMap from '../../heroic/hooks/useIngredientMap.ts'

const useSubjugation = () => {
  const dispatch: AppDispatch = useAppDispatch()
  const { subjugationItems, selectedInvasionItem, selectedBonusEffect, selectedSubjugationItem } = useAppSelector(
    (state) => state.legendaryGreenSteel,
    shallowEqual
  )

  const items: CraftingIngredient[] = useMemo(() => {
    return [...subjugationItems].filter((item: CraftingIngredient) => {
      if (selectedBonusEffect) {
        const lowerFoci: string[] = selectedBonusEffect.lowerFoci
        const itemFocus: string = deconstructLgsShard(item.name)?.focusP ?? ''

        if (selectedSubjugationItem) {
          dispatch(resetSubjugationItem())
        }

        if (selectedInvasionItem) {
          const subjugationFocus: string = deconstructLgsShard(selectedInvasionItem.name)?.focusP ?? ''
          const subjugationFocusIndex: number = lowerFoci.indexOf(subjugationFocus)

          if (subjugationFocusIndex === 0) {
            return lowerFoci[1].includes(itemFocus)
          } else {
            return lowerFoci[0].includes(itemFocus)
          }
        } else {
          return lowerFoci.includes(itemFocus)
        }
      }

      return true
    })
  }, [dispatch, selectedBonusEffect, selectedInvasionItem, selectedSubjugationItem, subjugationItems])

  const elemental: ElementalList[] = useMemo(() => baseElemental, [])

  const filterCallback = useCallback((item: CraftingIngredient, elementName: string) => {
    return deconstructLgsShard(item.name)?.focusP === elementName
  }, [])

  const { ingredientsMap } = useIngredientsMap(items, elemental, filterCallback)

  return { ingredientsMap }
}

export default useSubjugation
