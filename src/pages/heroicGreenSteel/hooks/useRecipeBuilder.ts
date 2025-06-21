import { useEffect, useState } from 'react'
import { shallowEqual } from 'react-redux'
import { altarOfDevastation } from '../../../data/altarOfDevastation.ts'
import { altarOfFecundity } from '../../../data/altarOfFecundity.ts'
import { altarOfInvasion } from '../../../data/altarOfInvasion.ts'
import { altarOfSubjugation } from '../../../data/altarOfSubjugation.ts'
import { useAppSelector } from '../../../redux/hooks.ts'
import type { CraftingIngredient } from '../../../types/crafting.ts'
import { findIngredientByName } from '../../../utils/objectUtils.ts'

const useRecipeBuilder = () => {
  const {
    selectedFecundityItem,
    selectedSubjugationItem,
    selectedInvasionItem,
    selectedDevastationFocused,
    selectedDevastationBasic
  } = useAppSelector((state) => state.greenSteel, shallowEqual)

  const [rawMaterials, setRawMaterials] = useState<Record<string, number>>({})
  const [craftedMaterials, setCraftedMaterials] = useState<Record<string, number>>({})

  const buildRecipe = (recipe: CraftingIngredient, whereToLook: CraftingIngredient[]) => {
    const rawMaterials: Record<string, number> = {}
    const craftedMaterials: Record<string, number> = {}

    const traverse = (recipeIngredient: CraftingIngredient) => {
      recipeIngredient.requirements.forEach((requirement: CraftingIngredient) => {
        const ingredient: CraftingIngredient | undefined = findIngredientByName(requirement.name, whereToLook)
        if (ingredient) {
          craftedMaterials[ingredient.name] = (craftedMaterials[ingredient.name] ?? 0) + requirement.quantity

          traverse(ingredient)
        } else {
          rawMaterials[requirement.name] = (rawMaterials[requirement.name] ?? 0) + requirement.quantity
        }
      })
    }

    traverse(recipe)

    return {
      rawMaterials,
      craftedMaterials
    }
  }

  useEffect(() => {
    setRawMaterials({})
    setCraftedMaterials({})

    const newRaw: Record<string, number> = {}
    const newCrafted: Record<string, number> = {}

    ;[
      selectedFecundityItem,
      selectedInvasionItem,
      selectedSubjugationItem,
      selectedDevastationBasic,
      selectedDevastationFocused
    ].forEach((item: CraftingIngredient | undefined) => {
      if (!item) return

      const { rawMaterials = {}, craftedMaterials = {} } = buildRecipe(item, [
        ...altarOfFecundity,
        ...altarOfInvasion,
        ...altarOfSubjugation,
        ...altarOfDevastation
      ])

      Object.entries(rawMaterials).forEach(([key, value]) => {
        newRaw[key] = (newRaw[key] ?? 0) + value
      })

      Object.entries(craftedMaterials).forEach(([key, value]) => {
        newCrafted[key] = (newCrafted[key] ?? 0) + value
      })
    })

    if (JSON.stringify(rawMaterials) !== JSON.stringify(newRaw)) {
      setRawMaterials(newRaw)
    }

    if (JSON.stringify(craftedMaterials) !== JSON.stringify(newCrafted)) {
      setCraftedMaterials(newCrafted)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedDevastationBasic,
    selectedDevastationFocused,
    selectedFecundityItem,
    selectedInvasionItem,
    selectedSubjugationItem
  ])

  return {
    rawMaterials,
    craftedMaterials
  }
}

export default useRecipeBuilder
