import { Alert, Badge, Paper, Select, SimpleGrid, Stack, Switch, Text, Title } from '@mantine/core'
import { getAvailableEnhancementChoices, hasCannithMarkExtraAffixPermission } from './enhancementEligibility.ts'
import type { EssenceCraftingData, EssenceEnhancement } from './essenceCrafting.types.ts'
import type { PlannedItem } from './plannerState.ts'
import type { EssencePlanAction } from './plannerTransitions.ts'

interface PlannedItemEditorProps {
  data: EssenceCraftingData
  item: PlannedItem
  masterMinimumLevel: number
  onAction: (action: EssencePlanAction) => void
}

const toSelectData = (enhancements: readonly EssenceEnhancement[]) =>
  enhancements.map(({ id, displayName }) => ({ value: id, label: displayName }))

const PlannedItemEditor = ({ data, item, masterMinimumLevel, onAction }: PlannedItemEditorProps) => {
  const effectiveMinimumLevel = item.minimumLevelOverride ?? masterMinimumLevel
  const prefixChoices = getAvailableEnhancementChoices(data, 'main-hand', 'prefix', effectiveMinimumLevel)
  const suffixChoices = getAvailableEnhancementChoices(data, 'main-hand', 'suffix', effectiveMinimumLevel)
  const extraChoices = getAvailableEnhancementChoices(data, 'main-hand', 'extra', effectiveMinimumLevel)
  const extraEnabled = hasCannithMarkExtraAffixPermission(data, item.hasCannithMark)

  return (
    <Paper withBorder p={{ base: 'md', sm: 'lg' }}>
      <Stack gap='md'>
        <Stack gap={4}>
          <Title order={2} size='h3'>
            Main Hand
          </Title>
          <Badge variant='light' w='fit-content'>
            Effective minimum level: {effectiveMinimumLevel}
          </Badge>
        </Stack>

        {prefixChoices.length === 0 && suffixChoices.length === 0 && extraChoices.length === 0 ? (
          <Alert color='yellow' title='No affixes are available'>
            The loaded data has no Main Hand affixes for minimum level {effectiveMinimumLevel}.
          </Alert>
        ) : null}

        <SimpleGrid cols={{ base: 1, md: 3 }} spacing='md'>
          <Select
            label='Prefix'
            placeholder='Choose a prefix'
            data={toSelectData(prefixChoices)}
            value={item.prefixEnhancementId}
            onChange={(enhancementId) => {
              onAction({ type: 'select-prefix-enhancement', equipmentSlotId: 'main-hand', enhancementId })
            }}
            clearable
            searchable
          />

          <Select
            label='Suffix'
            placeholder='Choose a suffix'
            data={toSelectData(suffixChoices)}
            value={item.suffixEnhancementId}
            onChange={(enhancementId) => {
              onAction({ type: 'select-suffix-enhancement', equipmentSlotId: 'main-hand', enhancementId })
            }}
            clearable
            searchable
          />

          <Stack gap='xs' justify='flex-end'>
            <Switch
              label='Mark of House Cannith'
              checked={item.hasCannithMark}
              onChange={(event) => {
                onAction({
                  type: 'set-cannith-mark',
                  equipmentSlotId: 'main-hand',
                  enabled: event.currentTarget.checked
                })
              }}
            />
            <Text c='dimmed' size='xs'>
              A Mark enables one extra affix.
            </Text>
          </Stack>

          <Select
            label='Extra'
            placeholder={extraEnabled ? 'Choose an extra affix' : 'Enable the Mark to choose an extra affix'}
            data={toSelectData(extraChoices)}
            value={item.extraEnhancementId}
            onChange={(enhancementId) => {
              onAction({ type: 'select-extra-enhancement', equipmentSlotId: 'main-hand', enhancementId })
            }}
            clearable
            searchable
            disabled={!extraEnabled}
          />
        </SimpleGrid>
      </Stack>
    </Paper>
  )
}

export default PlannedItemEditor
