import { characterAllowsItem, enabledOwners, ownerSlots, slotOwner } from './character'
import CharacterSetupTool from './tools/CharacterSetupTool'
import { ownsTroveItem } from './trove'
import { gearPlannerAugmentIdentity } from './augments'
import { useTroveInventory } from './troveContext'
import ItemMaterial from './components/ItemMaterial'
import SetBonusPreview from './components/SetBonusPreview'
import ItemSetLinks from './components/ItemSetLinks'
import CatalogSearch from './components/CatalogSearch'
import CandidateEquipmentDetails from './components/CandidateEquipmentDetails'
import GearPlannerGuide from './components/GearPlannerGuide'
import CandidateEnchantments from './components/CandidateEnchantments'
import ItemDropLocations from './components/ItemDropLocations'
import FiligreeSetBrowser from './components/FiligreeSetBrowser'
import { TroveOwnership, OwnedFilter, TroveImport, TroveProvider } from './components/TroveInventory'
import { createCandidateComparison, matchesGearEffect, type GearFindTarget } from './finding'
import classes from '../../shared/layout/PlannerWorkspace.module.css'
import ItemCraftingSelector from './components/ItemCraftingSelector.tsx'
import {
  ActionIcon,
  Checkbox,
  Badge,
  SegmentedControl,
  Alert,
  Button,
  Center,
  Group,
  Loader,
  Menu,
  Modal,
  Notification,
  NumberInput,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
  Tooltip,
  UnstyledButton
} from '@mantine/core'
import {
  IconUserCog,
  IconAlertTriangle,
  IconSearch,
  IconArrowLeft,
  IconChevronRight,
  IconChevronDown,
  IconChevronUp,
  IconEyeglass,
  IconHelmet,
  IconDiamond,
  IconSparkles,
  IconShirt,
  IconJacket,
  IconBandage,
  IconGripHorizontal,
  IconRings,
  IconShoe,
  IconHandStop,
  IconSword,
  IconShield,
  IconSwords,
  IconArcheryArrow,
  IconReplace,
  IconCheck,
  IconLayersLinked,
  IconShare,
  IconListDetails,
  IconPencil,
  IconPlus,
  IconTrash,
  IconX
} from '@tabler/icons-react'
import { useEffect, useEffectEvent, useId, useMemo, useRef, useState } from 'react'
import ItemIcon from '../../shared/items/ItemIcon.tsx'
import type { WorkspaceTool } from '../../shared/layout/WorkspaceLayout.tsx'
import WorkspaceLayout from '../../shared/layout/WorkspaceLayout.tsx'
import { InvalidEssenceCraftingDataError, loadEssenceCraftingData } from '../essenceCrafting/data.ts'
import type { EssenceCraftingData } from '../essenceCrafting/essenceCrafting.types.ts'
import AugmentSlotSelector from './components/AugmentSlotSelector.tsx'
import CurseSelector from './components/CurseSelector.tsx'
import EssenceCraftingSelector from './components/EssenceCraftingSelector.tsx'
import FiligreeSlotSelector from './components/FiligreeSlotSelector.tsx'
import ReforgingSelector from './components/ReforgingSelector.tsx'
import { canApplyGearPlannerCurse } from './curses.ts'
import { InvalidGearPlannerDataError, loadGearPlannerData } from './data.ts'
import {
  normalizeBonusType,
  aggregateEffectSummary,
  collectEquippedEffects,
  conflictEligibleEffectSources,
  type GearPlannerEffectConflictResolution,
  type GearPlannerEffectSource,
  resolveEffectConflicts
} from './effects.ts'
import { getEssenceCraftedGearPlannerItems, isEssenceCraftedGearPlannerItem } from './essenceCrafting.ts'
import {
  collectSelectedGearPlannerFiligrees,
  supportsGearPlannerFiligrees,
  type GearPlannerSelectedFiligree
} from './filigrees.ts'
import { type GearPlannerData, type GearPlannerSlot, type GearPlannerItem } from './gearPlanner.types.ts'
import {
  allowsOffHand,
  occupiesBothHands,
  filterGearPlannerCandidates,
  createEmptyGearPlannerEquipment,
  type GearPlannerCandidate,
  type GearPlannerEquipment,
  gearPlannerItemType,
  type GearPlannerSlottedFiligrees,
  type GearPlannerUnlockedFiligreeSlots,
  hasOtherGearPlannerMinorArtifact,
  prepareGearPlannerCandidates
} from './planner.ts'
import {
  getEffectiveGearPlannerAugmentSlotsByItem,
  getGearPlannerEffectiveReforgingTier,
  gearPlannerReforgingRecipeForStage,
  gearPlannerReforgingStages
} from './reforging.ts'
import { type GearPlannerRestoreIssue, loadGearPlannerState, saveGearPlannerState } from './plannerStorage.ts'
import { type GearPlannerSetMembership, collectActiveSetEffectSources, resolveGearPlannerSetState } from './sets.ts'
import {
  activeGearPlannerSetup,
  addGearPlannerSetup,
  clearGearPlannerSetup,
  createDefaultGearPlannerState,
  createGearPlannerSetupId,
  deleteGearPlannerSetup,
  equipGearPlannerSetupItem,
  gearPlannerMinimumLevel,
  gearPlannerMaximumLevel,
  type GearPlannerSetupsState,
  renameGearPlannerSetup,
  selectGearPlannerSetup,
  setGearPlannerSetupAugment,
  setGearPlannerSetupCurse,
  setGearPlannerSetupCraft,
  setGearPlannerSetupEssenceCraftingConfiguration,
  setGearPlannerSetupFiligree,
  setGearPlannerSetupReforgingState,
  setGearPlannerSetupUnlockedFiligreeSlots,
  updateGearPlannerSetupLevels,
  updateSetupCharacter
} from './setups.ts'
import EnchantmentsTool, { EquippedEnchantmentList } from './tools/EnchantmentsTool.tsx'
import SharingTool, { ImportDetails } from './tools/SharingTool'
import { openGearPlannerLink } from './sharing'
import SetBonusesTool from './tools/SetBonusesTool.tsx'

type DataState =
  | { status: 'loading' }
  | { status: 'ready'; data: GearPlannerData; essenceData: EssenceCraftingData }
  | { status: 'error'; cause: unknown }

const pageSize = 50

const characterSlotLayout = [
  'Eyes',
  'Head',
  'Neck',
  'Trinket',
  'Armor',
  'Cloak',
  'Wrists',
  'Waist',
  'First Finger',
  'Feet',
  'Hands',
  'Second Finger',
  'Main Hand',
  'Off Hand',
  'Quiver'
] as const satisfies readonly GearPlannerSlot[]

const slotIcons = {
  Eyes: IconEyeglass,
  Head: IconHelmet,
  Neck: IconDiamond,
  Trinket: IconSparkles,
  Armor: IconShirt,
  Cloak: IconJacket,
  Wrists: IconBandage,
  Waist: IconGripHorizontal,
  'First Finger': IconRings,
  Feet: IconShoe,
  Hands: IconHandStop,
  'Second Finger': IconRings,
  'Main Hand': IconSword,
  'Off Hand': IconShield,
  'Iron Defender Armor': IconShield,
  'Iron Defender Weapon': IconSword,
  'Wolf Companion Armor': IconShield,
  'Wolf Companion Weapon': IconSword,
  Quiver: IconArcheryArrow
} satisfies Record<GearPlannerSlot, typeof IconSword>

function GearItemArt({ item, slot, size }: { item: GearPlannerItem; slot: GearPlannerItem['slot']; size: number }) {
  const SlotIcon = slotIcons[slot]
  return (
    <span className={classes.itemArt} style={{ width: size, height: size }} aria-hidden>
      <ItemIcon item={item.source} size={size} />
      <SlotIcon size='60%' stroke={1.6} />
    </span>
  )
}

const itemMetadata = (item: GearPlannerItem, essenceMinimumLevel?: number) =>
  `ML ${String(essenceMinimumLevel ?? item.minimumLevel)} · ${
    isEssenceCraftedGearPlannerItem(item) ? 'Essence Crafted' : gearPlannerItemType(item)
  }`

interface EquipmentEditorProps {
  sets: readonly string[]
  openSet: (name: string) => void
  initialFiligreeSlot?: number
  onFiligreeClose: () => void
  collapsed: boolean
  toggleDetails: () => void
  slot: GearPlannerSlot
  item: GearPlannerItem
  data: GearPlannerData
  essenceData: EssenceCraftingData
  effects: readonly GearPlannerEffectSource[]
  conflictSources: readonly GearPlannerEffectSource[]
  conflicts: GearPlannerEffectConflictResolution
  slottedAugments: import('./planner.ts').GearPlannerSlottedAugments
  slottedCurses: import('./planner.ts').GearPlannerSlottedCurses
  slottedFiligrees: GearPlannerSlottedFiligrees
  unlockedFiligreeSlots: GearPlannerUnlockedFiligreeSlots
  essenceCrafting: import('./essenceCrafting.ts').GearPlannerEssenceCraftingConfigurations
  reforging: import('./reforging.ts').GearPlannerReforgingState
  effectiveAugmentSlots: Readonly<Record<string, readonly import('./gearPlanner.types.ts').GearPlannerAugmentSlot[]>>
  openBrowser: (slot: GearPlannerSlot) => void
  clearSlot: (slot: GearPlannerSlot) => void
  setAugment: (itemId: string, slotIndex: number, augment: GearPlannerData['augments'][number] | null) => void
  setCraft: (itemId: string, system: string, choiceId: string | null) => void
  setCurse: (itemId: string, curseId: string | null) => void
  setFiligree: (itemId: string, slotIndex: number, filigree: GearPlannerData['filigrees'][number] | null) => void
  setUnlockedFiligreeSlots: (itemId: string, count: number) => void
  setEssenceConfiguration: (itemId: string, update: import('./planner.ts').GearPlannerEssenceCraftingUpdate) => void
  setReforging: (
    itemId: string,
    stage: import('./reforging.ts').GearPlannerReforgingStage,
    update: import('./reforging.ts').GearPlannerReforgingStageState | null
  ) => void
}

const EquipmentEditor = ({
  sets,
  openSet,
  initialFiligreeSlot,
  onFiligreeClose,
  collapsed,
  toggleDetails,
  slot,
  item,
  data,
  essenceData,
  effects,
  conflictSources,
  conflicts,
  slottedAugments,
  slottedCurses,
  slottedFiligrees,
  unlockedFiligreeSlots,
  essenceCrafting,
  reforging,
  effectiveAugmentSlots,
  openBrowser,
  clearSlot,
  setAugment,
  setCurse,
  setCraft,
  setFiligree,
  setUnlockedFiligreeSlots,
  setEssenceConfiguration,
  setReforging
}: EquipmentEditorProps) => (
  <Stack gap='md' p='md' data-testid='gear-item-editor'>
    <div className={classes.itemHeader}>
      <Group wrap='nowrap' miw={0}>
        <GearItemArt item={item} slot={slot} size={46} />
        <Stack gap={2} miw={0}>
          <Title order={3} size='h4'>
            {item.source.name}
          </Title>
          <Group gap='xs'>
            <Text c='dimmed' size='sm'>
              {itemMetadata(item, essenceCrafting[item.id]?.minimumLevel)}
            </Text>
            <ItemMaterial item={item} selectedMaterial={essenceCrafting[item.id]?.material} />
          </Group>
          <ItemSetLinks names={sets} onOpen={openSet} />
          <TroveOwnership name={item.source.name} />
        </Stack>
      </Group>
      <Group gap='xs'>
        <Button
          size='xs'
          variant='subtle'
          aria-expanded={!collapsed}
          aria-controls='gear-item-details'
          leftSection={collapsed ? <IconChevronDown size={15} /> : <IconChevronUp size={15} />}
          onClick={toggleDetails}
        >
          {collapsed ? 'Expand details' : 'Collapse details'}
        </Button>
        <Button
          size='xs'
          variant='light'
          leftSection={<IconReplace size={15} />}
          onClick={() => {
            openBrowser(slot)
          }}
        >
          Change item
        </Button>
        <Button
          size='xs'
          variant='subtle'
          color='red'
          aria-label={`Clear ${slot} from equipment`}
          onClick={() => {
            clearSlot(slot)
          }}
        >
          Unequip
        </Button>
      </Group>
    </div>
    <div id='gear-item-details' hidden={collapsed}>
      {!collapsed && (
        <Stack gap='md'>
          <ItemDropLocations locations={item.source.dropLocations} />
          <div className={classes.editorSections}>
            {effects.length > 0 && (
              <div className={classes.effects}>
                <EquippedEnchantmentList sources={effects} conflicts={conflicts} label={`${slot} enchantments`} />
              </div>
            )}
            <Stack gap='md' miw={0}>
              <ReforgingSelector
                item={item}
                data={data.reforging}
                selected={reforging[item.id]}
                onChange={(stage, update) => {
                  setReforging(item.id, stage, update)
                }}
              />
              {(effectiveAugmentSlots[item.id] ?? []).map((augmentSlot, slotIndex) => (
                <AugmentSlotSelector
                  conflicts={conflicts}
                  hostLevel={essenceCrafting[item.id]?.minimumLevel ?? item.minimumLevel}
                  openSet={openSet}
                  key={`${item.id}-${String(slotIndex)}`}
                  item={item}
                  slotIndex={slotIndex}
                  augmentSlot={augmentSlot}
                  augments={data.augments}
                  conflictSources={conflictSources}
                  selected={slottedAugments[item.id]?.[slotIndex] ?? null}
                  onChange={(augment) => {
                    setAugment(item.id, slotIndex, augment)
                  }}
                />
              ))}

              <ItemCraftingSelector
                key={`crafting-${item.id}`}
                item={item}
                data={data.crafting}
                onChange={(system, choiceId) => {
                  setCraft(item.id, system, choiceId)
                }}
              />
              {canApplyGearPlannerCurse(item) ? (
                <CurseSelector
                  item={item}
                  curses={data.curses}
                  selected={slottedCurses[item.id] ?? null}
                  conflictSources={conflictSources}
                  onChange={(curseId) => {
                    setCurse(item.id, curseId)
                  }}
                />
              ) : null}
              {isEssenceCraftedGearPlannerItem(item) && essenceCrafting[item.id] ? (
                <EssenceCraftingSelector
                  item={item}
                  data={essenceData}
                  configuration={essenceCrafting[item.id]}
                  curse={slottedCurses[item.id] ?? null}
                  onMinimumLevelChange={(minimumLevel) => {
                    setEssenceConfiguration(item.id, { kind: 'minimum-level', minimumLevel })
                  }}
                  onMaterialChange={(material) => {
                    setEssenceConfiguration(item.id, { kind: 'material', material })
                  }}
                  onAffixChange={(position, enhancementId) => {
                    setEssenceConfiguration(item.id, { kind: 'affix', position, enhancementId })
                  }}
                />
              ) : null}
              {supportsGearPlannerFiligrees(item) ? (
                <FiligreeSlotSelector
                  initialSlotIndex={initialFiligreeSlot}
                  onClose={onFiligreeClose}
                  item={item}
                  filigrees={data.filigrees}
                  slottedFiligrees={slottedFiligrees}
                  unlockedFiligreeSlots={unlockedFiligreeSlots}
                  onChange={(slotIndex, filigree) => {
                    setFiligree(item.id, slotIndex, filigree)
                  }}
                  onUnlockedSlotCountChange={(count) => {
                    setUnlockedFiligreeSlots(item.id, count)
                  }}
                />
              ) : null}
            </Stack>
          </div>
        </Stack>
      )}
    </div>
  </Stack>
)

interface ItemBrowserProps extends Pick<EquipmentEditorProps, 'effectiveAugmentSlots' | 'essenceCrafting' | 'openSet'> {
  memberships: readonly GearPlannerSetMembership[]
  equippedFiligrees: readonly GearPlannerSelectedFiligree[]
  openFiligree: (host: GearPlannerSelectedFiligree) => void
  catalogItems: readonly GearPlannerCandidate[]
  target?: GearFindTarget
  slots: readonly GearPlannerSlot[]
  finding: boolean
  showConflicts: boolean
  onShowConflicts: (value: boolean) => void
  comparison: ReturnType<typeof createCandidateComparison>
  slot: GearPlannerSlot
  data: GearPlannerData
  equipment: GearPlannerEquipment
  minimumLevel: number
  maximumLevel: number
  equip: (slot: GearPlannerSlot, item: GearPlannerItem | null) => void
  onMinorArtifactRejected: () => void
  updateLevels: (update: { minimumLevel?: number; maximumLevel?: number }) => void
}

const ItemBrowser = ({
  memberships,
  openSet,
  equippedFiligrees,
  openFiligree,
  catalogItems,
  effectiveAugmentSlots,
  essenceCrafting,
  target,
  slots,
  finding,
  showConflicts,
  onShowConflicts,
  comparison,
  slot,
  data,
  equipment,
  minimumLevel,
  maximumLevel,
  equip,
  onMinorArtifactRejected,
  updateLevels
}: ItemBrowserProps) => {
  const [search, setSearch] = useState(target?.kind === 'effect' ? target.name : '')
  const [exactEffect, setExactEffect] = useState(target?.kind === 'effect')
  const [type, setType] = useState<string | null>(null)
  const [setName, setSetName] = useState<string | null>(target?.kind === 'item' ? target.name : null)
  const [visibleCount, setVisibleCount] = useState(pageSize)
  const [collapsedSheets, setCollapsedSheets] = useState<ReadonlySet<string>>(() => new Set())
  const [catalog, setCatalog] = useState(target?.kind === 'filigree' ? 'Filigrees' : 'Equipment')
  const [slotFilter, setSlotFilter] = useState<string | null>(null)
  const [bonusType, setBonusType] = useState<string | null>(
    target?.kind === 'effect' ? (target.bonusType ?? null) : null
  )
  const [filtersOpen, setFiltersOpen] = useState(false)
  const filtersId = useId()
  const effectQuery = search.trim().toLowerCase()
  const { inventory, ownedOnly, setOwnedOnly } = useTroveInventory()
  const candidates = useMemo(() => {
    const filterSlot = finding ? slotFilter : slot
    return catalogItems.filter(
      ({ item }) =>
        (!filterSlot || item.slot === filterSlot) &&
        (item.slot !== 'Off Hand' || allowsOffHand(equipment['Main Hand'], item))
    )
  }, [catalogItems, equipment, finding, slotFilter, slot])
  const bonusTypes = useMemo(
    () =>
      finding
        ? [
            ...new Set(candidates.flatMap(({ effects }) => effects.map((effect) => normalizeBonusType(effect.bonus))))
          ].sort()
        : [],
    [finding, candidates]
  )
  const types = useMemo(
    () => [...new Set(candidates.map((candidate) => candidate.type))].sort((a, b) => a.localeCompare(b)),
    [candidates]
  )
  const sets = useMemo(() => {
    const inRange = (level: number) => level >= minimumLevel && level <= maximumLevel
    const names = new Set(
      candidates.flatMap(({ item, sets: itemSets }) => (inRange(item.minimumLevel) ? itemSets : []))
    )
    if (finding && !slotFilter) {
      for (const augment of data.augments) {
        if (inRange(augment.minLevel)) for (const set of augment.setBonus ?? []) names.add(set.name)
      }
    }
    return [...names].sort((a, b) => a.localeCompare(b))
  }, [candidates, data.augments, finding, slotFilter, minimumLevel, maximumLevel])
  useEffect(() => {
    if (setName && !sets.includes(setName) && !(target?.kind === 'item' && target.name === setName)) {
      setSetName(null)
    }
  }, [setName, sets, target])
  const setAugments =
    finding && setName && !slotFilter && !type && !bonusType
      ? data.augments.filter(
          (augment) =>
            augment.setBonus?.some((set) => set.name === setName) &&
            augment.minLevel >= minimumLevel &&
            augment.minLevel <= maximumLevel &&
            (!ownedOnly || ownsTroveItem(inventory, augment.name)) &&
            augment.name.toLowerCase().includes(effectQuery)
        )
      : []
  const filtered = useMemo(
    () =>
      catalog === 'Filigrees'
        ? []
        : filterGearPlannerCandidates(candidates, {
            search,
            minimumLevel,
            maximumLevel,
            type,
            setName,
            bonusType,
            exactEffect,
            inventory,
            ownedOnly,
            isConflicting: showConflicts ? undefined : comparison.isConflicting
          }),
    [
      candidates,
      catalog,
      maximumLevel,
      minimumLevel,
      search,
      setName,
      type,
      bonusType,
      exactEffect,
      inventory,
      ownedOnly,
      showConflicts,
      comparison
    ]
  )

  useEffect(() => {
    setVisibleCount(pageSize)
  }, [search, minimumLevel, maximumLevel, type, setName, slotFilter, bonusType, ownedOnly, showConflicts])

  const changeSlotFilter = (value: string | null) => {
    setSlotFilter(value)
    setType(null)
    setSetName(null)
    setBonusType(null)
  }
  const activeFilters = [
    {
      label: slotFilter,
      clear: () => {
        setSlotFilter(null)
      }
    },
    {
      label: type,
      clear: () => {
        setType(null)
      }
    },
    {
      label: setName,
      clear: () => {
        setSetName(null)
      }
    },
    {
      label: bonusType && bonusType + ' bonus',
      clear: () => {
        setBonusType(null)
      }
    },
    {
      label:
        (minimumLevel !== gearPlannerMinimumLevel || maximumLevel !== gearPlannerMaximumLevel) &&
        `ML ${String(minimumLevel)}–${String(maximumLevel)}`,
      clear: () => {
        updateLevels({ minimumLevel: gearPlannerMinimumLevel, maximumLevel: gearPlannerMaximumLevel })
      }
    },
    {
      label: showConflicts && 'Include lesser items',
      clear: () => {
        onShowConflicts(false)
      }
    },
    {
      label: ownedOnly && 'Owned only',
      clear: () => {
        setOwnedOnly(false)
      }
    }
  ]
  const select = (item: GearPlannerItem) => {
    const targetSlot = item.slot
    if (!slots.includes(targetSlot) || (!finding && targetSlot !== slot)) return
    if (hasOtherGearPlannerMinorArtifact(equipment, targetSlot, item)) {
      onMinorArtifactRejected()
      return
    }
    equip(targetSlot, item)
  }

  return (
    <Stack gap='md' p='md' data-testid='gear-item-browser'>
      {finding && (
        <SegmentedControl
          aria-label='Gear catalog'
          data={['Equipment', 'Filigrees']}
          value={catalog}
          onChange={setCatalog}
        />
      )}
      {catalog === 'Filigrees' ? (
        <FiligreeSetBrowser
          data={data}
          equipped={equippedFiligrees}
          openSlot={openFiligree}
          initialQuery={search}
          initialSet={target?.kind === 'filigree' ? target.name : undefined}
        />
      ) : (
        <>
          <CatalogSearch
            label={exactEffect ? 'Exact enchantment' : 'Search items'}
            placeholder={finding ? 'Name, enchantment or set' : 'Name or effect'}
            value={search}
            onChange={(value) => {
              setExactEffect(false)
              setSearch(value)
            }}
          />
          <Group gap='xs'>
            <Text aria-live='polite' c='dimmed' size='sm'>
              {filtered.length === 1 ? '1 item' : `${String(filtered.length)} items`}
            </Text>
            {finding && (
              <div className={classes.compactFilters}>
                <Button
                  size='compact-sm'
                  variant='light'
                  aria-expanded={filtersOpen}
                  aria-controls={filtersId}
                  onClick={() => {
                    setFiltersOpen(!filtersOpen)
                  }}
                >
                  Filters
                </Button>
                {activeFilters.map(
                  ({ label, clear }, index) =>
                    label && (
                      <Button
                        key={index}
                        size='compact-xs'
                        variant='default'
                        rightSection={<IconX size={12} aria-hidden />}
                        aria-label={'Remove filter: ' + label}
                        onClick={clear}
                      >
                        {label}
                      </Button>
                    )
                )}
              </div>
            )}
          </Group>
          <div id={filtersId} className={classes.browserFilters} data-compact={(finding && !filtersOpen) || undefined}>
            <SimpleGrid type='container' cols={{ base: 2, '35rem': 4 }} spacing='xs'>
              {finding && (
                <Select
                  label='Equipment slot'
                  placeholder='All slots'
                  clearable
                  data={slots}
                  value={slotFilter}
                  onChange={changeSlotFilter}
                />
              )}
              {finding && (
                <Select
                  searchable
                  label='Enchantment bonus type'
                  placeholder='All bonuses'
                  clearable
                  data={bonusTypes.map((value) => ({ value, label: value[0].toUpperCase() + value.slice(1) }))}
                  value={bonusType}
                  onChange={setBonusType}
                />
              )}
              <NumberInput
                label='Minimum level'
                min={1}
                value={minimumLevel}
                onChange={(value) => {
                  updateLevels({ minimumLevel: typeof value === 'number' ? value : 1 })
                }}
              />
              <NumberInput
                label='Maximum level'
                min={1}
                value={maximumLevel}
                onChange={(value) => {
                  updateLevels({ maximumLevel: typeof value === 'number' ? value : 36 })
                }}
              />

              {types.length > 1 ? (
                <Select
                  label='Item type'
                  placeholder='All types'
                  clearable
                  data={types}
                  value={type}
                  onChange={setType}
                />
              ) : null}
              <Select
                searchable
                label='Item set'
                placeholder={setName ?? 'All sets'}
                clearable
                data={sets}
                value={setName}
                onChange={setSetName}
              />
            </SimpleGrid>
            <Group gap='md'>
              <Checkbox
                size='xs'
                label='Show conflicting or lesser items'
                checked={showConflicts}
                onChange={(e) => {
                  onShowConflicts(e.currentTarget.checked)
                }}
              />
              <OwnedFilter />
            </Group>
          </div>
          {setName && <SetBonusPreview key={setName} compact={finding} definition={data.standardSets?.get(setName)} />}
          {setAugments.length > 0 && (
            <Stack gap={4}>
              <Text fw={600} size='sm'>
                Augments that grant this set
              </Text>
              {setAugments.map((augment) => (
                <Text size='sm' key={gearPlannerAugmentIdentity(augment)}>
                  {augment.name} · {augment.augmentType} · ML {augment.minLevel}
                </Text>
              ))}
            </Stack>
          )}

          <ul className={classes.results} data-finder={finding || undefined}>
            {filtered.slice(0, visibleCount).map(({ item, sets: itemSets, effects, craftGroups }) => {
              const incumbent = equipment[item.slot]
              const equipped = incumbent?.id === item.id
              const membershipLabel =
                finding && incumbent && setName
                  ? memberships.some(
                      (membership) =>
                        membership.category === 'equipped-item' &&
                        membership.itemId === incumbent.id &&
                        membership.setName === setName
                    )
                    ? `Member of ${setName}`
                    : `Outside ${setName}`
                  : undefined
              const essence = equipped ? essenceCrafting[item.id] : undefined
              const setSources = craftGroups
                .filter((group) => !setName || group.sets.includes(setName))
                .map((group) => group.label)
              const collapsed = collapsedSheets.has(item.id)
              const sheetId = `candidate-enchantments-${encodeURIComponent(item.id)}`
              const toggleLabel = `${collapsed ? 'Expand' : 'Collapse'} enchantments for ${item.source.name} in ${item.slot}`
              return (
                <li key={item.id} className={classes.result}>
                  <div className={classes.resultHeader}>
                    <GearItemArt item={item} slot={item.slot} size={36} />
                    <Stack gap={0} miw={0} flex={1}>
                      <Group gap={6}>
                        <Text fw={700} size='md'>
                          {item.source.name}
                        </Text>
                        {equipped && (
                          <Badge variant='light' color='teal' size='sm'>
                            Equipped
                          </Badge>
                        )}
                      </Group>
                      <Group gap='0.5em' style={{ rowGap: 0 }}>
                        <Text c='dimmed' size='xs'>
                          {[finding ? item.slot : '', itemMetadata(item, essence?.minimumLevel)]
                            .filter(Boolean)
                            .join(' · ')}
                        </Text>
                        {finding && (!equipped || membershipLabel) && (
                          <Text size='xs' c='dimmed'>
                            {[
                              equipped
                                ? 'Currently equipped'
                                : incumbent
                                  ? `Replaces ${incumbent.source.name}`
                                  : 'Empty slot',
                              membershipLabel
                            ]
                              .filter(Boolean)
                              .join(' · ')}
                          </Text>
                        )}
                      </Group>
                      {craftGroups.length > 0 && itemSets.length > 1 && !setName ? (
                        <details>
                          <Text component='summary' size='xs'>
                            {itemSets.length} possible sets
                          </Text>
                          <ItemSetLinks names={itemSets} onOpen={openSet} />
                        </details>
                      ) : (
                        <ItemSetLinks names={setName ? [setName] : itemSets} onOpen={openSet} />
                      )}
                      {item.essenceCrafting &&
                        (effectQuery || bonusType) &&
                        [
                          ...new Set(
                            effects
                              .filter((e) => matchesGearEffect(e, effectQuery, bonusType, exactEffect))
                              .map((e) => e.craft)
                          )
                        ].map((recipe) => (
                          <Text key={recipe} size='xs'>
                            Craftable {recipe}
                          </Text>
                        ))}
                      <TroveOwnership name={item.source.name} />
                    </Stack>
                    <Group gap={4} wrap='nowrap'>
                      <Button
                        size='compact-sm'
                        variant='light'
                        aria-label={finding ? `Equip ${item.source.name} in ${item.slot}` : `Equip ${item.source.name}`}
                        onClick={() => {
                          select(item)
                        }}
                      >
                        Equip
                      </Button>
                      {Boolean(item.source.enchantments?.length) && (
                        <Tooltip label={collapsed ? 'Expand enchantments' : 'Collapse enchantments'}>
                          <ActionIcon
                            type='button'
                            variant='subtle'
                            size='md'
                            aria-label={toggleLabel}
                            aria-expanded={!collapsed}
                            aria-controls={sheetId}
                            onClick={() => {
                              setCollapsedSheets((current) => {
                                const next = new Set(current)
                                if (next.has(item.id)) next.delete(item.id)
                                else next.add(item.id)
                                return next
                              })
                            }}
                          >
                            {collapsed ? (
                              <IconChevronDown aria-hidden size={16} />
                            ) : (
                              <IconChevronUp aria-hidden size={16} />
                            )}
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </Group>
                  </div>
                  <CandidateEquipmentDetails
                    item={item}
                    material={essence?.material}
                    sockets={effectiveAugmentSlots[item.id] ?? item.source.augments ?? []}
                    setSources={setSources}
                  />
                  <div id={sheetId} hidden={collapsed}>
                    {!collapsed && (
                      <CandidateEnchantments
                        item={item}
                        comparison={comparison}
                        exact={exactEffect}
                        query={effectQuery}
                        bonusType={bonusType}
                      />
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
          {filtered.length === 0 ? (
            <Text c='dimmed'>
              {(finding ? slotFilter : slot) === 'Off Hand' &&
              equipment['Main Hand'] &&
              occupiesBothHands(equipment['Main Hand'])
                ? `${equipment['Main Hand'].source.name} occupies both hands. Change your main-hand weapon to equip an off-hand item.`
                : 'No equipment matches these filters.'}
            </Text>
          ) : null}
          {visibleCount < filtered.length ? (
            <Button
              variant='subtle'
              onClick={() => {
                setVisibleCount((current) => current + pageSize)
              }}
            >
              Show {String(Math.min(pageSize, filtered.length - visibleCount))} more
            </Button>
          ) : null}
        </>
      )}
    </Stack>
  )
}

const GearPlannerWorkspace = () => {
  const [dataState, setDataState] = useState<DataState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const [plannerState, setPlannerState] = useState(createDefaultGearPlannerState)
  const [requestedSlot, setSlot] = useState<GearPlannerSlot>('Eyes')
  const [mode, setMode] = useState<'equipped' | 'replace' | 'find' | { filigreeSlot: number }>('equipped')
  const [findRequest, setFindRequest] = useState<{ revision: number; target?: GearFindTarget }>({ revision: 0 })
  const [returnSlot, setReturnSlot] = useState<GearPlannerSlot | null>(null)
  const finding = mode === 'find'
  const replacing = mode === 'replace'
  const [showConflicts, setShowConflicts] = useState(false)
  const [detailOnMobile, setDetailOnMobile] = useState(false)
  const slotListRef = useRef<HTMLElement>(null)
  const detailHeadingRef = useRef<HTMLHeadingElement>(null)
  const selectSlot = (next: GearPlannerSlot) => {
    setReturnSlot(null)
    setSlot(next)
    setMode('equipped')
    setDetailOnMobile(true)
    requestAnimationFrame(() => detailHeadingRef.current?.focus({ preventScroll: true }))
  }
  const backToEquipment = () => {
    setReturnSlot(null)
    setDetailOnMobile(false)
    setMode('equipped')
    requestAnimationFrame(() => slotListRef.current?.querySelector<HTMLButtonElement>('[aria-current="true"]')?.focus())
  }
  const legacySaveImported = useRef(false)
  const [persistenceEnabled, setPersistenceEnabled] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [renameValue, setRenameValue] = useState('')
  const [setupAction, setSetupAction] = useState<'Clear' | 'Delete' | null>(null)
  const [feedback, setFeedback] = useState<{
    kind: 'success' | 'error'
    message: string
    issues?: readonly GearPlannerRestoreIssue[]
  } | null>(null)
  const activeSetup = activeGearPlannerSetup(plannerState)
  const {
    equipment,
    slottedAugments,
    slottedCurses,
    slottedFiligrees,
    unlockedFiligreeSlots,
    essenceCrafting,
    reforging
  } = activeSetup
  const owners = useMemo(() => enabledOwners(activeSetup.character.classes), [activeSetup.character.classes])
  const equippedFiligrees = useMemo(
    () =>
      collectSelectedGearPlannerFiligrees(equipment, slottedFiligrees).filter(({ item }) =>
        owners.includes(slotOwner(item.slot))
      ),
    [equipment, slottedFiligrees, owners]
  )
  const slot = owners.includes(slotOwner(requestedSlot)) ? requestedSlot : 'Eyes'
  const owner = slotOwner(slot)
  const slots: readonly GearPlannerSlot[] = owner === 'Character' ? characterSlotLayout : ownerSlots[owner]
  const [collapsedItems, setCollapsedItems] = useState<ReadonlySet<string>>(new Set())
  const itemKey = (item: GearPlannerItem) => JSON.stringify([activeSetup.id, item.id])
  const equippedKeys = slots.flatMap((name) => (equipment[name] ? [itemKey(equipment[name])] : []))
  const allCollapsed = equippedKeys.length > 0 && equippedKeys.every((key) => collapsedItems.has(key))
  function setDetailsCollapsed(keys: string[], collapsed: boolean) {
    setCollapsedItems((current) => {
      const next = new Set(current)
      for (const key of keys) {
        if (collapsed) next.add(key)
        else next.delete(key)
      }
      return next
    })
  }
  const selectedItem = equipment[slot]
  const browsing = !selectedItem || replacing || finding
  const filigreeDefinitions = dataState.status === 'ready' ? dataState.data.filigreeSetDefinitionByName : undefined
  const effectiveAugmentSlots = useMemo(
    () =>
      dataState.status === 'ready'
        ? getEffectiveGearPlannerAugmentSlotsByItem(equipment, reforging, dataState.data.reforging)
        : {},
    [dataState, equipment, reforging]
  )
  const allEffects = useMemo(
    () =>
      collectEquippedEffects(
        equipment,
        slottedAugments,
        slottedFiligrees,
        slottedCurses,
        dataState.status === 'ready' ? dataState.essenceData : undefined,
        essenceCrafting,
        dataState.status === 'ready' ? dataState.data.reforging : undefined,
        reforging
      ),
    [dataState, equipment, essenceCrafting, reforging, slottedAugments, slottedCurses, slottedFiligrees]
  )
  const ownerSets = useMemo(
    () =>
      Object.fromEntries(
        owners.map((currentOwner) => {
          const loadout = createEmptyGearPlannerEquipment()
          for (const key of ownerSlots[currentOwner]) loadout[key] = equipment[key]
          return [
            currentOwner,
            resolveGearPlannerSetState(
              loadout,
              slottedAugments,
              dataState.status === 'ready' ? dataState.data.standardSets : undefined,
              slottedFiligrees,
              filigreeDefinitions,
              effectiveAugmentSlots
            )
          ] as const
        })
      ),
    [owners, equipment, slottedAugments, dataState, slottedFiligrees, filigreeDefinitions, effectiveAugmentSlots]
  )
  const setState = ownerSets[owner]
  const baseEffects = useMemo(
    () => allEffects.filter((effect) => effect.slot && slotOwner(effect.slot) === owner),
    [allEffects, owner]
  )
  const effects = useMemo(() => [...baseEffects, ...collectActiveSetEffectSources(setState)], [baseEffects, setState])
  const conflictSources = useMemo(() => conflictEligibleEffectSources(baseEffects), [baseEffects])
  const comparison = useMemo(() => createCandidateComparison(conflictSources), [conflictSources])
  const conflicts = useMemo(() => resolveEffectConflicts(conflictSources), [conflictSources])
  const summary = useMemo(() => aggregateEffectSummary(effects), [effects])
  const catalogItems = useMemo(
    () =>
      dataState.status === 'ready'
        ? prepareGearPlannerCandidates(
            slots.flatMap((s) => [
              ...getEssenceCraftedGearPlannerItems(s, activeSetup.minimumLevel),
              ...dataState.data.itemsBySlot[s].filter((item) => characterAllowsItem(activeSetup.character, item))
            ]),
            dataState.data,
            dataState.essenceData
          )
        : [],
    [dataState, slots, activeSetup.minimumLevel, activeSetup.character]
  )
  function findGear(target?: GearFindTarget) {
    if (returnSlot && !target) {
      if (slotOwner(returnSlot) !== owner) setSlot(returnSlot)
    } else {
      setFindRequest((current) => ({ revision: current.revision + 1, target }))
    }
    setReturnSlot(null)
    setMode('find')
    setDetailOnMobile(true)
    requestAnimationFrame(() => detailHeadingRef.current?.focus({ preventScroll: true }))
  }
  const openSet = (name: string) => {
    findGear({ kind: 'item', name })
  }
  const tools: readonly WorkspaceTool[] = [
    {
      id: 'enchantments',
      label: 'Enchantments',
      icon: <IconListDetails stroke={2} />,
      content: (revealWorkspace) => (
        <EnchantmentsTool
          summary={summary}
          candidates={catalogItems}
          minimumLevel={activeSetup.minimumLevel}
          maximumLevel={activeSetup.maximumLevel}
          onFind={(target) => {
            revealWorkspace()
            findGear(target)
          }}
        />
      )
    },
    {
      id: 'set-bonuses',
      label: 'Set Bonuses',
      icon: <IconLayersLinked stroke={2} />,
      content: (revealWorkspace) => (
        <SetBonusesTool
          setState={setState}
          onFind={(target) => {
            revealWorkspace()
            findGear(target)
          }}
        />
      )
    },
    ...(dataState.status === 'ready'
      ? [
          {
            id: 'character',
            label: 'Character setup',
            icon: <IconUserCog stroke={2} />,
            content: (
              <CharacterSetupTool
                settings={activeSetup.character}
                onChange={(character) => {
                  applySetupState((current) => updateSetupCharacter(current, activeSetup.id, character))
                }}
              />
            )
          },
          {
            id: 'sharing',
            label: 'Sharing',
            icon: <IconShare stroke={2} />,
            content: (
              <SharingTool
                state={plannerState}
                effects={allEffects}
                ownerSets={ownerSets}
                data={dataState.data}
                essenceData={dataState.essenceData}
                onRestore={(state) => {
                  setReturnSlot(null)
                  setPlannerState(state)
                  setMode('equipped')
                  setDetailOnMobile(false)
                  setSlot(characterSlotLayout.find((s) => activeGearPlannerSetup(state).equipment[s]) ?? 'Eyes')
                  setPersistenceEnabled(true)
                  setFeedback({ kind: 'success', message: 'Backup restored.' })
                }}
              />
            )
          }
        ]
      : [])
  ]

  useEffect(() => {
    if (import.meta.env.DEV && setState.unresolvedDefinitionNames.length > 0) {
      console.warn(
        `Gear Planner set memberships without standard definitions: ${setState.unresolvedDefinitionNames.join(', ')}`
      )
    }
  }, [setState.unresolvedDefinitionNames])

  useEffect(() => {
    if (dataState.status !== 'ready' || !import.meta.env.DEV) return
    for (const item of Object.values(equipment)) {
      if (!item) continue
      const selected = reforging[item.id]
      const hasActiveToggle = gearPlannerReforgingStages.some(
        (stage) =>
          selected?.[stage]?.kind === 'active' &&
          gearPlannerReforgingRecipeForStage(item, stage, dataState.data.reforging)?.kind === 'toggle'
      )
      if (hasActiveToggle && !getGearPlannerEffectiveReforgingTier(item, selected, dataState.data.reforging)) {
        console.warn(`Gear Planner reforging tier unavailable for ${item.source.name}`)
      }
    }
  }, [dataState, equipment, reforging])

  useEffect(() => {
    let active = true
    Promise.all([loadGearPlannerData(), loadEssenceCraftingData()])
      .then(([data, essenceData]) => {
        if (!active) return
        const restored = loadGearPlannerState(data, essenceData)
        if (import.meta.env.DEV && restored.issues.length > 0) {
          console.warn('Gear Planner persistence restore issues:', restored.issues)
        }
        setSlot(characterSlotLayout.find((s) => activeGearPlannerSetup(restored.state).equipment[s]) ?? 'Eyes')
        setPlannerState(restored.state)
        legacySaveImported.current = restored.legacySaveImported === true
        setPersistenceEnabled(false)
        if (restored.carryover) {
          setFeedback({ ...restored.carryover, issues: restored.issues })
        }
        setDataState({ status: 'ready', data, essenceData })
      })
      .catch((cause: unknown) => {
        if (active) setDataState({ status: 'error', cause })
      })
    return () => {
      active = false
    }
  }, [attempt])

  const openSharedSetup = useEffectEvent(() => {
    if (dataState.status !== 'ready') return
    const url = new URL(window.location.href)
    const fragment = new URLSearchParams(url.hash.slice(1))
    const shared = fragment.get('gp') ?? url.searchParams.get('gp')
    if (shared === null) return
    try {
      const imported = openGearPlannerLink(shared, plannerState, dataState.data, dataState.essenceData)
      setReturnSlot(null)
      setPlannerState(imported.state)
      setPersistenceEnabled(true)
      setSlot(characterSlotLayout.find((s) => activeGearPlannerSetup(imported.state).equipment[s]) ?? 'Eyes')
      setMode('equipped')
      setDetailOnMobile(false)
      url.searchParams.delete('gp')
      if (fragment.has('gp')) {
        fragment.delete('gp')
        url.hash = fragment.toString()
      }
      window.history.replaceState(window.history.state, '', url)
      setFeedback({ kind: 'success', message: 'Shared setup added.', issues: imported.issues })
    } catch {
      setFeedback({
        kind: 'error',
        message: 'This Gear Planner link is invalid or unsupported. Your saved setups were kept.'
      })
    }
  })

  useEffect(() => {
    if (dataState.status !== 'ready') return
    openSharedSetup()
    const openLink = () => {
      openSharedSetup()
    }
    window.addEventListener('hashchange', openLink)
    return () => {
      window.removeEventListener('hashchange', openLink)
    }
  }, [dataState.status])

  useEffect(() => {
    if (dataState.status === 'ready' && persistenceEnabled)
      saveGearPlannerState(plannerState, undefined, legacySaveImported.current)
  }, [dataState.status, persistenceEnabled, plannerState])

  useEffect(() => {
    setRenameOpen(false)
    setRenameValue(activeSetup.name)
  }, [activeSetup.id, activeSetup.name])

  const retry = () => {
    setDataState({ status: 'loading' })
    setAttempt((current) => current + 1)
  }

  const equip = (targetSlot: GearPlannerSlot, item: GearPlannerItem | null) => {
    if (dataState.status !== 'ready') return
    if (finding) setReturnSlot(slot)
    setSlot(targetSlot)
    setPlannerState((current) => equipGearPlannerSetupItem(current, targetSlot, item, dataState.essenceData))
    setMode('equipped')
    setPersistenceEnabled(true)
    requestAnimationFrame(() => detailHeadingRef.current?.focus({ preventScroll: true }))
  }

  const applySetupState = (transition: (state: GearPlannerSetupsState) => GearPlannerSetupsState) => {
    setPlannerState((current) => transition(current))
    setPersistenceEnabled(true)
  }

  const renderBrowser = (isFinder: boolean) =>
    dataState.status === 'ready' && (
      <ItemBrowser
        memberships={setState.memberships}
        openSet={openSet}
        equippedFiligrees={equippedFiligrees}
        openFiligree={({ item, slotIndex }) => {
          if (isFinder) setReturnSlot(slot)
          setDetailsCollapsed([itemKey(item)], false)
          setSlot(item.slot)
          setDetailOnMobile(true)
          setMode({ filigreeSlot: slotIndex })
        }}

        target={isFinder ? findRequest.target : undefined}
        effectiveAugmentSlots={effectiveAugmentSlots}
        essenceCrafting={essenceCrafting}
        catalogItems={catalogItems}
        slots={slots}
        finding={isFinder}
        showConflicts={showConflicts}
        onShowConflicts={setShowConflicts}
        comparison={comparison}
        slot={slot}
        data={dataState.data}
        equipment={equipment}
        minimumLevel={activeSetup.minimumLevel}
        maximumLevel={activeSetup.maximumLevel}
        equip={equip}
        updateLevels={(update) => {
          applySetupState((current) => updateGearPlannerSetupLevels(current, activeSetup.id, update))
        }}
        onMinorArtifactRejected={() => {
          setFeedback({ kind: 'error', message: 'Only one minor artifact can be equipped at a time.' })
        }}
      />
    )

  return (
    <WorkspaceLayout tools={tools} scrollMain={false}>
      <Stack className={classes.planner} gap='sm' p={{ base: 'xs', sm: 'md' }}>
        <Group className={classes.masthead} justify='space-between'>
          <Group gap='sm' wrap='nowrap'>
            <span className={classes.crest}>
              <IconSwords size={23} stroke={1.6} aria-hidden />
            </span>
            <Title order={1} size='h2'>
              Gear Planner
            </Title>
            {dataState.status === 'ready' && <GearPlannerGuide />}
          </Group>
          {dataState.status === 'ready' && (
            <Group gap='xs'>
              <Button
                size='xs'
                variant='light'
                leftSection={<IconSearch size={16} />}
                onClick={() => {
                  findGear()
                }}
              >
                Find gear
              </Button>
              <TroveImport />
            </Group>
          )}
        </Group>

        {dataState.status === 'loading' ? (
          <Center mih={160} role='status' aria-live='polite'>
            <Stack align='center' gap='xs'>
              <Loader size='sm' />
              <Text c='dimmed' size='sm'>
                Loading Gear Planner data…
              </Text>
            </Stack>
          </Center>
        ) : null}

        {dataState.status === 'error' ? (
          <Alert
            color='red'
            title={
              dataState.cause instanceof InvalidGearPlannerDataError ||
              dataState.cause instanceof InvalidEssenceCraftingDataError
                ? 'Gear Planner data is invalid'
                : 'Gear Planner data is unavailable'
            }
          >
            <Stack gap='sm' align='flex-start'>
              <Text size='sm'>Gear Planner data could not be loaded. Try again.</Text>
              {import.meta.env.DEV && dataState.cause instanceof Error ? (
                <Text component='code' size='xs' style={{ overflowWrap: 'anywhere' }}>
                  {dataState.cause.message}
                </Text>
              ) : null}
              <Button size='sm' variant='light' onClick={retry}>
                Retry
              </Button>
            </Stack>
          </Alert>
        ) : null}

        {dataState.status === 'ready' ? (
          <Paper component='section' aria-label='Gear Planner workspace' withBorder className={classes.workspace}>
            <div className={classes.toolbar}>
              <Tabs
                value={activeSetup.id}
                onChange={(id) => {
                  if (id) {
                    setReturnSlot(null)
                    setMode('equipped')
                    applySetupState((current) => selectGearPlannerSetup(current, id))
                  }
                }}
              >
                <Tabs.List>
                  {plannerState.setups.map((setup) => (
                    <Tabs.Tab key={setup.id} value={setup.id}>
                      {setup.name}
                    </Tabs.Tab>
                  ))}
                </Tabs.List>
              </Tabs>
              <Group gap='xs' wrap='nowrap'>
                <Tooltip label='Add setup'>
                  <ActionIcon
                    aria-label='Add setup'
                    variant='light'
                    onClick={() => {
                      setReturnSlot(null)
                      setMode('equipped')
                      applySetupState((current) => addGearPlannerSetup(current, createGearPlannerSetupId()))
                    }}
                  >
                    <IconPlus size={16} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label='Rename active setup'>
                  <ActionIcon
                    aria-label='Rename active setup'
                    variant='light'
                    onClick={() => {
                      setRenameValue(activeSetup.name)
                      setRenameOpen(true)
                    }}
                  >
                    <IconPencil size={16} />
                  </ActionIcon>
                </Tooltip>
                <Menu position='bottom-end'>
                  <Menu.Target>
                    <Button size='compact-xs' variant='default'>
                      Setup actions
                    </Button>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<IconX size={16} />}
                      onClick={() => {
                        setSetupAction('Clear')
                      }}
                    >
                      Clear setup…
                    </Menu.Item>
                    <Menu.Item
                      color='red'
                      leftSection={<IconTrash size={16} />}
                      disabled={plannerState.setups.length <= 1}
                      onClick={() => {
                        setSetupAction('Delete')
                      }}
                    >
                      Delete setup…
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            </div>
            {renameOpen ? (
              <Group gap='xs' wrap='nowrap'>
                <TextInput
                  aria-label='Setup name'
                  value={renameValue}
                  onChange={(event) => {
                    setRenameValue(event.currentTarget.value)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      if (!renameValue.trim()) {
                        setFeedback({ kind: 'error', message: 'Setup name cannot be blank.' })
                        return
                      }
                      applySetupState((current) => renameGearPlannerSetup(current, activeSetup.id, renameValue))
                      setRenameOpen(false)
                    }
                  }}
                  flex={1}
                />
                <Button
                  size='xs'
                  onClick={() => {
                    if (!renameValue.trim()) {
                      setFeedback({ kind: 'error', message: 'Setup name cannot be blank.' })
                      return
                    }
                    applySetupState((current) => renameGearPlannerSetup(current, activeSetup.id, renameValue))
                    setRenameOpen(false)
                  }}
                >
                  Save name
                </Button>
                <Button
                  size='xs'
                  variant='subtle'
                  onClick={() => {
                    setRenameOpen(false)
                  }}
                >
                  Cancel
                </Button>
              </Group>
            ) : null}
            {feedback?.kind === 'success' ? (
              <Notification icon={<IconCheck size={16} />} color='green' withCloseButton={false} role='status'>
                <Text size='sm'>{feedback.message}</Text>
                <ImportDetails issues={feedback.issues} />
              </Notification>
            ) : null}
            {feedback?.kind === 'error' ? (
              <Notification icon={<IconAlertTriangle size={16} />} color='red' withCloseButton={false} role='alert'>
                <Text size='sm'>{feedback.message}</Text>
                <ImportDetails issues={feedback.issues} />
              </Notification>
            ) : null}
            <div className={classes.columns} data-detail={detailOnMobile || undefined}>
              <nav className={classes.slots} ref={slotListRef} aria-label='Equipment slots'>
                {owners.length > 1 && (
                  <Select
                    mx='xs'
                    mt='xs'
                    label='Equipment for'
                    value={owner}
                    data={owners}
                    allowDeselect={false}
                    onChange={(value) => {
                      const target = owners.find((o) => o === value)
                      if (target) {
                        setReturnSlot(null)
                        setSlot(ownerSlots[target][0])
                        setMode('equipped')
                      }
                    }}
                  />
                )}
                <Group className={classes.paneHeading} justify='space-between'>
                  <Title order={2} size='h4'>
                    Equipment
                  </Title>
                  <Stack gap={3} align='flex-end'>
                    <Text size='xs' c='dimmed'>
                      {equippedKeys.length} / {slots.length} equipped
                    </Text>
                    <span className={classes.loadoutMeter} aria-hidden>
                      {slots.map((name) => (
                        <i key={name} data-filled={equipment[name] ? true : undefined} />
                      ))}
                    </span>
                  </Stack>
                </Group>
                {equippedKeys.length > 0 && (
                  <Button
                    variant='subtle'
                    size='compact-xs'
                    mx='sm'
                    my={4}
                    onClick={() => {
                      setDetailsCollapsed(equippedKeys, !allCollapsed)
                    }}
                  >
                    {allCollapsed ? 'Expand all' : 'Collapse all'}
                  </Button>
                )}
                <div className={classes.slotList}>
                  {slots.map((name) => {
                    const equipped = equipment[name]
                    const SlotIcon = slotIcons[name]
                    return (
                      <UnstyledButton
                        key={name}
                        type='button'
                        className={classes.slot}
                        aria-label={`Select ${name}`}
                        aria-current={slot === name ? true : undefined}
                        title={equipped?.source.name}
                        aria-description={equipped?.source.name ?? 'Empty'}
                        aria-controls='gear-detail-panel'
                        data-testid={`gear-slot-${name}`}
                        onClick={() => {
                          selectSlot(name)
                        }}
                      >
                        <span className={classes.slotIcon} data-equipped={equipped ? true : undefined}>
                          <SlotIcon aria-hidden size={19} stroke={1.6} />
                        </span>
                        <Stack
                          gap={0}
                          miw={0}
                          flex={1}
                          className={
                            equipped && collapsedItems.has(itemKey(equipped)) ? classes.compactSlot : undefined
                          }
                        >
                          <Text fw={600} size='sm'>
                            {name}
                          </Text>
                          <Text size='xs' c='dimmed' truncate>
                            {equipped?.source.name ?? 'Empty'}
                          </Text>
                        </Stack>
                        <IconChevronRight aria-hidden size={14} />
                      </UnstyledButton>
                    )
                  })}
                </div>
              </nav>
              <section id='gear-detail-panel' className={classes.detail} aria-labelledby='gear-detail-title'>
                <Group className={classes.paneHeading} wrap='nowrap'>
                  <ActionIcon
                    variant='subtle'
                    className={classes.back}
                    aria-label='Back to equipment'
                    onClick={backToEquipment}
                  >
                    <IconArrowLeft size={18} />
                  </ActionIcon>
                  <Title order={2} size='h4' id='gear-detail-title' ref={detailHeadingRef} tabIndex={-1}>
                    {finding
                      ? owner === 'Character'
                        ? 'Find gear across slots'
                        : 'Find gear for ' + owner
                      : browsing
                        ? `Select item for ${slot}`
                        : slot}
                  </Title>
                  {!finding && returnSlot && (
                    <Button
                      size='compact-sm'
                      variant='light'
                      ml='auto'
                      onClick={() => {
                        findGear()
                      }}
                    >
                      Back to results
                    </Button>
                  )}
                  {(finding || (replacing && selectedItem)) && (
                    <Button
                      size='compact-sm'
                      variant='subtle'
                      ml='auto'
                      onClick={() => {
                        setMode('equipped')
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </Group>
                {(finding || returnSlot !== null) && (
                  <div
                    key={activeSetup.id + '-find-' + String(findRequest.revision)}
                    className={classes.detailBody}
                    hidden={!finding}
                  >
                    {renderBrowser(true)}
                  </div>
                )}
                {!finding && (
                  <div
                    key={activeSetup.id + slot + String(browsing) + (typeof mode === 'object' ? 'equipped' : mode)}
                    className={classes.detailBody}
                  >
                    {!browsing && selectedItem ? (
                      <EquipmentEditor
                        openSet={openSet}
                        sets={setState.memberships
                          .filter(
                            (membership) =>
                              membership.category === 'equipped-item' && membership.itemId === selectedItem.id
                          )
                          .map((membership) => membership.setName)}
                        initialFiligreeSlot={typeof mode === 'object' ? mode.filigreeSlot : undefined}
                        onFiligreeClose={() => {
                          setMode('equipped')
                        }}
                        key={slot}
                        slot={slot}
                        item={selectedItem}
                        collapsed={collapsedItems.has(itemKey(selectedItem))}
                        toggleDetails={() => {
                          const key = itemKey(selectedItem)
                          setDetailsCollapsed([key], !collapsedItems.has(key))
                        }}
                        data={dataState.data}
                        essenceData={dataState.essenceData}
                        effects={effects.filter(
                          (effect) =>
                            effect.slot === slot &&
                            (effect.category === 'crafting' ||
                              effect.category === 'equipped-item' ||
                              effect.category === 'reforging-tier' ||
                              effect.category === 'reforging-choice' ||
                              effect.category === 'essence')
                        )}
                        conflictSources={conflictSources}
                        conflicts={conflicts}
                        slottedAugments={slottedAugments}
                        slottedCurses={slottedCurses}
                        slottedFiligrees={slottedFiligrees}
                        unlockedFiligreeSlots={unlockedFiligreeSlots}
                        essenceCrafting={essenceCrafting}
                        reforging={reforging}
                        effectiveAugmentSlots={effectiveAugmentSlots}
                        openBrowser={() => {
                          setMode('replace')
                        }}
                        clearSlot={(currentSlot) => {
                          equip(currentSlot, null)
                        }}
                        setAugment={(itemId, slotIndex, augment) => {
                          applySetupState((current) =>
                            setGearPlannerSetupAugment(current, itemId, slotIndex, augment, dataState.data.reforging)
                          )
                        }}
                        setCraft={(itemId, system, choiceId) => {
                          applySetupState((current) =>
                            setGearPlannerSetupCraft(current, slot, itemId, system, choiceId, dataState.data.crafting)
                          )
                        }}
                        setCurse={(itemId, curseId) => {
                          applySetupState((current) =>
                            setGearPlannerSetupCurse(current, itemId, curseId, dataState.data.curses)
                          )
                        }}
                        setFiligree={(itemId, slotIndex, filigree) => {
                          applySetupState((current) =>
                            setGearPlannerSetupFiligree(current, itemId, slotIndex, filigree)
                          )
                        }}
                        setUnlockedFiligreeSlots={(itemId, count) => {
                          applySetupState((current) => setGearPlannerSetupUnlockedFiligreeSlots(current, itemId, count))
                        }}
                        setEssenceConfiguration={(itemId, update) => {
                          applySetupState((current) =>
                            setGearPlannerSetupEssenceCraftingConfiguration(
                              current,
                              itemId,
                              update,
                              dataState.essenceData
                            )
                          )
                        }}
                        setReforging={(itemId, stage, update) => {
                          applySetupState((current) =>
                            setGearPlannerSetupReforgingState(current, itemId, stage, update, dataState.data.reforging)
                          )
                        }}
                      />
                    ) : (
                      renderBrowser(false)
                    )}
                  </div>
                )}
              </section>
            </div>
            <Modal
              opened={setupAction !== null}
              onClose={() => {
                setSetupAction(null)
              }}
              title={setupAction ? setupAction + ' setup?' : undefined}
              centered
            >
              <Stack gap='md'>
                <Text size='sm'>
                  <strong>{activeSetup.name}</strong> ·{' '}
                  {setupAction === 'Clear'
                    ? 'Remove all equipment and reset character settings and level filters?'
                    : 'Permanently delete this setup?'}
                </Text>
                <Group justify='flex-end'>
                  <Button
                    variant='subtle'
                    data-autofocus
                    onClick={() => {
                      setSetupAction(null)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    color='red'
                    onClick={() => {
                      setReturnSlot(null)
                      if (setupAction === 'Clear') {
                        applySetupState((current) => clearGearPlannerSetup(current, activeSetup.id))
                        setFeedback({ kind: 'success', message: activeSetup.name + ' cleared.' })
                      } else if (setupAction === 'Delete') {
                        applySetupState((current) => deleteGearPlannerSetup(current, activeSetup.id))
                      }
                      setSetupAction(null)
                    }}
                  >
                    {setupAction} setup
                  </Button>
                </Group>
              </Stack>
            </Modal>
          </Paper>
        ) : null}
      </Stack>
    </WorkspaceLayout>
  )
}

export default function GearPlannerPage() {
  return (
    <TroveProvider>
      <GearPlannerWorkspace />
    </TroveProvider>
  )
}
