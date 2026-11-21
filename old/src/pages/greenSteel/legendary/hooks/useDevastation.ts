import { useCallback, useMemo } from 'react'
import { shallowEqual } from 'react-redux'
import { useAppSelector } from '../../../../redux/hooks.ts'
import type { CraftingIngredient } from '../../../../types/crafting.ts'
import { deconstructLgsShard } from '../../../../utils/objectUtils.ts'
import { baseElemental, type ElementalList } from '../../common/helpers/elementalData.ts'
import useIngredientsMap from '../../heroic/hooks/useIngredientMap.ts'

export const useDevastation = () => {
  const { devastationItems, selectedBonusEffect } = useAppSelector((state) => state.legendaryGreenSteel, shallowEqual)

  const items: CraftingIngredient[] = useMemo(
    () =>
      [...devastationItems].filter((item: CraftingIngredient) => {
        if (selectedBonusEffect) {
          const tier3Foci: string[] = selectedBonusEffect.tier3Foci
          const shard = deconstructLgsShard(item.name)

          if (shard?.focusP && shard.focusS) {
            return (
              (tier3Foci[0].includes(shard.focusP) && tier3Foci[1].includes(shard.focusS)) ||
              (tier3Foci[1].includes(shard.focusP) && tier3Foci[0].includes(shard.focusS))
            )
          }

          return false
        }

        return true
      }),
    [devastationItems, selectedBonusEffect]
  )
  const elemental: ElementalList[] = useMemo(() => baseElemental, [])

  const filterCallback = useCallback((item: CraftingIngredient, elementName: string) => {
    const deconstructed = deconstructLgsShard(item.name)
    if (!deconstructed) return false

    // Filter by primary focus only
    return deconstructed.focusP === elementName
  }, [])

  const { ingredientsMap } = useIngredientsMap(items, elemental, filterCallback)

  return { ingredientsMap }
}
