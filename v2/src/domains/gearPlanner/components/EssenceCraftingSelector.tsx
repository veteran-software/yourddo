import { Select, SimpleGrid, Stack, Text } from '@mantine/core'
import { formatResolvedEffectModifier, resolveEnhancementEffects } from '../../essenceCrafting/enhancementEffects.ts'
import type { EssenceCraftingData, EssenceEnhancement } from '../../essenceCrafting/essenceCrafting.types.ts'
import {
  type GearPlannerEssenceCraftingConfiguration,
  gearPlannerEssenceCraftingMaterials,
  getGearPlannerEssenceCraftingLevel,
  getGearPlannerEssenceEnhancementChoices,
  hasGearPlannerEssenceExtraSlot
} from '../essenceCrafting.ts'
import type { GearPlannerCurse, GearPlannerItem } from '../gearPlanner.types.ts'

interface EssenceCraftingSelectorProps {
  item: GearPlannerItem
  data: EssenceCraftingData
  configuration: GearPlannerEssenceCraftingConfiguration
  curse: GearPlannerCurse | null
  onMinimumLevelChange: (minimumLevel: number) => void
  onMaterialChange: (material: string) => void
  onAffixChange: (position: 'prefix' | 'suffix' | 'extra', enhancementId: string | null) => void
}

const effectLabel = (data: EssenceCraftingData, enhancement: EssenceEnhancement, effectiveLevel: number): string => {
  if (effectiveLevel < enhancement.minimumItemLevel) return enhancement.displayName
  const resolved = resolveEnhancementEffects(data, enhancement.id, effectiveLevel)
  if (resolved.status !== 'resolved') return enhancement.displayName
  const effects = resolved.effects.map(({ effect, modifier, bonusType }) => {
    const value = formatResolvedEffectModifier(modifier)
    return `${effect.displayName}${value ? ` ${value}` : ''}${bonusType ? ` (${bonusType.displayName})` : ''}`
  })
  return effects.length ? `${enhancement.displayName} (${effects.join('; ')})` : enhancement.displayName
}

const withSelectedOption = (
  data: EssenceCraftingData,
  choices: readonly EssenceEnhancement[],
  selectedId: string | null,
  effectiveLevel: number
) => {
  const selected = selectedId === null ? undefined : data.indexes.enhancementById.get(selectedId)
  const allChoices = selected && !choices.some(({ id }) => id === selected.id) ? [...choices, selected] : choices
  return allChoices.map((enhancement) => ({
    value: enhancement.id,
    label: effectLabel(data, enhancement, effectiveLevel)
  }))
}

const EffectDetails = ({
  data,
  enhancementId,
  effectiveLevel
}: {
  data: EssenceCraftingData
  enhancementId: string | null
  effectiveLevel: number
}) => {
  if (!enhancementId) return null
  const enhancement = data.indexes.enhancementById.get(enhancementId)
  if (!enhancement || effectiveLevel < enhancement.minimumItemLevel) return null
  const resolved = resolveEnhancementEffects(data, enhancementId, effectiveLevel)
  if (resolved.status !== 'resolved') return null
  return (
    <Stack gap={1}>
      {resolved.effects.map(({ effect, modifier, bonusType }) => {
        const formattedModifier = formatResolvedEffectModifier(modifier)
        return (
          <Text key={effect.id} c='dimmed' size='xs'>
            {effect.displayName}
            {formattedModifier ? ` ${formattedModifier}` : ''}
            {bonusType ? ` (${bonusType.displayName})` : ''}
          </Text>
        )
      })}
    </Stack>
  )
}

const EssenceCraftingSelector = ({
  item,
  data,
  configuration,
  curse,
  onMinimumLevelChange,
  onMaterialChange,
  onAffixChange
}: EssenceCraftingSelectorProps) => {
  const effectiveLevel = getGearPlannerEssenceCraftingLevel(data, configuration, curse)
  const prefix = getGearPlannerEssenceEnhancementChoices(data, item, configuration, curse, 'prefix')
  const suffix = getGearPlannerEssenceEnhancementChoices(data, item, configuration, curse, 'suffix')
  const extra = getGearPlannerEssenceEnhancementChoices(data, item, configuration, curse, 'extra')
  const { minimum, maximum } = data.rules.supportedItemLevels
  const minimumLevels = Array.from({ length: maximum - minimum + 1 }, (_, index) => {
    const value = minimum + index
    return { value: String(value), label: String(value) }
  })

  return (
    <Stack gap='xs' pt='xs' data-testid={`essence-crafting-${item.id}`}>
      <Text c='blue' fw={600} size='xs'>
        Essence Crafting · effective ML {effectiveLevel}
      </Text>
      <SimpleGrid cols={{ base: 1, xs: 2 }} spacing='xs'>
        <Select
          size='xs'
          label='Essence minimum level'
          data={minimumLevels}
          value={String(configuration.minimumLevel)}
          allowDeselect={false}
          onChange={(value) => {
            const minimumLevel = Number(value)
            if (Number.isInteger(minimumLevel)) onMinimumLevelChange(minimumLevel)
          }}
        />
        <Select
          size='xs'
          label='Material'
          placeholder='None'
          clearable
          data={gearPlannerEssenceCraftingMaterials.map((material) => ({ value: material, label: material }))}
          value={configuration.material || null}
          onChange={(material) => {
            onMaterialChange(material ?? '')
          }}
        />
      </SimpleGrid>
      <SimpleGrid
        cols={{ base: 1, md: hasGearPlannerEssenceExtraSlot(configuration) && extra.length ? 3 : 2 }}
        spacing='xs'
      >
        <Stack gap={3}>
          <Select
            size='xs'
            label='Prefix'
            placeholder='Choose a prefix'
            searchable
            clearable
            data={withSelectedOption(data, prefix, configuration.prefixId, effectiveLevel)}
            value={configuration.prefixId}
            onChange={(enhancementId) => {
              onAffixChange('prefix', enhancementId)
            }}
          />
          <EffectDetails data={data} enhancementId={configuration.prefixId} effectiveLevel={effectiveLevel} />
        </Stack>
        <Stack gap={3}>
          <Select
            size='xs'
            label='Suffix'
            placeholder='Choose a suffix'
            searchable
            clearable
            data={withSelectedOption(data, suffix, configuration.suffixId, effectiveLevel)}
            value={configuration.suffixId}
            onChange={(enhancementId) => {
              onAffixChange('suffix', enhancementId)
            }}
          />
          <EffectDetails data={data} enhancementId={configuration.suffixId} effectiveLevel={effectiveLevel} />
        </Stack>
        {hasGearPlannerEssenceExtraSlot(configuration) && extra.length > 0 ? (
          <Stack gap={3}>
            <Select
              size='xs'
              label='Mark of House Cannith / Extra'
              placeholder='Choose an extra'
              searchable
              clearable
              data={withSelectedOption(data, extra, configuration.extraId, effectiveLevel)}
              value={configuration.extraId}
              onChange={(enhancementId) => {
                onAffixChange('extra', enhancementId)
              }}
            />
            <EffectDetails data={data} enhancementId={configuration.extraId} effectiveLevel={effectiveLevel} />
          </Stack>
        ) : null}
      </SimpleGrid>
    </Stack>
  )
}

export default EssenceCraftingSelector
