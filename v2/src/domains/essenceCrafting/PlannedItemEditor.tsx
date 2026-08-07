import {
  Alert,
  Badge,
  Button,
  Group,
  MultiSelect,
  Paper,
  Radio,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  Title
} from '@mantine/core'
import AugmentSelect from '../../shared/augments/AugmentSelect.tsx'
import {
  filterCompatibleAugmentsByEffectsFromCompatibleAugments,
  getAugmentSlotMinimumItemLevel,
  getAvailableAugmentEffectNamesFromCompatibleAugments,
  getAvailableAugmentSlotTypes,
  getCompatibleAugments,
  isAugmentSlotTypeAvailable,
  isSelectedAugmentStillValidFromCompatibleAugments
} from './augmentRules.ts'
import {
  type EssenceEffectDisplayData,
  formatResolvedEffectModifier,
  resolveEnhancementEffects,
  resolveEssenceEffects
} from './enhancementEffects.ts'
import { getAvailableEnhancementChoices, hasCannithMarkExtraAffixPermission } from './enhancementEligibility.ts'
import { EQUIPMENT_SLOTS, type EquipmentSlotId } from './equipment.ts'
import type { EssenceCraftingData, EssenceEnhancement } from './essenceCrafting.types.ts'
import type { PlannedItem } from './plannerState.ts'
import type { EssencePlanAction } from './plannerTransitions.ts'

interface PlannedItemEditorProps {
  data: EssenceCraftingData
  equipmentSlotId: EquipmentSlotId
  item: PlannedItem
  masterMinimumLevel: number
  collapsed: boolean
  onAction: (action: EssencePlanAction) => void
  onRequestDeactivate: (equipmentSlotId: EquipmentSlotId) => void
}

const toSelectData = (enhancements: readonly EssenceEnhancement[]) =>
  enhancements.map(({ id, displayName }) => ({ value: id, label: displayName }))

const formatEffectDisplay = ({ effect, modifier, bonusType }: EssenceEffectDisplayData): string => {
  const formattedModifier = formatResolvedEffectModifier(modifier)
  return `${effect.displayName}${formattedModifier ? `: ${formattedModifier}` : ''}${
    bonusType ? ` (${bonusType.displayName})` : ''
  }`
}

const EffectDetails = ({ effects }: { effects: readonly EssenceEffectDisplayData[] }) => {
  if (effects.length === 0) return null

  return (
    <Stack gap={2}>
      {effects.map((effect) => (
        <Text key={effect.effect.id} c='dimmed' size='xs'>
          {formatEffectDisplay(effect)}
        </Text>
      ))}
    </Stack>
  )
}

const PlannedItemEditor = ({
  data,
  equipmentSlotId,
  item,
  masterMinimumLevel,
  collapsed,
  onAction,
  onRequestDeactivate
}: PlannedItemEditorProps) => {
  const equipmentSlot = EQUIPMENT_SLOTS.find(({ id }) => id === equipmentSlotId)
  if (!equipmentSlot) return null

  const { label } = equipmentSlot
  const detailsId = `planned-item-${equipmentSlotId}-details`
  const effectiveMinimumLevel = item.minimumLevelOverride ?? masterMinimumLevel
  const prefixChoices = getAvailableEnhancementChoices(data, equipmentSlotId, 'prefix', effectiveMinimumLevel)
  const suffixChoices = getAvailableEnhancementChoices(data, equipmentSlotId, 'suffix', effectiveMinimumLevel)
  const extraChoices = getAvailableEnhancementChoices(data, equipmentSlotId, 'extra', effectiveMinimumLevel)
  const resolveSelectedEnhancementEffects = (enhancementId: string | null) =>
    enhancementId === null ? [] : resolveEnhancementEffects(data, enhancementId, effectiveMinimumLevel).effects
  const prefixEffects = resolveSelectedEnhancementEffects(item.prefixEnhancementId)
  const suffixEffects = resolveSelectedEnhancementEffects(item.suffixEnhancementId)
  const extraEffects = resolveSelectedEnhancementEffects(item.extraEnhancementId)
  const extraEnabled = hasCannithMarkExtraAffixPermission(data, item.hasCannithMark)
  const availableAugmentSlotTypes = getAvailableAugmentSlotTypes(
    data,
    equipmentSlotId,
    item.augmentSlots.map(({ augmentSlotTypeId }) => augmentSlotTypeId)
  )
  const augmentTypeDisplayNameById = new Map(data.augmentTypes.map(({ id, displayName }) => [id, displayName]))
  const augmentSlotEditors = item.augmentSlots.flatMap((augmentSlot) => {
    const augmentSlotType = data.rules.augmentSlotTypes.find(({ id }) => id === augmentSlot.augmentSlotTypeId)
    const minimumItemLevel = getAugmentSlotMinimumItemLevel(data, augmentSlot.augmentSlotTypeId)
    if (!augmentSlotType || minimumItemLevel === undefined) return []

    const compatibleAugments = getCompatibleAugments(data, augmentSlot.augmentSlotTypeId)
    const selectedAugmentIsValid = isSelectedAugmentStillValidFromCompatibleAugments(
      data,
      augmentSlot.augmentId,
      equipmentSlotId,
      augmentSlot.augmentSlotTypeId,
      effectiveMinimumLevel,
      compatibleAugments
    )
    const augmentSlotIsEligible =
      Number.isInteger(effectiveMinimumLevel) &&
      effectiveMinimumLevel >= data.rules.supportedItemLevels.minimum &&
      effectiveMinimumLevel <= data.rules.supportedItemLevels.maximum &&
      effectiveMinimumLevel >= minimumItemLevel &&
      isAugmentSlotTypeAvailable(data, equipmentSlotId, augmentSlot.augmentSlotTypeId)
    const eligibleAugments = augmentSlotIsEligible
      ? compatibleAugments.filter((augment) => augment.minimumItemLevel <= effectiveMinimumLevel)
      : []
    const filteredCompatibleAugments = filterCompatibleAugmentsByEffectsFromCompatibleAugments(
      eligibleAugments,
      augmentSlot.selectedEffectNames,
      augmentSlot.filterMode
    )
    const selectedAugment = selectedAugmentIsValid
      ? data.indexes.augmentById.get(augmentSlot.augmentId ?? '')
      : undefined
    const augmentOptions =
      selectedAugment && !filteredCompatibleAugments.some(({ id }) => id === selectedAugment.id)
        ? [...filteredCompatibleAugments, selectedAugment]
        : filteredCompatibleAugments

    return [
      {
        augmentSlot,
        augmentSlotType,
        minimumItemLevel,
        effectNames: getAvailableAugmentEffectNamesFromCompatibleAugments(compatibleAugments),
        selectedAugmentIsValid,
        effects: selectedAugment ? resolveEssenceEffects(data, selectedAugment.effects, effectiveMinimumLevel) : [],
        options: augmentOptions.map((augment) => ({
          value: augment.id,
          label: augment.displayName,
          augmentType: augmentTypeDisplayNameById.get(augment.augmentTypeId) ?? augment.augmentTypeId,
          minimumLevel: augment.minimumItemLevel
        }))
      }
    ]
  })
  const { minimum, maximum } = data.rules.supportedItemLevels
  const minimumLevelOptions = [
    { value: 'inherit', label: `Inherit master minimum level (${String(masterMinimumLevel)})` },
    ...Array.from({ length: maximum - minimum + 1 }, (_, index) => {
      const minimumLevel = minimum + index
      return { value: String(minimumLevel), label: String(minimumLevel) }
    })
  ]

  return (
    <Paper withBorder p={{ base: 'md', sm: 'lg' }} data-testid={`planned-item-${equipmentSlotId}`}>
      <Stack gap='md'>
        <Group justify='space-between' align='flex-start' wrap='wrap' gap='sm'>
          <Stack gap={4}>
            <Title order={2} size='h3'>
              {label} planned item
            </Title>
            <Badge variant='light' w='fit-content'>
              Effective minimum level: {effectiveMinimumLevel}
            </Badge>
          </Stack>

          <Group gap='xs' wrap='wrap'>
            <Button
              variant='subtle'
              size='sm'
              aria-label={`${collapsed ? 'Expand' : 'Collapse'} ${label} planned item`}
              aria-expanded={!collapsed}
              aria-controls={detailsId}
              onClick={() => {
                onAction({
                  type: collapsed ? 'expand-equipment-slot' : 'collapse-equipment-slot',
                  equipmentSlotId
                })
              }}
            >
              {collapsed ? 'Expand' : 'Collapse'}
            </Button>
            <Button
              variant='subtle'
              size='sm'
              aria-label={`Reset ${label} planned item`}
              onClick={() => {
                onAction({ type: 'reset-planned-item', equipmentSlotId })
              }}
            >
              Reset item
            </Button>
            <Button
              color='red'
              variant='subtle'
              size='sm'
              aria-label={`Remove ${label} planned item`}
              onClick={() => {
                onRequestDeactivate(equipmentSlotId)
              }}
            >
              Remove
            </Button>
          </Group>
        </Group>

        {!collapsed ? (
          <Stack id={detailsId} gap='md'>
            {prefixChoices.length === 0 && suffixChoices.length === 0 && extraChoices.length === 0 ? (
              <Alert color='yellow' title='No affixes are available'>
                The loaded data has no {label} affixes for minimum level {effectiveMinimumLevel}.
              </Alert>
            ) : null}

            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing='md'>
              <Select
                label={`Minimum level for ${label}`}
                data={minimumLevelOptions}
                value={item.minimumLevelOverride === null ? 'inherit' : String(item.minimumLevelOverride)}
                onChange={(value) => {
                  const minimumLevel = value === 'inherit' ? null : Number(value)
                  if (minimumLevel === null || Number.isInteger(minimumLevel)) {
                    onAction({ type: 'set-item-minimum-level-override', equipmentSlotId, minimumLevel })
                  }
                }}
                allowDeselect={false}
              />

              <Stack gap={4}>
                <Select
                  label={`Prefix for ${label}`}
                  placeholder='Choose a prefix'
                  data={toSelectData(prefixChoices)}
                  value={item.prefixEnhancementId}
                  onChange={(enhancementId) => {
                    onAction({ type: 'select-prefix-enhancement', equipmentSlotId, enhancementId })
                  }}
                  clearable
                  searchable
                />
                <EffectDetails effects={prefixEffects} />
              </Stack>

              <Stack gap={4}>
                <Select
                  label={`Suffix for ${label}`}
                  placeholder='Choose a suffix'
                  data={toSelectData(suffixChoices)}
                  value={item.suffixEnhancementId}
                  onChange={(enhancementId) => {
                    onAction({ type: 'select-suffix-enhancement', equipmentSlotId, enhancementId })
                  }}
                  clearable
                  searchable
                />
                <EffectDetails effects={suffixEffects} />
              </Stack>

              <Stack gap='xs' justify='flex-end'>
                <Switch
                  label={`Mark of House Cannith for ${label}`}
                  checked={item.hasCannithMark}
                  onChange={(event) => {
                    onAction({
                      type: 'set-cannith-mark',
                      equipmentSlotId,
                      enabled: event.currentTarget.checked
                    })
                  }}
                />
                <Text c='dimmed' size='xs'>
                  A Mark enables one extra affix.
                </Text>
              </Stack>

              <Stack gap={4}>
                <Select
                  label={`Extra for ${label}`}
                  placeholder={extraEnabled ? 'Choose an extra affix' : 'Enable the Mark to choose an extra affix'}
                  data={toSelectData(extraChoices)}
                  value={item.extraEnhancementId}
                  onChange={(enhancementId) => {
                    onAction({ type: 'select-extra-enhancement', equipmentSlotId, enhancementId })
                  }}
                  clearable
                  searchable
                  disabled={!extraEnabled}
                />
                <EffectDetails effects={extraEffects} />
              </Stack>
            </SimpleGrid>

            <Stack gap='sm'>
              <Stack gap={4}>
                <Title order={3} size='h4'>
                  Augment slots
                </Title>
                <Text c='dimmed' size='sm'>
                  Add each eligible slot color once, then choose a compatible augment.
                </Text>
              </Stack>

              <Select
                label={`Add an augment slot to ${label}`}
                placeholder={
                  availableAugmentSlotTypes.length > 0
                    ? 'Choose a slot color'
                    : 'All eligible slot colors have been added'
                }
                data={availableAugmentSlotTypes.map(({ id, displayName }) => ({ value: id, label: displayName }))}
                value={null}
                onChange={(augmentSlotTypeId) => {
                  if (augmentSlotTypeId !== null) {
                    onAction({ type: 'add-augment-slot', equipmentSlotId, augmentSlotTypeId })
                  }
                }}
                disabled={availableAugmentSlotTypes.length === 0}
                searchable
                w={{ base: '100%', sm: 320 }}
              />

              {augmentSlotEditors.length === 0 ? (
                <Text c='dimmed' size='sm' role='status'>
                  No augment slots have been added for {label}.
                </Text>
              ) : null}

              {augmentSlotEditors.map(
                ({
                  augmentSlot,
                  augmentSlotType,
                  minimumItemLevel,
                  effectNames,
                  effects,
                  options,
                  selectedAugmentIsValid
                }) => {
                  const slotLabel = `${augmentSlotType.displayName} augment slot`

                  return (
                    <Paper key={augmentSlot.id} withBorder p='sm' data-testid={`augment-slot-editor-${augmentSlot.id}`}>
                      <Stack gap='sm'>
                        <Group justify='space-between' align='flex-start' wrap='wrap' gap='xs'>
                          <Stack gap={2}>
                            <Title order={4} size='h5'>
                              {slotLabel}
                            </Title>
                            <Text c='dimmed' size='xs'>
                              This slot requires minimum level {minimumItemLevel}. The effective minimum level is{' '}
                              {effectiveMinimumLevel}.
                            </Text>
                          </Stack>
                          <Button
                            color='red'
                            variant='subtle'
                            size='xs'
                            aria-label={`Remove ${slotLabel} from ${label}`}
                            onClick={() => {
                              onAction({ type: 'remove-augment-slot', equipmentSlotId, augmentSlotId: augmentSlot.id })
                            }}
                          >
                            Remove slot
                          </Button>
                        </Group>

                        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing='sm'>
                          <Stack gap='xs'>
                            <MultiSelect
                              label={`Filter effects for ${slotLabel} on ${label}`}
                              placeholder='Filter by effects'
                              data={effectNames}
                              value={augmentSlot.selectedEffectNames}
                              onChange={(effectNames) => {
                                onAction({
                                  type: 'set-augment-filters',
                                  equipmentSlotId,
                                  augmentSlotId: augmentSlot.id,
                                  effectNames
                                })
                              }}
                              searchable
                              clearable
                              nothingFoundMessage='No compatible effects found.'
                            />
                            <Radio.Group
                              label={`Filter mode for ${slotLabel} on ${label}`}
                              value={augmentSlot.filterMode}
                              onChange={(filterMode) => {
                                onAction({
                                  type: 'set-augment-filter-mode',
                                  equipmentSlotId,
                                  augmentSlotId: augmentSlot.id,
                                  filterMode
                                })
                              }}
                            >
                              <Group gap='md' mt={4}>
                                <Radio value='or' label='Match any effect' />
                                <Radio value='and' label='Match all effects' />
                              </Group>
                            </Radio.Group>
                          </Stack>

                          <Stack gap='xs'>
                            <AugmentSelect
                              label={`Augment for ${slotLabel} on ${label}`}
                              slotType={augmentSlotType.displayName}
                              options={options}
                              value={selectedAugmentIsValid ? augmentSlot.augmentId : null}
                              onChange={(augmentId) => {
                                onAction(
                                  augmentId === null
                                    ? { type: 'clear-augment', equipmentSlotId, augmentSlotId: augmentSlot.id }
                                    : {
                                        type: 'select-augment',
                                        equipmentSlotId,
                                        augmentSlotId: augmentSlot.id,
                                        augmentId
                                      }
                                )
                              }}
                              nothingFoundMessage='No compatible augments match these filters and minimum level.'
                            />
                            <EffectDetails effects={effects} />
                            <Button
                              variant='subtle'
                              size='xs'
                              w='fit-content'
                              disabled={augmentSlot.augmentId === null}
                              aria-label={`Clear augment for ${slotLabel} on ${label}`}
                              onClick={() => {
                                onAction({ type: 'clear-augment', equipmentSlotId, augmentSlotId: augmentSlot.id })
                              }}
                            >
                              Clear selected augment
                            </Button>
                          </Stack>
                        </SimpleGrid>
                      </Stack>
                    </Paper>
                  )
                }
              )}
            </Stack>
          </Stack>
        ) : null}
      </Stack>
    </Paper>
  )
}

export { PlannedItemEditor }
export default PlannedItemEditor
