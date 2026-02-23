import { useMemo } from 'react'
import { shallowEqual } from 'react-redux'
import { useAppSelector } from '../../../redux/hooks.ts'
import { filterForSublist, sortObjectArray } from '../../../utils/objectUtils.ts'

type CraftingType = 'Heroic' | 'Legendary'

const useFecundity = (type: CraftingType) => {
  const { fecundityItems: heroicFecundityItems, selectedFecundityItem: heroicSelectedFecundityItem } = useAppSelector(
    (state) => state.greenSteel,
    shallowEqual
  )
  const { fecundityItems: legendaryFecundityItems, selectedFecundityItem: legendarySelectedFecundityItem } =
    useAppSelector((state) => state.legendaryGreenSteel, shallowEqual)

  const heroicWeaponList = useMemo(() => {
    if (type === 'Heroic') {
      return sortObjectArray(filterForSublist(heroicFecundityItems, 'Weapon', 'ingredientType'), 'name')
    }
    return []
  }, [type, heroicFecundityItems])

  const heroicAccessoryList = useMemo(() => {
    if (type === 'Heroic') {
      return sortObjectArray(filterForSublist(heroicFecundityItems, 'Accessory', 'ingredientType'), 'name')
    }
    return []
  }, [type, heroicFecundityItems])

  const legendaryWeaponList = useMemo(() => {
    if (type === 'Legendary') {
      return sortObjectArray(filterForSublist(legendaryFecundityItems, 'Weapon', 'ingredientType'), 'name')
    }
    return []
  }, [type, legendaryFecundityItems])

  const legendaryAccessoryList = useMemo(() => {
    if (type === 'Legendary') {
      return sortObjectArray(filterForSublist(legendaryFecundityItems, 'Accessory', 'ingredientType'), 'name')
    }
    return []
  }, [type, legendaryFecundityItems])

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
