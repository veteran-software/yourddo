import { useMemo, useState } from 'react'
import AugmentPicker from '../../../shared/augments/AugmentPicker'
import { useTroveInventory } from '../troveContext'
import { Badge, Button, Checkbox, Group, Stack, Text } from '@mantine/core'
import { IconArrowBackUp, IconArrowsExchange } from '@tabler/icons-react'
import { getColorAugmentType, normaliseAugmentSlotType, augmentColors } from '../../../shared/augments/compatibility'
import { gearPlannerAugmentIdentity, isCompatibleGearPlannerAugment } from '../augments'
import { canExchangeAugments, loadoutSockets, type LoadoutSocket } from '../augmentSockets'
import { slotOwner } from '../character'
import AugmentSlotSelector from '../components/AugmentSlotSelector'
import { conflictEligibleEffectSources, resolveEffectConflicts, type GearPlannerEffectSource } from '../effects'
import type { GearPlannerAugment, GearPlannerAugmentSlot } from '../gearPlanner.types'
import type { GearPlannerSetup } from '../setups'
import css from './AugmentsTool.module.css'

const keyOf = (s: LoadoutSocket) => JSON.stringify([s.item.id, s.index])
const typeOf = (s: LoadoutSocket) =>
  getColorAugmentType(s.slot.augmentType) ?? normaliseAugmentSlotType(s.slot.augmentType)
const socketName = (s: LoadoutSocket) => s.item.source.name + ' · Socket ' + String(s.index + 1)

export default function AugmentsTool({
  setup,
  slots,
  augments,
  effects,
  onChange,
  onExchange,
  openSet
}: {
  setup: GearPlannerSetup
  slots: Readonly<Record<string, readonly GearPlannerAugmentSlot[]>>
  augments: readonly GearPlannerAugment[]
  effects: readonly GearPlannerEffectSource[]
  onChange: (socket: LoadoutSocket, augment: GearPlannerAugment | null) => void
  onExchange: (from: LoadoutSocket, to: LoadoutSocket) => void
  openSet: (name: string) => void
}) {
  const sockets = useMemo(() => loadoutSockets(setup, slots), [setup, slots])
  const [emptyOnly, setEmptyOnly] = useState(false)
  const [edit, setEdit] = useState('')
  const [moving, setMoving] = useState<LoadoutSocket | null>(null)
  const [lookup, setLookup] = useState<string | null>(null)
  const [last, setLast] = useState<{ from: LoadoutSocket; to: LoadoutSocket } | null>(null)
  const [message, setMessage] = useState('')
  const locate = (s: LoadoutSocket) => sockets.find((candidate) => keyOf(candidate) === keyOf(s))
  const origin = moving && locate(moving)
  const source = origin && origin.augment === moving?.augment ? origin : null
  const previousFrom = last && locate(last.from),
    previousTo = last && locate(last.to)
  const undoable =
    last &&
    previousFrom &&
    previousTo &&
    previousFrom.augment === last.to.augment &&
    previousTo.augment === last.from.augment &&
    canExchangeAugments(previousTo, previousFrom)
  const catalog = useMemo(() => new Map(augments.map((a) => [gearPlannerAugmentIdentity(a), a])), [augments])
  const { inventory, ownedOnly, setOwnedOnly } = useTroveInventory()
  const options = useMemo(
    () =>
      [...catalog]
        .flatMap(([value, a]) => {
          const hosts = sockets.filter((s) => !s.augment && isCompatibleGearPlannerAugment(s.slot, a))
          return hosts.length
            ? [
                {
                  value,
                  label: a.name,
                  augmentType: normaliseAugmentSlotType(a.augmentType),
                  minimumLevel: a.minLevel,
                  aboveLevel: hosts.every(
                    (s) => a.minLevel > (setup.essenceCrafting[s.item.id]?.minimumLevel ?? s.item.minimumLevel)
                  )
                }
              ]
            : []
        })
        .sort((a, b) => a.label.localeCompare(b.label)),
    [catalog, sockets, setup.essenceCrafting]
  )
  const wanted = lookup ? catalog.get(lookup) : undefined
  const visible = sockets.filter((s) =>
    source
      ? canExchangeAugments(source, s)
      : wanted
        ? !s.augment && isCompatibleGearPlannerAugment(s.slot, wanted)
        : !emptyOnly || !s.augment
  )
  const empty = sockets.filter((s) => !s.augment).length
  const hostLevel = (s: LoadoutSocket) => setup.essenceCrafting[s.item.id]?.minimumLevel ?? s.item.minimumLevel
  const edited = sockets.find((s) => keyOf(s) === edit)
  const owner = edited && slotOwner(edited.item.slot)
  const conflictSources = useMemo(
    () => conflictEligibleEffectSources(effects.filter((e) => e.slot && slotOwner(e.slot) === owner)),
    [effects, owner]
  )
  const conflicts = useMemo(() => resolveEffectConflicts(conflictSources), [conflictSources])
  if (!sockets.length)
    return (
      <Stack p='md'>
        <Text size='sm'>Equip an item with an augment socket to manage this loadout.</Text>
      </Stack>
    )
  return (
    <Stack p='md' gap='md' className={css.tool}>
      <header>
        <Text size='xs' c='dimmed'>
          {setup.name}
        </Text>
        <strong>
          {sockets.length} {sockets.length === 1 ? 'socket' : 'sockets'}
        </strong>
        <span> · {empty} empty</span>
      </header>
      {source ? (
        <div className={css.move}>
          <strong>Move {source.augment?.name}</strong>
          <small>From {socketName(source)}</small>
          <Button
            variant='subtle'
            size='compact-xs'
            onClick={() => {
              setMoving(null)
            }}
          >
            Cancel move
          </Button>
        </div>
      ) : (
        <Stack gap='xs'>
          <AugmentPicker
            label='Find a socket for'
            placeholder='Search augments'
            colors={[...new Set(options.map((o) => o.augmentType))]}
            options={options}
            levelFilter
            value={lookup}
            inventory={inventory}
            ownedOnly={ownedOnly}
            onOwnedChange={setOwnedOnly}
            onChange={(v) => {
              setLookup(v)
              setEdit('')
            }}
          />
          {!wanted && (
            <Checkbox
              label='Empty sockets only'
              size='xs'
              checked={emptyOnly}
              onChange={(e) => {
                setEmptyOnly(e.currentTarget.checked)
                setEdit('')
              }}
            />
          )}
        </Stack>
      )}
      {(message || undoable) && (
        <Group gap='xs' role='status'>
          <Text size='xs'>{message}</Text>
          {undoable && (
            <Button
              variant='light'
              size='compact-xs'
              leftSection={<IconArrowBackUp size={14} />}
              onClick={() => {
                onExchange(previousTo, previousFrom)
                setLast(null)
                setMoving(null)
                setMessage('Last transfer undone.')
              }}
            >
              Undo
            </Button>
          )}
        </Group>
      )}
      {!visible.length && (
        <Text c='dimmed' size='sm'>
          {source
            ? 'No compatible destinations for this augment.'
            : wanted
              ? 'No compatible empty sockets in this loadout.'
              : 'All sockets are filled.'}
        </Text>
      )}
      {[false, true].map((filled) => {
        const rows = visible.filter((s) => Boolean(s.augment) === filled)
        if (!rows.length) return null
        return (
          <section key={String(filled)}>
            <h3>
              {filled
                ? source
                  ? 'Compatible swaps'
                  : 'Filled sockets'
                : source || wanted
                  ? 'Compatible empty sockets'
                  : 'Empty sockets'}
            </h3>
            {[...Map.groupBy(rows, typeOf)]
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([type, group]) => (
                <div className={css.group} key={type}>
                  <h4>
                    <Badge variant='dot' color={augmentColors[type] ?? 'gray'} size='sm'>
                      {type}
                    </Badge>
                    <span>{group.length}</span>
                  </h4>
                  {group.map((s) => {
                    const id = keyOf(s)
                    const incoming = source?.augment ?? wanted
                    const over = incoming && incoming.minLevel > hostLevel(s)
                    const reverseOver = source && s.augment && s.augment.minLevel > hostLevel(source)
                    return (
                      <div key={id} className={css.row}>
                        <small>
                          {s.item.slot} · Socket {s.index + 1}
                        </small>
                        <strong>{s.item.source.name}</strong>
                        {s.augment && <Text size='sm'>{s.augment.name}</Text>}
                        {over && (
                          <Text size='xs' c='orange'>
                            {incoming.name} exceeds item ML {hostLevel(s)}
                          </Text>
                        )}
                        {reverseOver && (
                          <Text size='xs' c='orange'>
                            {s.augment?.name} exceeds source item ML {hostLevel(source)}
                          </Text>
                        )}
                        <Group gap='xs'>
                          {source ? (
                            <Button
                              size='compact-xs'
                              variant='light'
                              onClick={() => {
                                onExchange(source, s)
                                setLast({ from: source, to: s })
                                setMoving(null)
                                setMessage((s.augment ? 'Swapped with ' : 'Moved to ') + socketName(s) + '.')
                              }}
                            >
                              {filled ? 'Swap' : 'Move here'}
                            </Button>
                          ) : wanted ? (
                            <Button
                              variant='light'
                              size='compact-xs'
                              onClick={() => {
                                onChange(s, wanted)
                                setLookup(null)
                                setMessage('Slotted ' + wanted.name + ' in ' + socketName(s) + '.')
                              }}
                            >
                              Slot here
                            </Button>
                          ) : (
                            <>
                              <Button
                                size='compact-xs'
                                variant='light'
                                aria-expanded={id === edit}
                                onClick={() => {
                                  setEdit(id === edit ? '' : id)
                                }}
                              >
                                {id === edit ? 'Close' : filled ? 'Edit' : 'Choose augment'}
                              </Button>
                              {filled && (
                                <Button
                                  size='compact-xs'
                                  variant='subtle'
                                  leftSection={<IconArrowsExchange size={14} />}
                                  onClick={() => {
                                    setMoving(s)
                                    setEdit('')
                                    setMessage('')
                                  }}
                                >
                                  Move or swap
                                </Button>
                              )}
                            </>
                          )}
                        </Group>
                        {id === edit && !source && !wanted && (
                          <AugmentSlotSelector
                            openSet={openSet}
                            item={s.item}
                            hostLevel={hostLevel(s)}
                            slotIndex={s.index}
                            augmentSlot={s.slot}
                            augments={augments}
                            conflicts={conflicts}
                            conflictSources={conflictSources}
                            selected={s.augment}
                            onChange={(a) => {
                              onChange(s, a)
                              setEdit('')
                              setMessage(
                                a
                                  ? 'Slotted ' + a.name + ' in ' + socketName(s) + '.'
                                  : 'Cleared ' + socketName(s) + '.'
                              )
                            }}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
          </section>
        )
      })}
    </Stack>
  )
}
