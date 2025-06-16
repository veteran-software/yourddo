import { useEffect, useMemo, useState } from 'react'
import { shallowEqual } from 'react-redux'
import { useAppSelector } from '../../../redux/hooks.ts'
import type { CraftingIngredient } from '../../../types/crafting.ts'

export const useDevastationFocused = () => {
  const { devastationFocusedEffects } = useAppSelector(
    (state) => state.greenSteel,
    shallowEqual
  )

  const items: CraftingIngredient[] = useMemo(
    () => [...devastationFocusedEffects],
    [devastationFocusedEffects]
  )

  const [ingredientsMap, setIngredientsMap] = useState<
    Record<string, CraftingIngredient[]>
  >({})

  const elemental: ElementalList[] = useMemo(() => {
    return [
      {
        name: 'Air',
        elements: ['Air', 'Air']
      },
      {
        name: 'Earth',
        elements: ['Earth', 'Earth']
      },
      {
        name: 'Fire',
        elements: ['Fire', 'Fire']
      },
      {
        name: 'Water',
        elements: ['Water', 'Water']
      },
      {
        name: 'Negative Energy',
        elements: ['Negative', 'Negative']
      },
      {
        name: 'Positive Energy',
        elements: ['Positive', 'Positive']
      },
      {
        name: 'Ash',
        elements: ['Ash', 'Fire']
      },
      {
        name: 'Dust',
        elements: ['Dust', 'Earth']
      },
      {
        name: 'Ice',
        elements: ['Freezing Ice', 'Air']
      },
      {
        name: 'Lightning',
        elements: ['Lightning Strike', 'Air']
      },
      {
        name: 'Magma',
        elements: ['Magma', 'Fire']
      },
      {
        name: 'Mineral',
        elements: ['Mineral', 'Earth']
      },
      {
        name: 'Ooze',
        elements: ['Ooze', 'Water']
      },
      {
        name: 'Radiance',
        elements: ['Radiance', 'Fire']
      },
      {
        name: 'Corrosive Salt',
        elements: ['Corrosive Salt', 'Water']
      },
      {
        name: 'Smoke Screen',
        elements: ['Smoke Screen', 'Fire']
      },
      {
        name: 'Steam',
        elements: ['Steam', 'Water']
      },
      {
        name: 'Vacuum',
        elements: ['Vacuum', 'Air']
      },
      {
        name: 'Balance of Land and Sky',
        elements: ['Tempered', 'Earth']
      },
      {
        name: 'Existential Stalemate',
        elements: ['Existential Stalemate', 'Positive Energy']
      },
      {
        name: 'Tempered',
        elements: ['Balance of Land and Sky', 'Water']
      }
    ] as ElementalList[]
  }, [])

  useEffect(() => {
    const updatedMap: Record<string, CraftingIngredient[]> = {}
    elemental.forEach((ele) => {
      updatedMap[ele.name] = items.filter((item: CraftingIngredient) => {
        const reqs: CraftingIngredient[] =
          item.requirements as CraftingIngredient[]

        const elementOneCheck = reqs[0].name.includes(ele.elements[0])
        const elementTwoCheck =
          reqs[1].description?.includes(ele.elements[1]) ??
          reqs[1].name.includes(ele.elements[1])

        return elementOneCheck && elementTwoCheck
      })
    })

    setIngredientsMap(updatedMap)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items])

  return { ingredientsMap }
}

export interface ElementalList {
  name: string
  elements: string[]
  ingredients: CraftingIngredient[]
}
