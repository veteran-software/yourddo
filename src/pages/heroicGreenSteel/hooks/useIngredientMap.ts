import { useEffect, useState } from 'react'
import type { CraftingIngredient } from '../../../types/crafting.ts'

const useIngredientsMap = (
  items: CraftingIngredient[],
  elemental: ElementalList[],
  filterCallback: (
    item: CraftingIngredient,
    elementName: string,
    elements: string[]
  ) => boolean
) => {
  const [ingredientsMap, setIngredientsMap] = useState<
    Record<string, CraftingIngredient[]>
  >({})

  useEffect(() => {
    const updatedMap: Record<string, CraftingIngredient[]> = {}
    elemental.forEach((ele: ElementalList) => {
      updatedMap[ele.name] = items.filter(
        (item) =>
          filterCallback(item, ele.name, ele.elements) &&
          ((item.effectsAdded as CraftingIngredient[])
            .at(1)
            ?.name.includes(`Aspect of ${ele.name}`) ??
            '')
      )
    })

    console.log(updatedMap)
    setIngredientsMap({ ...updatedMap })
  }, [items, elemental, filterCallback])

  useEffect(() => {
    console.log(ingredientsMap)
  }, [ingredientsMap])

  return { ingredientsMap }
}

interface ElementalList {
  name: string
  elements: string[]
}

export default useIngredientsMap
