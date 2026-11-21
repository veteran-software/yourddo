import AugmentPicker from '../../../shared/augments/AugmentPicker'
import EquippedEffect from './EquippedEffect'
import ItemSetLinks from './ItemSetLinks'
import { useTroveInventory } from '../troveContext'
import { TroveOwnership, OwnedFilter } from './TroveInventory'
import { ownsTroveItem } from '../trove'
import { Badge, Button, Group, Select, Stack, Switch, Text } from '@mantine/core'
import { useMemo, useState } from 'react'
import {
  hasColorPicker,
  getCompatibleAugmentTypes,
  normaliseAugmentSlotType
} from '../../../shared/augments/compatibility.ts'
import {
  gearPlannerAugmentIdentity,
  getCompatibleGearPlannerAugments,
  isCompatibleGearPlannerAugment
} from '../augments.ts'
import {
  augmentEffectId,
  type GearPlannerEffectConflictResolution,
  normalizeEffectName,
  previewPotentialEffectConflict,
  type GearPlannerEffectSource
} from '../effects.ts'
import type { GearPlannerAugment, GearPlannerAugmentSlot, GearPlannerItem } from '../gearPlanner.types.ts'

const effectLabel = ({ name, modifier, bonus }: GearPlannerAugment['effectsAdded'][number]): string =>
  `${name}${modifier == null ? '' : ' ' + String(modifier)}${bonus == null || bonus === '' ? '' : ' (' + String(bonus) + ')'}`

const comparisonColors = { Upgrade: 'teal', Redundant: 'gray', Overpowered: 'orange' } as const

interface AugmentSlotSelectorProps {
  openSet: (name: string) => void
  item: GearPlannerItem
  hostLevel?: number
  slotIndex: number
  augmentSlot: GearPlannerAugmentSlot
  augments: readonly GearPlannerAugment[]
  conflicts: GearPlannerEffectConflictResolution
  conflictSources: readonly GearPlannerEffectSource[]
  selected: GearPlannerAugment | null
  onChange: (augment: GearPlannerAugment | null) => void
}

const AugmentSlotSelector = ({
  openSet,
  item,
  hostLevel = item.minimumLevel,
  slotIndex,
  augmentSlot,
  augments,
  conflicts,
  conflictSources,
  selected,
  onChange
}: AugmentSlotSelectorProps) => {
  const { inventory, ownedOnly, setOwnedOnly } = useTroveInventory()
  const [showAll, setShowAll] = useState(false)
  const compatible = useMemo(() => getCompatibleGearPlannerAugments(augmentSlot, augments), [augmentSlot, augments])
  const sourcesByEffect = useMemo(
    () =>
      Map.groupBy(
        conflictSources.filter((source) => source.itemId !== item.id || source.augmentSlotIndex !== slotIndex),
        (source) => source.normalizedName
      ),
    [conflictSources, item.id, slotIndex]
  )
  const selectedId = selected ? gearPlannerAugmentIdentity(selected) : null
  const visible = useMemo(
    () =>
      compatible.filter(
        (augment) =>
          gearPlannerAugmentIdentity(augment) === selectedId ||
          ((showAll || augment.minLevel <= hostLevel) && (!ownedOnly || ownsTroveItem(inventory, augment.name)))
      ),
    [compatible, hostLevel, selectedId, showAll, inventory, ownedOnly]
  )
  const selectData = useMemo(
    () =>
      getCompatibleAugmentTypes(augmentSlot.augmentType).flatMap((augmentType) => {
        const options = visible
          .filter((augment) => normaliseAugmentSlotType(augment.augmentType) === normaliseAugmentSlotType(augmentType))
          .map((augment) => ({ value: gearPlannerAugmentIdentity(augment), label: augment.name }))
        return options.length > 0 ? [{ group: `${augmentType} augments`, items: options }] : []
      }),
    [augmentSlot.augmentType, visible]
  )
  const selectedOverLevel = selected !== null && selected.minLevel > hostLevel
  const label = augmentSlot.name ?? augmentSlot.augmentType

  const byId = useMemo(() => new Map(compatible.map((a) => [gearPlannerAugmentIdentity(a), a])), [compatible])
  const renderAugment = (augment: GearPlannerAugment) => {
    const comparisons = new Map<keyof typeof comparisonColors, string[]>()
    for (const effect of augment.effectsAdded) {
      const sources = sourcesByEffect.get(normalizeEffectName(effect.name))
      if (!sources) continue
      const preview = previewPotentialEffectConflict(effect, sources, item.id)
      if (!preview.isConflict) continue
      const status = preview.isUpgrade ? 'Upgrade' : preview.isOverpowered ? 'Overpowered' : 'Redundant'
      const detail =
        effectLabel(effect) + (preview.currentModifier != null ? ` · equipped ${String(preview.currentModifier)}` : '')
      const group = comparisons.get(status)
      if (group) group.push(detail)
      else comparisons.set(status, [detail])
    }
    return (
      <Stack gap={2} w='100%'>
        <Group justify='space-between' wrap='nowrap'>
          <Text size='sm' style={{ overflowWrap: 'anywhere' }}>
            {augment.name}
          </Text>
          <Badge component='span' color='gray' size='sm' variant='light'>
            ML {String(augment.minLevel)}
          </Badge>
        </Group>
        <Text c='dimmed' size='xs'>
          {augment.augmentType}
          {augment.effectsAdded[0] && !comparisons.size ? ` · ${effectLabel(augment.effectsAdded[0])}` : ''}
          {augment.effectsAdded.length > 1 ? ` · ${String(augment.effectsAdded.length)} effects` : ''}
        </Text>
        {augment.minLevel > hostLevel && (
          <Text size='xs' c='orange' fw={600}>
            Above item ML {hostLevel}
          </Text>
        )}
        {[...comparisons].map(([status, details]) => (
          <Group key={status} gap={6} align='baseline' wrap='wrap' title={details.join('\n')}>
            <Badge size='xs' variant='light' color={comparisonColors[status]}>
              {status}
            </Badge>
            <Text size='xs' style={{ overflowWrap: 'anywhere' }}>
              {details[0]}
              {details.length > 1 ? ` (+${String(details.length - 1)} more)` : ''}
            </Text>
          </Group>
        ))}
        <TroveOwnership name={augment.name} inOption />
        {augment.setBonus?.length ? (
          <Text c='dimmed' size='xs'>
            Sets: {augment.setBonus.map(({ name }) => name).join(', ')}
          </Text>
        ) : null}
      </Stack>
    )
  }
  return (
    <Stack gap={4} data-testid={`augment-slot-${item.id}-${String(slotIndex)}`}>
      {hasColorPicker(augmentSlot.augmentType) ? (
        <AugmentPicker
          placeholder='Select augment'
          label={label}
          description={`Augment slot ${String(slotIndex + 1)} · ${augmentSlot.augmentType}`}
          colors={getCompatibleAugmentTypes(augmentSlot.augmentType)}
          options={compatible.map((a) => ({
            value: gearPlannerAugmentIdentity(a),
            label: a.name,
            augmentType: normaliseAugmentSlotType(a.augmentType),
            minimumLevel: a.minLevel
          }))}
          value={selectedId}
          inventory={inventory}
          ownedOnly={ownedOnly}
          onOwnedChange={setOwnedOnly}
          hostLevel={hostLevel}
          onChange={(v) => {
            onChange(v === null ? null : (byId.get(v) ?? null))
          }}
          renderOption={(o) => {
            const a = byId.get(o.value)
            return a ? renderAugment(a) : o.label
          }}
        />
      ) : (
        <>
          <Select
            size={'xs'}
            p={0}
            label={label}
            description={`Augment slot ${String(slotIndex + 1)} · ${augmentSlot.augmentType}`}
            placeholder='Select augment'
            data={selectData}
            value={selectedId}
            searchable
            maxDropdownHeight={300}
            nothingFoundMessage='No compatible augments found.'
            onChange={(value) => {
              if (value === null) {
                onChange(null)
                return
              }
              const augment = byId.get(value)
              if (augment && isCompatibleGearPlannerAugment(augmentSlot, augment)) onChange(augment)
            }}
            renderOption={({ option }) => {
              const a = byId.get(option.value)
              return a ? renderAugment(a) : option.label
            }}
          />
          <OwnedFilter />
          <Switch
            checked={showAll}
            label='Show all levels'
            size='xs'
            onChange={(event) => {
              setShowAll(event.currentTarget.checked)
            }}
          />
        </>
      )}
      {selected ? (
        <Stack gap={2} pl='xs'>
          <Group gap='xs'>
            <Text fw={600} size='xs'>
              {selected.name}
            </Text>
            <Badge size='xs' variant='light'>
              {selected.augmentType}
            </Badge>
            {selectedOverLevel ? (
              <Badge color='red' size='xs'>
                Over item ML
              </Badge>
            ) : null}
          </Group>
          <TroveOwnership name={selected.name} />
          {selected.effectsAdded.map((effect, effectIndex) => (
            <Text key={`${effect.name}-${String(effectIndex)}`} size='xs'>
              <EquippedEffect
                id={augmentEffectId(item.id, slotIndex, effectIndex)}
                conflicts={conflicts}
                label={effectLabel(effect)}
              />
            </Text>
          ))}
          <ItemSetLinks names={selected.setBonus?.map(({ name }) => name) ?? []} onOpen={openSet} />
          <Button
            color='red'
            size='compact-xs'
            variant='subtle'
            w='fit-content'
            onClick={() => {
              onChange(null)
            }}
          >
            Clear augment
          </Button>
        </Stack>
      ) : null}
    </Stack>
  )
}

export default AugmentSlotSelector
