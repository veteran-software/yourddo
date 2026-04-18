import { useMemo } from 'react'
import { shallowEqual } from 'react-redux'
import { altarOfDevastation } from '../../../../data/altarOfDevastation.ts'
import { altarOfFecundity } from '../../../../data/altarOfFecundity.ts'
import { altarOfInvasion } from '../../../../data/altarOfInvasion.ts'
import { altarOfSubjugation } from '../../../../data/altarOfSubjugation.ts'
import {
  legendaryAltarOfDevastation
} from '../../../../data/legendaryAltarOfDevastation.ts'
import {
  legendaryAltarOfInvasion
} from '../../../../data/legendaryAltarOfInvasion.ts'
import {
  legendaryAltarOfSubjugation
} from '../../../../data/legendaryAltarOfSubjugation.ts'
import { useAppSelector } from '../../../../redux/hooks.ts'
import type { CraftingIngredient } from '../../../../types/crafting.ts'
import { findCraftedIngredientByName } from '../../../../utils/objectUtils.ts'

type GreenSteelType = 'heroic' | 'legendary'

const getIngredientSources = (type: GreenSteelType): CraftingIngredient[] => {
  if (type === 'heroic') {
    return [...altarOfFecundity, ...altarOfInvasion, ...altarOfSubjugation, ...altarOfDevastation]
  }

  return [
    ...altarOfFecundity,
    ...legendaryAltarOfInvasion,
    ...legendaryAltarOfSubjugation,
    ...legendaryAltarOfDevastation
  ]
}

const buildRecipe = (recipe: CraftingIngredient, whereToLook: CraftingIngredient[]) => {
  const rawMaterials: Record<string, number> = {}
  const craftedMaterials: Record<string, number> = {}

  const traverse = (recipeIngredient: CraftingIngredient) => {
    recipeIngredient.requirements?.forEach((requirement: CraftingIngredient) => {
      const ingredient: CraftingIngredient | undefined = findCraftedIngredientByName(requirement.name, whereToLook)
      if (ingredient) {
        craftedMaterials[ingredient.name] = (craftedMaterials[ingredient.name] ?? 0) + (requirement.quantity ?? 1)
        traverse(ingredient)
      } else {
        rawMaterials[requirement.name] = (rawMaterials[requirement.name] ?? 0) + (requirement.quantity ?? 1)
      }
    })
  }

  traverse(recipe)
  return {
    rawMaterials,
    craftedMaterials
  }
}

const useRecipeBuilder = (type: GreenSteelType) => {
  const heroicSelections = useAppSelector(
    (state) => ({
      selectedFecundityItem: state.greenSteel.selectedFecundityItem,
      selectedSubjugationItem: state.greenSteel.selectedSubjugationItem,
      selectedInvasionItem: state.greenSteel.selectedInvasionItem,
      selectedDevastationFocused: state.greenSteel.selectedDevastationFocused,
      selectedDevastationBasic: state.greenSteel.selectedDevastationBasic
    }),
    shallowEqual
  )

  const legendarySelections = useAppSelector(
    (state) => ({
      selectedFecundityItem: state.legendaryGreenSteel.selectedFecundityItem,
      selectedSubjugationItem: state.legendaryGreenSteel.selectedSubjugationItem,
      selectedInvasionItem: state.legendaryGreenSteel.selectedInvasionItem,
      selectedDevastationItem: state.legendaryGreenSteel.selectedDevastationItem,
      selectedActiveAugment: state.legendaryGreenSteel.selectedActiveAugment
    }),
    shallowEqual
  )

  return useMemo(() => {
    const rawMaterials: Record<string, number> = {}
    const craftedMaterials: Record<string, number> = {}
    const ingredientSources: CraftingIngredient[] = getIngredientSources(type)

    const selectedItems: (CraftingIngredient | undefined)[] =
      type === 'heroic'
        ? [
            heroicSelections.selectedFecundityItem,
            heroicSelections.selectedInvasionItem,
            heroicSelections.selectedSubjugationItem,
            heroicSelections.selectedDevastationBasic,
            heroicSelections.selectedDevastationFocused
          ]
        : [
            legendarySelections.selectedFecundityItem,
            legendarySelections.selectedInvasionItem,
            legendarySelections.selectedSubjugationItem,
            legendarySelections.selectedDevastationItem,
            legendarySelections.selectedActiveAugment
          ]

    selectedItems.forEach((item: CraftingIngredient | undefined) => {
      if (!item) return

      const result = buildRecipe(item, ingredientSources)

      Object.entries(result.rawMaterials).forEach(([key, value]) => {
        rawMaterials[key] = (rawMaterials[key] ?? 0) + value
      })

      Object.entries(result.craftedMaterials).forEach(([key, value]) => {
        craftedMaterials[key] = (craftedMaterials[key] ?? 0) + value
      })
    })

    return {
      rawMaterials,
      craftedMaterials
    }
  }, [type, heroicSelections, legendarySelections])
}

export default useRecipeBuilder
