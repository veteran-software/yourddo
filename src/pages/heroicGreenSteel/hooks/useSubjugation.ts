import { useEffect, useMemo, useState } from 'react'
import { shallowEqual } from 'react-redux'
import { useAppSelector } from '../../../redux/hooks.ts'
import type { CraftingIngredient } from '../../../types/crafting'
import { filterForSublist } from '../../../utils/objectUtils.ts'

const useSubjugation = () => {
  const { subjugationItems } = useAppSelector(
    (state) => state.greenSteel,
    shallowEqual
  )

  // Double aspects
  const [airItems, setAirItems] = useState<CraftingIngredient[]>([])
  const [earthItems, setEarthItems] = useState<CraftingIngredient[]>([])
  const [fireItems, setFireItems] = useState<CraftingIngredient[]>([])
  const [waterItems, setWaterItems] = useState<CraftingIngredient[]>([])
  const [negativeItems, setNegativeItems] = useState<CraftingIngredient[]>([])
  const [positiveItems, setPositiveItems] = useState<CraftingIngredient[]>([])

  // Mixed aspects
  const [ashItems, setAshItems] = useState<CraftingIngredient[]>([])
  const [dustItems, setDustItems] = useState<CraftingIngredient[]>([])
  const [iceItems, setIceItems] = useState<CraftingIngredient[]>([])
  const [lightningItems, setLightningItems] = useState<CraftingIngredient[]>([])
  const [magmaItems, setMagmaItems] = useState<CraftingIngredient[]>([])
  const [mineralItems, setMineralItems] = useState<CraftingIngredient[]>([])
  const [oozeItems, setOozeItems] = useState<CraftingIngredient[]>([])
  const [radianceItems, setRadianceItems] = useState<CraftingIngredient[]>([])
  const [saltItems, setSaltItems] = useState<CraftingIngredient[]>([])
  const [smokeItems, setSmokeItems] = useState<CraftingIngredient[]>([])
  const [steamItems, setSteamItems] = useState<CraftingIngredient[]>([])
  const [vacuumItems, setVacuumItems] = useState<CraftingIngredient[]>([])

  // Other mixed
  const [bolasItems, setBolasItems] = useState<CraftingIngredient[]>([])
  const [stalemateItems, setStalemateItems] = useState<CraftingIngredient[]>([])
  const [temperedItems, setTemperedItems] = useState<CraftingIngredient[]>([])

  const aspects: AspectList[] = useMemo(
    () =>
      [
        {
          name: 'Aspect of Air',
          elements: ['Air', 'Air'],
          ingredients: airItems
        },
        {
          name: 'Aspect of Earth',
          elements: ['Earth', 'Earth'],
          ingredients: earthItems
        },
        {
          name: 'Aspect of Fire',
          elements: ['Fire', 'Fire'],
          ingredients: fireItems
        },
        {
          name: 'Aspect of Water',
          elements: ['Water', 'Water'],
          ingredients: waterItems
        },
        {
          name: 'Aspect of Negative Energy',
          elements: ['Negative', 'Negative'],
          ingredients: negativeItems
        },
        {
          name: 'Aspect of Positive Energy',
          elements: ['Positive', 'Positive'],
          ingredients: positiveItems
        },
        {
          name: 'Aspect of Ash',
          elements: ['Fire', 'Negative'],
          ingredients: ashItems
        },
        {
          name: 'Aspect of Dust',
          elements: ['Earth', 'Negative'],
          ingredients: dustItems
        },
        {
          name: 'Aspect of Ice',
          elements: ['Water', 'Air'],
          ingredients: iceItems
        },
        {
          name: 'Aspect of Lightning',
          elements: ['Positive', 'Air'],
          ingredients: lightningItems
        },
        {
          name: 'Aspect of Magma',
          elements: ['Fire', 'Earth'],
          ingredients: magmaItems
        },
        {
          name: 'Aspect of Mineral',
          elements: ['Earth', 'Positive'],
          ingredients: mineralItems
        },
        {
          name: 'Aspect of Ooze',
          elements: ['Water', 'Earth'],
          ingredients: oozeItems
        },
        {
          name: 'Aspect of Radiance',
          elements: ['Fire', 'Positive'],
          ingredients: radianceItems
        },
        {
          name: 'Aspect of Salt',
          elements: ['Water', 'Negative'],
          ingredients: saltItems
        },
        {
          name: 'Aspect of Smoke',
          elements: ['Fire', 'Air'],
          ingredients: smokeItems
        },
        {
          name: 'Aspect of Steam',
          elements: ['Water', 'Positive'],
          ingredients: steamItems
        },
        {
          name: 'Aspect of Vacuum',
          elements: ['Air', 'Negative'],
          ingredients: vacuumItems
        },
        {
          name: 'Balance of Land and Sky',
          elements: ['Air', 'Earth'],
          ingredients: bolasItems
        },
        {
          name: 'Existential Stalemate',
          elements: ['Negative', 'Positive'],
          ingredients: stalemateItems
        },
        {
          name: 'Tempered',
          elements: ['Water', 'Fire'],
          ingredients: temperedItems
        }
      ] as AspectList[],
    [
      airItems,
      earthItems,
      fireItems,
      waterItems,
      negativeItems,
      positiveItems,
      ashItems,
      dustItems,
      iceItems,
      lightningItems,
      magmaItems,
      mineralItems,
      oozeItems,
      radianceItems,
      saltItems,
      smokeItems,
      steamItems,
      vacuumItems,
      bolasItems,
      stalemateItems,
      temperedItems
    ]
  )

  useEffect(() => {
    setAirItems(
      filterForSublist(subjugationItems, 'Aspect of Air', 'effectsAdded')
    )
    setEarthItems(
      filterForSublist(subjugationItems, 'Aspect of Earth', 'effectsAdded')
    )
    setFireItems(
      filterForSublist(subjugationItems, 'Aspect of Fire', 'effectsAdded')
    )
    setWaterItems(
      filterForSublist(subjugationItems, 'Aspect of Water', 'effectsAdded')
    )
    setNegativeItems(
      filterForSublist(
        subjugationItems,
        'Aspect of Negative Energy',
        'effectsAdded'
      )
    )
    setPositiveItems(
      filterForSublist(
        subjugationItems,
        'Aspect of Positive Energy',
        'effectsAdded'
      )
    )
    setAshItems(
      filterForSublist(subjugationItems, 'Aspect of Ash', 'effectsAdded')
    )
    setDustItems(
      filterForSublist(subjugationItems, 'Aspect of Dust', 'effectsAdded')
    )
    setIceItems(
      filterForSublist(subjugationItems, 'Aspect of Ice', 'effectsAdded')
    )
    setLightningItems(
      filterForSublist(subjugationItems, 'Aspect of Lightning', 'effectsAdded')
    )
    setMagmaItems(
      filterForSublist(subjugationItems, 'Aspect of Magma', 'effectsAdded')
    )
    setMineralItems(
      filterForSublist(subjugationItems, 'Aspect of Mineral', 'effectsAdded')
    )
    setOozeItems(
      filterForSublist(subjugationItems, 'Aspect of Ooze', 'effectsAdded')
    )
    setRadianceItems(
      filterForSublist(subjugationItems, 'Aspect of Radiance', 'effectsAdded')
    )
    setSaltItems(
      filterForSublist(subjugationItems, 'Aspect of Salt', 'effectsAdded')
    )
    setSmokeItems(
      filterForSublist(subjugationItems, 'Aspect of Smoke', 'effectsAdded')
    )
    setSteamItems(
      filterForSublist(subjugationItems, 'Aspect of Steam', 'effectsAdded')
    )
    setVacuumItems(
      filterForSublist(subjugationItems, 'Aspect of Vacuum', 'effectsAdded')
    )
    setBolasItems(
      filterForSublist(
        subjugationItems,
        'Balance of Land and Sky',
        'effectsAdded'
      )
    )
    setStalemateItems(
      filterForSublist(
        subjugationItems,
        'Existential Stalemate',
        'effectsAdded'
      )
    )
    setTemperedItems(
      filterForSublist(subjugationItems, 'Tempered', 'effectsAdded')
    )
  }, [subjugationItems])

  return {
    aspects,
    items: {
      airItems,
      earthItems,
      fireItems,
      waterItems,
      negativeItems,
      positiveItems,
      ashItems,
      dustItems,
      iceItems,
      lightningItems,
      magmaItems,
      mineralItems,
      oozeItems,
      radianceItems,
      saltItems,
      smokeItems,
      steamItems,
      vacuumItems,
      bolasItems,
      stalemateItems,
      temperedItems
    }
  }
}

interface AspectList {
  name: string
  elements: string[]
  ingredients: CraftingIngredient[]
}

export default useSubjugation
