import { useCallback } from 'react'
import { altarOfSubjugation } from '../../../data/altarOfSubjugation.ts'
import { useAppDispatch } from '../../../redux/hooks.ts'
import {
  addCraftedIngredient,
  addRawMaterial,
  clearCraftedIngredients,
  clearRawMaterials
} from '../../../redux/slices/incrediblePotentialSlice.ts'
import type { AppDispatch } from '../../../redux/store.ts'
import type { CraftingIngredient } from '../../../types/crafting.ts'

const useRecipeBuilder = () => {
  const dispatch: AppDispatch = useAppDispatch()

  const recipeBuilder = useCallback(
    (recipe: CraftingIngredient | undefined) => {
      if (recipe) {
        if (recipe.craftedIn) {
          recipe.requirements?.forEach((requirement: CraftingIngredient | string) => {
            if (typeof requirement !== 'string') {
              const ingredient: CraftingIngredient | undefined = altarOfSubjugation.find(
                (recipe: CraftingIngredient) => recipe.name === requirement.name
              )

              if (ingredient) {
                // Crafted Ingredient
                dispatch(addCraftedIngredient(ingredient))

                recipeBuilder(ingredient)
              } else {
                // Raw material you find in the wild
                dispatch(addRawMaterial(requirement))
              }
            }
          })
        }
      }
    },
    [dispatch]
  )

  const resetRecipe = () => {
    dispatch(clearCraftedIngredients())
    dispatch(clearRawMaterials())
  }

  return { recipeBuilder, resetRecipe }
}

export default useRecipeBuilder
