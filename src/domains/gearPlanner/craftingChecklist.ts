import { EQUIPMENT_SLOTS } from '../essenceCrafting/equipment'
import type { EssenceBinding, EssenceCraftingData } from '../essenceCrafting/essenceCrafting.types'
import { calculatePlannedItemMaterials } from '../essenceCrafting/materialCalculations'
import { enabledOwners, ownerSlots } from './character'
import type { CraftingMaterial } from './crafting'
import { createGearPlannerEssenceCraftingConfiguration, hasGearPlannerEssenceExtraSlot } from './essenceCrafting'
import { troveHoldingAvailability } from './farming'
import type { GearPlannerItem, GearPlannerSlot } from './gearPlanner.types'
import {
  gearPlannerReforgingChoiceForState,
  gearPlannerReforgingRecipesForItem,
  gearPlannerReforgingStageLabel,
  selectedNativeOption,
  type GearPlannerReforgingData
} from './reforging'
import type { GearPlannerSetup } from './setups'
import { TroveSnapshot, type TroveInventory } from './trove'

interface CraftingStep {
  id: string
  label: string
  materials?: readonly CraftingMaterial[]
}

const affixLabels = { prefix: 'Prefix', suffix: 'Suffix', extra: 'Extra' }

function essenceChecklistSteps(
  item: GearPlannerItem,
  setup: GearPlannerSetup,
  essence: EssenceCraftingData,
  binding: EssenceBinding
): CraftingStep[] {
  const category = item.essenceCrafting?.itemCategoryId
  if (!category) return []
  const configuration =
    setup.essenceCrafting[item.id] ?? createGearPlannerEssenceCraftingConfiguration(essence, item.minimumLevel)
  const { minimumLevel, prefixId, suffixId, extraId } = configuration
  const slot = EQUIPMENT_SLOTS.find(({ itemCategoryIds }) => itemCategoryIds.some((id) => id === category))
  const { steps } = calculatePlannedItemMaterials(
    essence,
    {
      prefixEnhancementId: prefixId,
      suffixEnhancementId: suffixId,
      extraEnhancementId: extraId,
      hasCannithMark: hasGearPlannerEssenceExtraSlot(configuration),
      minimumLevelOverride: null,
      augmentSlots: []
    },
    minimumLevel,
    binding,
    slot?.id
  )
  return steps.map((step) => {
    const enhancement = step.selection && essence.indexes.enhancementById.get(step.selection.enhancementId)
    let label: string
    if (step.source === 'minimum-level-shard') label = 'Minimum Level ' + String(minimumLevel) + ' shard'
    else if (step.source === 'mark-of-house-cannith') label = 'Unlock extra affix'
    else label = affixLabels[step.source] + (enhancement ? ' · ' + enhancement.displayName : '')
    return {
      id: JSON.stringify([
        binding,
        step.source,
        step.status === 'resolved' && step.recipeId,
        step.selection?.enhancementId,
        step.source === 'minimum-level-shard' && minimumLevel
      ]),
      label,
      materials:
        step.status === 'resolved'
          ? step.materials.map(({ displayName: name, ingredientId: id, quantity }) => ({ name, id, quantity }))
          : undefined
    }
  })
}

export function craftingChecklistItems(
  setup: GearPlannerSetup,
  reforging: GearPlannerReforgingData,
  essence: EssenceCraftingData,
  binding: EssenceBinding
) {
  const items: { slot: GearPlannerSlot; item: GearPlannerItem; steps: CraftingStep[] }[] = []
  for (const owner of enabledOwners(setup.character.classes)) {
    for (const slot of ownerSlots[owner]) {
      const item = setup.equipment[slot]
      if (!item) continue
      const steps = essenceChecklistSteps(item, setup, essence, binding)
      for (const { system, id, label, materials } of item.crafts ?? []) {
        steps.push({ id: JSON.stringify([system, id]), label, materials })
      }
      if (item.source.suppressedPowerRecipeId !== undefined) {
        steps.push({
          id: 'suppressed-power:' + String(item.source.suppressedPowerRecipeId),
          label: 'Unlock Suppressed Power',
          materials: item.source.suppressedPowerMaterials
        })
      }
      const selections = setup.reforging[item.id]
      if (selections) {
        for (const recipe of gearPlannerReforgingRecipesForItem(item, reforging)) {
          const selection = selections[recipe.stage]
          if (!selection) continue
          const choice = gearPlannerReforgingChoiceForState(item, recipe.stage, selection, reforging)
          if (selection.kind === 'choice' && !choice) continue
          const option = selectedNativeOption(item, recipe, selection, reforging)
          const stage = gearPlannerReforgingStageLabel[recipe.stage]
          steps.push({
            id: JSON.stringify([recipe.stage, choice?.id]),
            label: choice ? stage + ' · ' + choice.label : stage,
            materials: option?.materials ?? recipe.cost
          })
        }
      }
      if (steps.length) items.push({ slot, item, steps })
    }
  }
  return items
}

export function craftingMaterialTotals(
  materials: readonly CraftingMaterial[],
  inventory: TroveInventory,
  character: string,
  importedAt?: string
) {
  const target = character.trim().toLowerCase()
  const hasImport = Boolean(importedAt) || inventory.size > 0
  const totals = new Map<string, CraftingMaterial>()
  for (const material of materials) {
    const key = material.name.trim().toLowerCase()
    const existing = totals.get(key)
    totals.set(key, {
      ...material,
      id: existing?.id ?? material.id,
      quantity: (existing?.quantity ?? 0) + material.quantity
    })
  }
  return [...totals]
    .map(([key, material]) => {
      const stock = inventory instanceof TroveSnapshot ? inventory.holdings.get(key) : undefined
      let usable = 0
      let uncertain = inventory.has(key) && !stock ? material.quantity : 0
      const locations = new Map<string, number>()
      const restricted = new Set<string>()
      const verify = new Set(stock ? [] : inventory.get(key))
      for (const holding of stock ?? []) {
        const availability = troveHoldingAvailability(holding, target)
        if (availability === 'Owned' || availability === 'Collect') {
          usable += holding.quantity
          if (holding.location)
            locations.set(holding.location, (locations.get(holding.location) ?? 0) + holding.quantity)
        } else if (availability === 'Check') {
          uncertain += holding.quantity
          if (holding.location) verify.add(holding.location)
        } else if (holding.location) restricted.add(holding.location)
      }
      const outstanding = Math.max(0, material.quantity - usable)
      const unverified = Math.min(outstanding, uncertain)
      return {
        ...material,
        key,
        usable,
        unverified,
        missing: hasImport ? outstanding - unverified : null,
        locations,
        verify: [...verify],
        restricted: [...restricted]
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}
