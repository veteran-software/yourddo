import { Alert, Badge, Button, Group, Paper, Select, SimpleGrid, Stack, Switch, Text, Title } from '@mantine/core'
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
  const extraEnabled = hasCannithMarkExtraAffixPermission(data, item.hasCannithMark)
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
            </SimpleGrid>
          </Stack>
        ) : null}
      </Stack>
    </Paper>
  )
}

export default PlannedItemEditor
