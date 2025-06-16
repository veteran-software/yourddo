import { useEffect, useState } from 'react'
import type { CraftingIngredient } from '../../../types/crafting.ts'

export const useIngredientsMap = (
  items: CraftingIngredient[],
  elemental: ElementalList[],
  filterCallback: (item: CraftingIngredient, elements: string[]) => boolean
) => {
  const [ingredientsMap, setIngredientsMap] = useState<
    Record<string, CraftingIngredient[]>
  >({})

  useEffect(() => {
    const updatedMap: Record<string, CraftingIngredient[]> = {}
    elemental.forEach((ele) => {
      updatedMap[ele.name] = items.filter((item) =>
        filterCallback(item, ele.elements)
      )
    })

    setIngredientsMap(updatedMap)
  }, [items, elemental, filterCallback])

  return { ingredientsMap }
}

interface ElementalList {
  name: string
  elements: string[]
}
