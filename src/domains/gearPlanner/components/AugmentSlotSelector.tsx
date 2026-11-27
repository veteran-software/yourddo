import KnownDiscrepancies from './KnownDiscrepancies'
import ScopedAugmentDetails from '../../../shared/augments/ScopedAugmentDetails'
import AugmentPicker from '../../../shared/augments/AugmentPicker'
import EquippedEffect from './EquippedEffect'
import ItemSetLinks from './ItemSetLinks'
import { recommendSocketAugment } from '../augmentRecommendations'
import type { GearPlannerSetup } from '../setups'
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
  enchantmentNames?: readonly string[]
  augments: readonly GearPlannerAugment[]
  conflicts: GearPlannerEffectConflictResolution
  conflictSources: readonly GearPlannerEffectSource[]
  setup?: Pick<GearPlannerSetup, 'character' | 'equipment' | 'maximumLevel'>
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
  enchantmentNames,
  conflicts,
  conflictSources,
  setup,
  selected,
  onChange
}: AugmentSlotSelectorProps) => {
  const { inventory, ownedOnly, setOwnedOnly } = useTroveInventory()
  const [showAll, setShowAll] = useState(false)
  const compatible = useMemo(() => getCompatibleGearPlannerAugments(augmentSlot, augments), [augmentSlot, augments])
  const showType = useMemo(
    () => new Set(compatible.map(({ augmentType }) => normaliseAugmentSlotType(augmentType))).size > 1,
    [compatible]
  )
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
      [...Map.groupBy(visible, (a) => a.augmentType)].map(([type, entries]) => ({
        group: type + ' augments',
        items: entries.map((a) => ({ value: gearPlannerAugmentIdentity(a), label: a.name }))
      })),
    [visible]
  )
  const selectedOverLevel = selected !== null && selected.minLevel > hostLevel
  const socketLabel = augmentSlot.name ?? augmentSlot.augmentType

  const byId = useMemo(() => new Map(compatible.map((a) => [gearPlannerAugmentIdentity(a), a])), [compatible])
  function renderEffect(effect: GearPlannerAugment['effectsAdded'][number], label: string) {
    const sources = sourcesByEffect.get(normalizeEffectName(effect.name))
    if (!sources || effect.displayOnly) return label
    const preview = previewPotentialEffectConflict(effect, sources)
    if (!preview.isConflict) return label
    const lesser = preview.isOverpowered ? 'Overpowered' : 'Redundant'
    const status = preview.isUpgrade ? 'Upgrade' : lesser
    const detail = label + (preview.currentModifier != null ? ` · equipped ${String(preview.currentModifier)}` : '')
    return (
      <span title={detail}>
        <span>{detail}</span>
        <Badge component='span' ml={6} size='xs' variant='light' color={comparisonColors[status]}>
          {status}
        </Badge>
      </span>
    )
  }
  const renderAugment = (augment: GearPlannerAugment) => {
    const overLevel = augment.minLevel > hostLevel
    return (
      <Stack gap={2} w='100%'>
        <Group justify='space-between' wrap='nowrap'>
          <Text size='sm' style={{ overflowWrap: 'anywhere' }}>
            {augment.name}
          </Text>
          <Badge component='span' color={overLevel ? 'orange' : 'gray'} size='sm' variant='light' flex='0 0 auto'>
            ML {String(augment.minLevel)}
            {overLevel && (
              <>
                {' · '}
                <span>Above item ML {hostLevel}</span>
              </>
            )}
          </Badge>
        </Group>
        {showType && (
          <Text c='dimmed' size='xs'>
            {augment.augmentType}
          </Text>
        )}
        {augment.presentation ? (
          <ScopedAugmentDetails
            augmentName={augment.name}
            compact
            presentation={augment.presentation}
            fallbackDescription={augment.fallbackDescription}
            renderRow={renderEffect}
          />
        ) : (
          [...new Map(augment.effectsAdded.map((effect) => [effectLabel(effect), effect] as const))].map(
            ([label, effect]) => (
              <Text key={label} size='xs'>
                {renderEffect(effect, label)}
              </Text>
            )
          )
        )}
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
          label={socketLabel}
          enchantmentNames={enchantmentNames}
          colors={getCompatibleAugmentTypes(augmentSlot.augmentType)}
          options={compatible.map((a) => ({
            value: gearPlannerAugmentIdentity(a),
            label: a.name,
            augmentType: normaliseAugmentSlotType(a.augmentType),
            searchLabels: a.searchLabels,
            minimumLevel: a.minLevel
          }))}
          value={selectedId}
          inventory={inventory}
          ownedOnly={ownedOnly}
          onOwnedChange={setOwnedOnly}
          hostLevel={hostLevel}
          recommend={
            setup &&
            ((options) => {
              const maxLevel = Math.min(hostLevel, setup.maximumLevel)
              const candidates = options.flatMap(({ value }) => {
                const augment = byId.get(value)
                return augment && augment.minLevel <= maxLevel ? [augment] : []
              })
              return recommendSocketAugment(candidates, item, slotIndex, setup, conflictSources, selected)
            })
          }
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
            label={socketLabel}
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
          {selectedOverLevel && (
            <Badge color='red' size='xs' w='fit-content'>
              Over item ML
            </Badge>
          )}
          <TroveOwnership name={selected.name} />
          <KnownDiscrepancies notes={selected.discrepancyNotes} />
          {selected.presentation ? (
            <ScopedAugmentDetails
              augmentName={selected.name}
              presentation={selected.presentation}
              fallbackDescription={selected.fallbackDescription}
              renderRow={(row, rowLabel) => {
                const index = selected.effectsAdded.indexOf(row)
                return index < 0 ? (
                  rowLabel
                ) : (
                  <EquippedEffect
                    id={augmentEffectId(item.id, slotIndex, index)}
                    conflicts={conflicts}
                    label={rowLabel}
                  />
                )
              }}
            />
          ) : (
            selected.effectsAdded.map((effect, effectIndex) => (
              <Stack key={`${effect.name}-${String(effectIndex)}`} gap={0}>
                <Text size='xs'>
                  <EquippedEffect
                    id={augmentEffectId(item.id, slotIndex, effectIndex)}
                    conflicts={conflicts}
                    label={effectLabel(effect)}
                  />
                </Text>
                {effect.modifier == null && effect.notes && effect.notes !== effect.name && (
                  <Text size='xs' c='dimmed'>
                    {effect.notes}
                  </Text>
                )}
              </Stack>
            ))
          )}
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
