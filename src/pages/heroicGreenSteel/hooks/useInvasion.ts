import { useEffect, useMemo, useState } from 'react'
import { shallowEqual } from 'react-redux'
import { useAppSelector } from '../../../redux/hooks.ts'
import type { CraftingIngredient } from '../../../types/crafting'
import { filterForSublist } from '../../../utils/objectUtils.ts'

const useInvasion = () => {
  const { invasionItems } = useAppSelector(
    (state) => state.greenSteel,
    shallowEqual
  )

  const [airItems, setAirItems] = useState<CraftingIngredient[]>([])
  const [earthItems, setEarthItems] = useState<CraftingIngredient[]>([])
  const [fireItems, setFireItems] = useState<CraftingIngredient[]>([])
  const [waterItems, setWaterItems] = useState<CraftingIngredient[]>([])
  const [negativeItems, setNegativeItems] = useState<CraftingIngredient[]>([])
  const [positiveItems, setPositiveItems] = useState<CraftingIngredient[]>([])

  const affinities: AffinityList[] = useMemo(
    () =>
      [
        {
          name: 'Air Affinity',
          elements: ['Air'],
          ingredients: airItems
        },
        {
          name: 'Earth Affinity',
          elements: ['Earth'],
          ingredients: earthItems
        },
        {
          name: 'Fire Affinity',
          elements: ['Fire'],
          ingredients: fireItems
        },
        {
          name: 'Water Affinity',
          elements: ['Water'],
          ingredients: waterItems
        },
        {
          name: 'Negative Energy Affinity',
          elements: ['Negative'],
          ingredients: negativeItems
        },
        {
          name: 'Positive Energy Affinity',
          elements: ['Positive'],
          ingredients: positiveItems
        }
      ] as AffinityList[],
    [airItems, earthItems, fireItems, waterItems, negativeItems, positiveItems]
  )

  useEffect(() => {
    setAirItems(filterForSublist(invasionItems, 'Air Affinity', 'effectsAdded'))
    setEarthItems(
      filterForSublist(invasionItems, 'Earth Affinity', 'effectsAdded')
    )
    setFireItems(
      filterForSublist(invasionItems, 'Fire Affinity', 'effectsAdded')
    )
    setWaterItems(
      filterForSublist(invasionItems, 'Water Affinity', 'effectsAdded')
    )
    setNegativeItems(
      filterForSublist(
        invasionItems,
        'Negative Energy Affinity',
        'effectsAdded'
      )
    )
    setPositiveItems(
      filterForSublist(
        invasionItems,
        'Positive Energy Affinity',
        'effectsAdded'
      )
    )
  }, [invasionItems])

  return {
    affinities,
    items: {
      airItems,
      earthItems,
      fireItems,
      waterItems,
      negativeItems,
      positiveItems
    }
  }
}

interface AffinityList {
  name: string
  elements: string[]
  ingredients: CraftingIngredient[]
}

export default useInvasion
