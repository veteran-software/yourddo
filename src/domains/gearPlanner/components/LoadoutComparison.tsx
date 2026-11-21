import { useMemo, useState } from 'react'
import { Button, Checkbox, Group, Modal, NativeSelect, SegmentedControl, Stack, Text } from '@mantine/core'
import { IconArrowRight, IconCopy } from '@tabler/icons-react'
import type { EssenceCraftingData } from '../../essenceCrafting/essenceCrafting.types'
import { enabledOwners, type GearOwner } from '../character'
import type { GearPlannerData } from '../gearPlanner.types'
import { comparisonRows, loadoutSnapshot } from '../loadoutComparison'
import type { GearPlannerSetup } from '../setups'
import css from './LoadoutComparison.module.css'

export default function LoadoutComparison({
  setups,
  active,
  data,
  essence,
  onClose,
  initialOwner = 'Character',
  duplicate
}: Readonly<{
  setups: readonly GearPlannerSetup[]
  active: GearPlannerSetup
  data: GearPlannerData
  essence: EssenceCraftingData
  onClose: () => void
  initialOwner?: GearOwner
  duplicate?: () => void
}>) {
  const [from, setFrom] = useState(setups.find((s) => s.id !== active.id)?.id ?? active.id)
  const [to, setTo] = useState(active.id)
  const [owner, setOwner] = useState<GearOwner>(initialOwner)
  const [tab, setTab] = useState<'Stats' | 'Sets' | 'Gear'>('Stats')
  const [unchanged, setUnchanged] = useState(false)
  const a = setups.find((s) => s.id === from) ?? active,
    b = setups.find((s) => s.id === to) ?? active
  const owners = [...new Set([...enabledOwners(a.character.classes), ...enabledOwners(b.character.classes)])]
  const viewOwner = owners.includes(owner) ? owner : 'Character'
  const left = useMemo(() => loadoutSnapshot(a, viewOwner, data, essence), [a, viewOwner, data, essence])
  const right = useMemo(() => loadoutSnapshot(b, viewOwner, data, essence), [b, viewOwner, data, essence])
  const sections = ['Stats', 'Sets', 'Gear'] as const
  const rows = useMemo(
    () => ({
      Stats: comparisonRows(left.Stats, right.Stats),
      Sets: comparisonRows(left.Sets, right.Sets),
      Gear: comparisonRows(left.Gear, right.Gear)
    }),
    [left, right]
  )
  const visible = rows[tab].filter((r) => unchanged || r.changed)
  const options = setups.map((s) => ({ value: s.id, label: s.name }))
  return (
    <Modal opened onClose={onClose} title='Compare loadouts' size='52rem' centered>
      {setups.length === 1 && duplicate ? (
        <Stack align='flex-start'>
          <Text>Duplicate {active.name}, change its gear, then compare the two setups here.</Text>
          <Button leftSection={<IconCopy size={16} />} onClick={duplicate}>
            Duplicate setup
          </Button>
        </Stack>
      ) : (
        <Stack gap='md'>
          <div className={css.pair}>
            <NativeSelect
              label='Baseline'
              value={a.id}
              data={options}
              onChange={(e) => {
                const id = e.currentTarget.value
                if (id === to) setTo(from)
                setFrom(id)
              }}
            />
            <IconArrowRight aria-hidden size={18} />
            <NativeSelect
              label='Compare to'
              value={b.id}
              data={options}
              onChange={(e) => {
                const id = e.currentTarget.value
                if (id === from) setFrom(to)
                setTo(id)
              }}
            />
          </div>
          {owners.length > 1 && (
            <NativeSelect
              label='Equipment for'
              value={viewOwner}
              data={owners}
              onChange={(e) => {
                setOwner(e.currentTarget.value as GearOwner)
              }}
            />
          )}
          <Group justify='space-between' gap='xs'>
            <SegmentedControl
              aria-label='Comparison category'
              value={tab}
              onChange={(v) => {
                setTab(v)
              }}
              data={sections.map((s) => ({
                value: s,
                label: s + ' (' + String(rows[s].filter((r) => r.changed).length) + ')'
              }))}
            />
            <Checkbox
              size='xs'
              checked={unchanged}
              onChange={(e) => {
                setUnchanged(e.currentTarget.checked)
              }}
              label='Show unchanged'
            />
          </Group>
          {tab !== 'Gear' && (left.predictsProwessStack || right.predictsProwessStack) && (
            <Text size='sm' c='dimmed'>
              Prowess: Strength on two hosts is modeled as +2 Strength and two set pieces. In-game confirmation is
              pending.
            </Text>
          )}
          {visible.length ? (
            <div className={css.results}>
              <table aria-label={tab + ' comparison'}>
                <thead>
                  <tr>
                    <th>{tab === 'Stats' ? 'Effect' : tab === 'Sets' ? 'Set tier' : 'Equipment'}</th>
                    <th>Baseline</th>
                    <th>Compare to</th>
                    <th>Change</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((r) => (
                    <tr key={r.label}>
                      <th scope='row'>{r.label}</th>
                      <td>{r.before}</td>
                      <td>{r.after}</td>
                      <td>
                        <span data-direction={r.direction}>{r.delta}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={css.empty}>
              {tab === 'Sets' ? 'No active set tiers' : tab === 'Gear' ? 'No equipment' : 'No effective bonuses'}{' '}
              {unchanged ? 'to display' : 'changed'}.
            </div>
          )}
        </Stack>
      )}
    </Modal>
  )
}
