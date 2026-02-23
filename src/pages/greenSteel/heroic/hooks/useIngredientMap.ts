import { useMemo } from 'react'
import type { CraftingIngredient } from '../../../../types/crafting.ts'

const useIngredientsMap = (
  items: CraftingIngredient[],
  elemental: Element[],
  filterCallback?: (item: CraftingIngredient, elementName: string, elements?: string[]) => boolean
) => {
  const ingredientsMap = useMemo(() => {
    const ingredientsMapByElement: Record<string, CraftingIngredient[]> = {}
    elemental.forEach((element: Element) => {
      const ingredientsForThisElement: CraftingIngredient[] = items.filter((item: CraftingIngredient): boolean => {
        return filterCallback ? filterCallback(item, element.name, element.elements) : true
      })

      // Keeps the dropdown more focused
      if (ingredientsForThisElement.length > 0) ingredientsMapByElement[element.name] = ingredientsForThisElement
    })

    return { ...ingredientsMapByElement }
  }, [items, elemental, filterCallback])

  return { ingredientsMap }
}

interface Element {
  name: string
  elements: string[]
}

export default useIngredientsMap
