import { ActionIcon, Button, Center, Group, Paper, Select, Stack, Text, Title, UnstyledButton } from '@mantine/core'
import {
  IconArrowLeft,
  IconBandage,
  IconChevronRight,
  IconCircle,
  IconDiamond,
  IconEyeglass,
  IconGripHorizontal,
  IconHandStop,
  IconHelmet,
  IconJacket,
  IconRings,
  IconShield,
  IconShirt,
  IconShoe,
  IconSparkles,
  IconSword,
  IconSwords,
  IconWand
} from '@tabler/icons-react'
import { useRef, useState } from 'react'
import layout from '../../shared/layout/PlannerWorkspace.module.css'
import { EQUIPMENT_SLOTS, type EquipmentSlotId } from './equipment'
import type { EssenceCraftingData } from './essenceCrafting.types'
import PlannedItemEditor from './PlannedItemEditor'
import type { EssencePlanState } from './plannerState'
import type { EssencePlanAction } from './plannerTransitions'

const icons = {
  'main-hand': IconSword,
  'off-hand': IconSwords,
  'rune-arm': IconWand,
  orb: IconCircle,
  armor: IconShirt,
  belt: IconGripHorizontal,
  boots: IconShoe,
  bracers: IconBandage,
  cloak: IconJacket,
  gloves: IconHandStop,
  goggles: IconEyeglass,
  helmet: IconHelmet,
  necklace: IconDiamond,
  'ring-1': IconRings,
  'ring-2': IconRings,
  trinket: IconSparkles,
  shield: IconShield
} satisfies Record<EquipmentSlotId, typeof IconSword>

import { useSlotView } from '../../shared/layout/plannerView'
import { PlannerViewToolbar } from '../../shared/layout/PlannerViewToolbar'
import type { WorkspaceTool } from '../../shared/layout/WorkspaceLayout'

interface Props {
  tools: readonly WorkspaceTool[]
  data: EssenceCraftingData
  plan: EssencePlanState
  onAction: (action: EssencePlanAction) => void
  onRequestDeactivate: (slot: EquipmentSlotId) => void
  onRequestReset: () => void
}

export default function EssencePlanWorkspace({
  data,
  plan,
  onAction,
  onRequestDeactivate,
  onRequestReset,
  tools
}: Readonly<Props>) {
  const [view, setView] = useSlotView('essence')
  const [selected, setSelected] = useState<EquipmentSlotId>()
  const [showDetail, setShowDetail] = useState(false)
  const detailHeading = useRef<HTMLHeadingElement>(null)
  const slotList = useRef<HTMLDivElement>(null)
  const current = selected && plan.itemsBySlotId[selected] ? selected : plan.activeSlotIds[0]
  const item = current && plan.itemsBySlotId[current]
  const { minimum, maximum } = data.rules.supportedItemLevels
  const levels = Array.from({ length: maximum - minimum + 1 }, (_, i) => String(minimum + i))

  function selectSlot(id: EquipmentSlotId) {
    if (view === 'grid') {
      if (plan.itemsBySlotId[id]) onRequestDeactivate(id)
      else onAction({ type: 'activate-equipment-slot', equipmentSlotId: id })
      setSelected(id)
      return
    }
    if (!plan.itemsBySlotId[id]) onAction({ type: 'activate-equipment-slot', equipmentSlotId: id })
    setSelected(id)
    setShowDetail(true)
    requestAnimationFrame(() => detailHeading.current?.focus({ preventScroll: true }))
  }

  return (
    <Paper component='section' aria-label='Essence Crafting workspace' withBorder className={layout.workspace}>
      <Group className={layout.toolbar} justify='space-between' wrap='nowrap'>
        <Group gap='xs' wrap='nowrap'>
          <Text component='label' htmlFor='essence-master-level' size='sm' fw={600}>
            Master minimum level
          </Text>
          <Select
            id='essence-master-level'
            size='xs'
            w='4.6rem'
            data={levels}
            value={String(plan.masterMinimumLevel)}
            onChange={(level) => {
              if (level !== null) onAction({ type: 'set-master-minimum-level', minimumLevel: Number(level) })
            }}
            allowDeselect={false}
          />
        </Group>
        <Button
          variant='subtle'
          color='red'
          size='compact-sm'
          disabled={!plan.activeSlotIds.length}
          onClick={onRequestReset}
        >
          Reset plan
        </Button>
      </Group>
      <PlannerViewToolbar
        tools={tools}
        view={view}
        changeView={(next) => {
          setView(next)
          setShowDetail(false)
        }}
      />
      <div
        className={layout.columns}
        data-crafting-board={view === 'grid' || undefined}
        data-detail={view === 'list' && showDetail && item ? true : undefined}
      >
        <nav className={layout.slots} aria-label='Equipment slots'>
          <Group className={layout.paneHeading} justify='space-between'>
            <Title order={2} size='h4'>
              Equipment slots
            </Title>
            <Text size='xs' c='dimmed'>
              {plan.activeSlotIds.length} / {EQUIPMENT_SLOTS.length} planned
            </Text>
          </Group>
          <div className={layout.slotList} ref={slotList} data-testid='equipment-slot-selector'>
            {EQUIPMENT_SLOTS.map(({ id, label }) => {
              const planned = plan.itemsBySlotId[id]
              const Icon = icons[id]
              const affix =
                planned &&
                data.indexes.enhancementById.get(planned.prefixEnhancementId ?? planned.suffixEnhancementId ?? '')
              return (
                <UnstyledButton
                  key={id}
                  type='button'
                  className={layout.slot}
                  aria-current={current === id ? true : undefined}
                  aria-controls={view === 'grid' ? 'crafting-cards' : 'essence-editor'}
                  aria-pressed={view === 'grid' ? !!planned : undefined}
                  aria-label={`${planned ? (view === 'grid' ? 'Remove' : 'Edit') : 'Plan'} ${label}`}
                  onClick={() => {
                    selectSlot(id)
                  }}
                >
                  <span className={layout.slotIcon} data-equipped={planned ? true : undefined}>
                    <Icon size={19} stroke={1.6} aria-hidden />
                  </span>
                  <Stack gap={0} miw={0} flex={1}>
                    <Text size='sm' fw={600}>
                      {label}
                    </Text>
                    <Text size='xs' c='dimmed' truncate>
                      {planned
                        ? `ML ${String(planned.minimumLevelOverride ?? plan.masterMinimumLevel)} · ${affix?.displayName ?? 'Planned'}`
                        : 'Not planned'}
                    </Text>
                  </Stack>
                  <IconChevronRight size={14} aria-hidden />
                </UnstyledButton>
              )
            })}
          </div>
        </nav>
        {view === 'grid' ? (
          <section className={layout.craftingCards} id='crafting-cards' aria-label='Planned items'>
            {plan.activeSlotIds.length === 0 && (
              <Text c='dimmed' p='md'>
                Select equipment slots to start your crafting plan.
              </Text>
            )}
            {EQUIPMENT_SLOTS.map(({ id }) => {
              const planned = plan.itemsBySlotId[id]
              return (
                planned && (
                  <article key={id} className={layout.craftingCard}>
                    <PlannedItemEditor
                      data={data}
                      equipmentSlotId={id}
                      item={planned}
                      masterMinimumLevel={plan.masterMinimumLevel}
                      collapsed={plan.collapsedSlotIds.includes(id)}
                      onAction={onAction}
                      onRequestDeactivate={onRequestDeactivate}
                      board
                    />
                  </article>
                )
              )
            })}
          </section>
        ) : (
          <section className={layout.detail} id='essence-editor' aria-labelledby='essence-editor-heading'>
            <Group className={layout.paneHeading} wrap='nowrap'>
              <ActionIcon
                className={layout.back}
                variant='subtle'
                aria-label='Back to equipment slots'
                onClick={() => {
                  setShowDetail(false)
                  requestAnimationFrame(() =>
                    slotList.current?.querySelector<HTMLButtonElement>('[aria-current="true"]')?.focus()
                  )
                }}
              >
                <IconArrowLeft size={18} />
              </ActionIcon>
              <Title order={2} size='h4' id='essence-editor-heading' tabIndex={-1} ref={detailHeading}>
                Item configuration
              </Title>
            </Group>
            <div className={layout.detailBody} key={current ?? 'empty'}>
              {item && current ? (
                <PlannedItemEditor
                  data={data}
                  equipmentSlotId={current}
                  item={item}
                  masterMinimumLevel={plan.masterMinimumLevel}
                  collapsed={plan.collapsedSlotIds.includes(current)}
                  onAction={onAction}
                  onRequestDeactivate={onRequestDeactivate}
                />
              ) : (
                <Center mih={180} p='md'>
                  <Stack align='center' gap='xs'>
                    <IconSparkles size={30} stroke={1.4} color='var(--app-accent)' aria-hidden />
                    <Text c='dimmed' ta='center'>
                      Select an equipment slot to begin crafting.
                    </Text>
                  </Stack>
                </Center>
              )}
            </div>
          </section>
        )}
      </div>
    </Paper>
  )
}
