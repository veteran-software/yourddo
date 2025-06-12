import type { Binding } from '../types/core.ts'

export const bindingText = (binding: Binding) =>
  `Bound to ${binding.location ?? 'Unknown'} (from ${
    binding.when ?? 'Unknown'
  })`
export const craftedMaterialInstructions = (ringName: string) =>
  `Craft the Focus, Gem, and Essence. Combine them in the Altar of Subjugation to create the imbued Shard of Great Power. Finally, apply the imbued Shard onto your ${ringName}`

export const chooseUpgrade = 'Choose an Upgrade...'
export const equipsTo = 'Equips to: '
export const filterMultipleResults =
  'There is more than one recipe available for this upgrade. The only difference is the Focus element.'
export const filtersText = 'Filters'
export const incrediblePotential = 'Incredible Potential'
export const ingredientType = 'Ingredient Type: '
export const minimumLevel = 'Minimum Level: '
export const noEffectsAvailable = 'No Effects Available'
export const rawMaterialsText = 'Raw Materials'
export const ringText = 'Ring'
export const selectBaseItem = 'Select a Base Item...'
export const unknownEffect = 'Unknown Effect'
