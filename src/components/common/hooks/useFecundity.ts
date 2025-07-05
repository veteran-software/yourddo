import { useEffect, useState } from 'react'
import { shallowEqual } from 'react-redux'
import { useAppSelector } from '../../../redux/hooks.ts'
import type { CraftingIngredient } from '../../../types/crafting.ts'
import { filterForSublist, sortObjectArray } from '../../../utils/objectUtils.ts'

type CraftingType = 'Heroic' | 'Legendary'

const useFecundity = (type: CraftingType) => {
  const { fecundityItems: heroicFecundityItems, selectedFecundityItem: heroicSelectedFecundityItem } = useAppSelector(
    (state) => state.greenSteel,
    shallowEqual
  )
  const { fecundityItems: legendaryFecundityItems, selectedFecundityItem: legendarySelectedFecundityItem } =
    useAppSelector((state) => state.legendaryGreenSteel, shallowEqual)

  const [heroicWeaponList, setHeroicWeaponList] = useState<CraftingIngredient[]>([])
  const [heroicAccessoryList, setHeroicAccessoryList] = useState<CraftingIngredient[]>([])

  const [legendaryWeaponList, setLegendaryWeaponList] = useState<CraftingIngredient[]>([])
  const [legendaryAccessoryList, setLegendaryAccessoryList] = useState<CraftingIngredient[]>([])

  useEffect(() => {
    if (type === 'Heroic') {
      setHeroicWeaponList(sortObjectArray(filterForSublist(heroicFecundityItems, 'Weapon', 'ingredientType'), 'name'))
      setHeroicAccessoryList(
        sortObjectArray(filterForSublist(heroicFecundityItems, 'Accessory', 'ingredientType'), 'name')
      )
    }

    if (type === 'Legendary') {
      setLegendaryWeaponList(
        sortObjectArray(filterForSublist(legendaryFecundityItems, 'Weapon', 'ingredientType'), 'name')
      )
      setLegendaryAccessoryList(
        sortObjectArray(filterForSublist(legendaryFecundityItems, 'Accessory', 'ingredientType'), 'name')
      )
    }
  }, [heroicFecundityItems, legendaryFecundityItems, type])

  return {
    heroicSelectedFecundityItem,
    heroicWeaponList,
    heroicAccessoryList,
    legendarySelectedFecundityItem,
    legendaryWeaponList,
    legendaryAccessoryList
  }
}

export default useFecundity
