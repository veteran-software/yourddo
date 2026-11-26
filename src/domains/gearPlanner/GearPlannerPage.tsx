import { keyedEntries } from '../../shared/ui/keyedEntries'
import KnownDiscrepancies from './components/KnownDiscrepancies'
import {
  type CharacterSettings,
  violatesDruidicOath,
  characterAllowsItem,
  catalogWeaponTypes,
  enabledOwners,
  type GearOwner,
  ownerSlots,
  slotOwner
} from './character'
import { UpgradePathsTool, UpgradeResults } from './tools/UpgradePathsTool'
import type { PathRequest } from './upgradePaths'
import SlotUpgrades from './components/SlotUpgrades'
import LoadoutComparison from './components/LoadoutComparison'
import AugmentsTool from './tools/AugmentsTool'
import FarmingTool from './tools/FarmingTool'
import LevelRangeInputs, { type LevelRange } from './components/LevelRangeInputs'
import FocusStatEditor from './tools/FocusStatEditor'
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
import FiligreeSetBrowser from './components/FiligreeSetBrowser'
import { TroveOwnership, OwnedFilter, TroveImport } from './components/TroveInventory'
import { createCandidateComparison, matchesGearEffect, type GearFindTarget } from './finding'
import { useSlotView } from '../../shared/layout/plannerView'
import { PlannerViewToolbar } from '../../shared/layout/PlannerViewToolbar'
import classes from '../../shared/layout/PlannerWorkspace.module.css'
import workspace from '../../shared/layout/workspace.module.css'
import ItemCraftingSelector from './components/ItemCraftingSelector.tsx'
import {
  ActionIcon,
  Autocomplete,
  Anchor,
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
  IconCopy,
  IconColumns2,
  IconUserCog,
  IconMapPin,
  IconRoute,
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
  isGearPlannerMinorArtifact,
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
  equipmentWithReforgedSets,
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
  type GearPlannerSetup,
  duplicateGearPlannerSetup,
  nextSetupName,
  exchangeSetupAugments,
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

function GearItemArt({
  item,
  slot,
  size
}: Readonly<{ item: GearPlannerItem; slot: GearPlannerItem['slot']; size: number }>) {
  const SlotIcon = slotIcons[slot]
  return (
    <span className={classes.itemArt} style={{ width: size, height: size }} aria-hidden>
      {item.source.iconLayers?.length ? (
        keyedEntries(item.source.iconLayers).map(({ key, value: src }) => (
          <img key={key} alt='' src={src} width={size} height={size} style={{ gridArea: '1 / 1' }} />
        ))
      ) : (
        <ItemIcon item={item.source} size={size} />
      )}
      <SlotIcon size='60%' stroke={1.6} />
    </span>
  )
}

function ItemCompendiumLink({ item }: Readonly<{ item: GearPlannerItem }>) {
  if (item.source.catalogId === undefined) return null
  return (
    <Anchor
      size='xs'
      href={'https://ddocompendium.com/w/' + encodeURIComponent(item.source.name)}
      target='_blank'
      rel='noreferrer'
    >
      DDO Compendium
    </Anchor>
  )
}

const itemMetadata = (item: GearPlannerItem, essenceMinimumLevel?: number) =>
  [
    `ML ${String(essenceMinimumLevel ?? item.minimumLevel)}`,
    isEssenceCraftedGearPlannerItem(item) ? 'Essence Crafted' : gearPlannerItemType(item),
    isGearPlannerMinorArtifact(item) ? 'Minor Artifact' : ''
  ]
    .filter(Boolean)
    .join(' · ')

interface EquipmentEditorProps {
  findSlotUpgrades: () => void
  character: CharacterSettings
  inline: boolean
  sets: readonly string[]
  openSet: (name: string) => void
  initialFiligreeSlot?: number
  onFiligreeClose: () => void
  collapsed: boolean
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
  findSlotUpgrades,
  character,
  inline,
  sets,
  openSet,
  initialFiligreeSlot,
  onFiligreeClose,
  collapsed,
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
  <Stack gap='md' p={inline ? 'xs' : 'md'} data-testid='gear-item-editor'>
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
            <ItemCompendiumLink item={item} />
            <ItemMaterial item={item} selectedMaterial={essenceCrafting[item.id]?.material} />
          </Group>
          {violatesDruidicOath(character, item, essenceCrafting[item.id]?.material) && (
            <Text size='xs' c='orange'>
              Violates Druidic Oath. Change the gear or allow metal in Character Setup.
            </Text>
          )}
          <ItemSetLinks names={sets} onOpen={openSet} />
          <TroveOwnership name={item.source.name} />
        </Stack>
      </Group>
      <Group gap='xs'>
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
        <Button size='xs' variant='light' leftSection={<IconRoute size={15} />} onClick={findSlotUpgrades}>
          Find upgrades
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
    <div id={'gear-item-details-' + slot.replaceAll(' ', '-')} hidden={collapsed}>
      {!collapsed && (
        <Stack gap='md'>
          <KnownDiscrepancies notes={item.source.discrepancyNotes} />
          <div className={classes.editorSections}>
            {effects.length > 0 && (
              <div className={classes.effects}>
                <EquippedEnchantmentList
                  compact={inline}
                  sources={effects}
                  conflicts={conflicts}
                  label={`${slot} enchantments`}
                />
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
                  enchantmentNames={data.augmentEnchantmentNames}
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
                  character={character}
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
  missingWeaponFilters: readonly string[]
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

function incumbentSetLabel(
  memberships: readonly GearPlannerSetMembership[],
  incumbent: GearPlannerItem | null,
  setName: string | null
) {
  if (!incumbent || !setName) return undefined
  const inSet = memberships.some(
    (membership) =>
      membership.category === 'equipped-item' && membership.itemId === incumbent.id && membership.setName === setName
  )
  return inSet ? `Member of ${setName}` : `Outside ${setName}`
}

function candidateSlotLabel(equipped: boolean, incumbent: GearPlannerItem | null) {
  if (equipped) return 'Currently equipped'
  return incumbent ? `Replaces ${incumbent.source.name}` : 'Empty slot'
}

function emptyCatalogMessage(slot: string | null, mainHand: GearPlannerItem | null) {
  if (slot === 'Off Hand' && mainHand && occupiesBothHands(mainHand)) {
    return `${mainHand.source.name} occupies both hands. Change your main-hand weapon to equip an off-hand item.`
  }
  return 'No equipment matches these filters.'
}

const ItemBrowser = ({
  memberships,
  openSet,
  equippedFiligrees,
  openFiligree,
  catalogItems,
  missingWeaponFilters,
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
  const effectTarget = target?.kind === 'effect' ? target : undefined
  const [search, setSearch] = useState(effectTarget?.name ?? '')
  const [exactEffect, setExactEffect] = useState(target?.kind === 'effect')
  const [type, setType] = useState<string | null>(null)
  const [setName, setSetName] = useState<string | null>(target?.kind === 'item' ? target.name : null)
  const [visibleCount, setVisibleCount] = useState(pageSize)
  const [collapsedSheets, setCollapsedSheets] = useState<ReadonlySet<string>>(() => new Set())
  const [catalog, setCatalog] = useState(target?.kind === 'filigree' ? 'Filigrees' : 'Equipment')
  const [slotFilter, setSlotFilter] = useState<string | null>(null)
  const [bonusType, setBonusType] = useState<string | null>(effectTarget?.bonusType ?? null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const filtersId = useId()
  const filterSlot = finding ? slotFilter : slot
  const effectQuery = search.trim().toLowerCase()
  const { inventory, ownedOnly, setOwnedOnly } = useTroveInventory()
  const candidates = useMemo(() => {
    return catalogItems.filter(
      ({ item }) =>
        (!filterSlot || item.slot === filterSlot) &&
        (item.slot !== 'Off Hand' || allowsOffHand(equipment['Main Hand'], item))
    )
  }, [catalogItems, equipment, filterSlot])
  const bonusTypes = useMemo(
    () =>
      finding
        ? [
            ...new Set(candidates.flatMap(({ effects }) => effects.map((effect) => normalizeBonusType(effect.bonus))))
          ].sort((left, right) => left.localeCompare(right))
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
            (augment.name.toLowerCase().includes(effectQuery) ||
              augment.searchLabels?.some((label) => label.toLowerCase().includes(effectQuery)))
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
      id: 'slot',
      label: slotFilter,
      clear: () => {
        setSlotFilter(null)
      }
    },
    {
      id: 'type',
      label: type,
      clear: () => {
        setType(null)
      }
    },
    {
      id: 'set',
      label: setName,
      clear: () => {
        setSetName(null)
      }
    },
    {
      id: 'bonus',
      label: bonusType && bonusType + ' bonus',
      clear: () => {
        setBonusType(null)
      }
    },
    {
      id: 'levels',
      label:
        (minimumLevel !== gearPlannerMinimumLevel || maximumLevel !== gearPlannerMaximumLevel) &&
        `ML ${String(minimumLevel)}–${String(maximumLevel)}`,
      clear: () => {
        updateLevels({ minimumLevel: gearPlannerMinimumLevel, maximumLevel: gearPlannerMaximumLevel })
      }
    },
    {
      id: 'conflicts',
      label: showConflicts && 'Include lesser items',
      clear: () => {
        onShowConflicts(false)
      }
    },
    {
      id: 'owned',
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
      {catalog === 'Equipment' &&
        missingWeaponFilters.length > 0 &&
        (!filterSlot || filterSlot === 'Main Hand' || filterSlot === 'Off Hand') && (
          <Text size='sm' c='orange'>
            Saved weapon filter unavailable: {missingWeaponFilters.join(', ')}. Open Character setup to replace or clear
            it.
          </Text>
        )}
      {catalog === 'Filigrees' && (
        <FiligreeSetBrowser
          data={data}
          equipped={equippedFiligrees}
          openSlot={openFiligree}
          initialQuery={search}
          initialSet={target?.kind === 'filigree' ? target.name : undefined}
        />
      )}
      {catalog !== 'Filigrees' && (
        <>
          {data.enchantmentNames ? (
            <Autocomplete
              label={exactEffect ? 'Exact enchantment' : 'Search items'}
              placeholder={finding ? 'Name, enchantment or set' : 'Name or effect'}
              data={data.enchantmentNames}
              value={search}
              limit={30}
              clearable
              clearButtonProps={{ 'aria-label': 'Clear search' }}
              onChange={setSearch}
              onInput={() => {
                setExactEffect(false)
              }}
              onClear={() => {
                setExactEffect(false)
              }}
              onOptionSubmit={() => {
                setExactEffect(true)
              }}
            />
          ) : (
            <CatalogSearch
              label={exactEffect ? 'Exact enchantment' : 'Search items'}
              placeholder={finding ? 'Name, enchantment or set' : 'Name or effect'}
              value={search}
              onChange={(value) => {
                setExactEffect(false)
                setSearch(value)
              }}
            />
          )}
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
                  ({ id, label, clear }) =>
                    label && (
                      <Button
                        key={id}
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
              <LevelRangeInputs minimumLevel={minimumLevel} maximumLevel={maximumLevel} updateLevels={updateLevels} />

              {types.length > 1 && (
                <Select
                  label='Item type'
                  placeholder='All types'
                  clearable
                  data={types}
                  value={type}
                  onChange={setType}
                />
              )}
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
                <Group gap='xs' key={gearPlannerAugmentIdentity(augment)}>
                  <Text size='sm'>
                    {augment.name} · {augment.augmentType} · ML {augment.minLevel}
                  </Text>
                  <TroveOwnership name={augment.name} />
                </Group>
              ))}
            </Stack>
          )}

          <ul className={classes.results} data-finder={finding || undefined}>
            {filtered.slice(0, visibleCount).map(({ item, sets: itemSets, effects, craftGroups }) => {
              const incumbent = equipment[item.slot]
              const equipped = incumbent?.id === item.id
              const membershipLabel = incumbentSetLabel(memberships, incumbent, setName)
              const essence = equipped ? essenceCrafting[item.id] : undefined
              const setSources = craftGroups
                .filter((group) => !setName || group.sets.includes(setName))
                .map((group) => group.label)
              const matchingRecipes =
                (effectQuery || bonusType) && (item.essenceCrafting || item.slaveLordsBase)
                  ? [
                      ...new Set(
                        effects.flatMap((effect) =>
                          effect.craft && matchesGearEffect(effect, effectQuery, bonusType, exactEffect)
                            ? [effect.craft]
                            : []
                        )
                      )
                    ]
                  : []
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
                        <ItemCompendiumLink item={item} />
                        {finding && (!equipped || membershipLabel) && (
                          <Text size='xs' c='dimmed'>
                            {[candidateSlotLabel(equipped, incumbent), membershipLabel].filter(Boolean).join(' · ')}
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
                      {matchingRecipes.length > 1 && item.slaveLordsBase ? (
                        <details>
                          <Text component='summary' size='xs'>
                            {matchingRecipes.length} matching upgrades
                          </Text>
                          {matchingRecipes.map((recipe) => (
                            <Text key={recipe} size='xs'>
                              {recipe}
                            </Text>
                          ))}
                        </details>
                      ) : (
                        matchingRecipes.map((recipe) => (
                          <Text key={recipe} size='xs'>
                            Craftable {recipe}
                          </Text>
                        ))
                      )}
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
          {filtered.length === 0 && <Text c='dimmed'>{emptyCatalogMessage(filterSlot, equipment['Main Hand'])}</Text>}
          {visibleCount < filtered.length && (
            <Button
              variant='subtle'
              onClick={() => {
                setVisibleCount((current) => current + pageSize)
              }}
            >
              Show {String(Math.min(pageSize, filtered.length - visibleCount))} more
            </Button>
          )}
        </>
      )}
    </Stack>
  )
}

function resolveEquipmentSlots(owners: readonly GearOwner[], requestedSlot: GearPlannerSlot) {
  const slot = owners.includes(slotOwner(requestedSlot)) ? requestedSlot : 'Eyes'
  const owner = slotOwner(slot)
  const slots: readonly GearPlannerSlot[] = owner === 'Character' ? characterSlotLayout : ownerSlots[owner]
  return { slot, owner, slots }
}

function gearDetailTitle(
  showingPaths: boolean,
  finding: boolean,
  owner: string,
  browsing: boolean,
  slot: GearPlannerSlot
) {
  if (showingPaths) return 'Upgrade paths'
  if (finding) return owner === 'Character' ? 'Find gear across slots' : 'Find gear for ' + owner
  return browsing ? `Select item for ${slot}` : slot
}

const GearPlannerWorkspace = () => {
  const [dataState, setDataState] = useState<DataState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const [plannerState, setPlannerState] = useState(createDefaultGearPlannerState)
  const [requestedSlot, setRequestedSlot] = useState<GearPlannerSlot>('Eyes')
  const [mode, setMode] = useState<'equipped' | 'replace' | 'find' | 'paths' | { filigreeSlot: number }>('equipped')
  const [pathSearch, setPathSearch] = useState<{
    request: PathRequest
    setup: GearPlannerSetup
    owner: string
    revision: number
  } | null>(null)
  const [findRequest, setFindRequest] = useState<{ revision: number; target?: GearFindTarget }>({ revision: 0 })
  const [returnSlot, setReturnSlot] = useState<GearPlannerSlot | null>(null)
  const finding = mode === 'find'
  const replacing = mode === 'replace'
  const [showConflicts, setShowConflicts] = useState(false)
  const [view, setView] = useSlotView('gear-planner')
  const [detailOnMobile, setDetailOnMobile] = useState(false)
  const slotListRef = useRef<HTMLElement>(null)
  const detailHeadingRef = useRef<HTMLHeadingElement>(null)
  const selectSlot = (next: GearPlannerSlot) => {
    setReturnSlot(null)
    setRequestedSlot(next)
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
  const [upgradeSlot, setUpgradeSlot] = useState<GearPlannerSlot | null>(null)
  const [compareOpen, setCompareOpen] = useState(false)
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
  const { slot, owner, slots } = resolveEquipmentSlots(owners, requestedSlot)
  const showingPaths = mode === 'paths' && pathSearch?.setup === activeSetup && pathSearch.owner === owner
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
      collectEquippedEffects(equipment, slottedAugments, slottedFiligrees, slottedCurses, {
        essenceData: dataState.status === 'ready' ? dataState.essenceData : undefined,
        essenceCrafting,
        reforgingData: dataState.status === 'ready' ? dataState.data.reforging : undefined,
        reforging
      }),
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
              dataState.status === 'ready'
                ? equipmentWithReforgedSets(loadout, reforging, dataState.data.reforging)
                : loadout,
              slottedAugments,
              dataState.status === 'ready' ? dataState.data.standardSets : undefined,
              slottedFiligrees,
              filigreeDefinitions,
              effectiveAugmentSlots
            )
          ] as const
        })
      ),
    [
      owners,
      equipment,
      reforging,
      slottedAugments,
      dataState,
      slottedFiligrees,
      filigreeDefinitions,
      effectiveAugmentSlots
    ]
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
  const weaponTypes = useMemo(
    () => (dataState.status === 'ready' ? catalogWeaponTypes(dataState.data) : []),
    [dataState]
  )
  const unavailableWeaponsOnly =
    activeSetup.character.weapons.length > 0 &&
    !activeSetup.character.weapons.some((type) => weaponTypes.includes(type))
  const catalogItems = useMemo(
    () =>
      dataState.status === 'ready'
        ? prepareGearPlannerCandidates(
            slots
              .flatMap((s) => [
                ...getEssenceCraftedGearPlannerItems(s, activeSetup.minimumLevel).filter(
                  (item) => !unavailableWeaponsOnly || item.essenceCrafting?.itemCategoryId !== 'weapon'
                ),
                ...dataState.data.itemsBySlot[s]
              ])
              .filter((item) => characterAllowsItem(activeSetup.character, item, essenceCrafting[item.id]?.material)),
            dataState.data,
            dataState.essenceData
          )
        : [],
    [dataState, slots, activeSetup.minimumLevel, activeSetup.character, essenceCrafting, unavailableWeaponsOnly]
  )
  function findGear(target?: GearFindTarget) {
    if (returnSlot && !target) {
      if (slotOwner(returnSlot) !== owner) setRequestedSlot(returnSlot)
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
  function updateLevels(update: Partial<LevelRange>) {
    applySetupState((current) => updateGearPlannerSetupLevels(current, activeSetup.id, update))
  }

  const tools: readonly WorkspaceTool[] = [
    ...(dataState.status === 'ready'
      ? [
          {
            id: 'character',
            label: 'Character setup',
            icon: <IconUserCog stroke={2} />,
            content: (
              <CharacterSetupTool
                focusEditor={
                  <FocusStatEditor
                    data={dataState.data}
                    owner={owner}
                    effects={effects}
                    names={activeSetup.character.focusStats ?? []}
                    onChange={(focusStats) => {
                      applySetupState((current) =>
                        updateSetupCharacter(current, activeSetup.id, { ...activeSetup.character, focusStats })
                      )
                    }}
                  />
                }
                levels={activeSetup}
                updateLevels={updateLevels}
                weaponTypes={weaponTypes}
                settings={activeSetup.character}
                onChange={(character) => {
                  applySetupState((current) => updateSetupCharacter(current, activeSetup.id, character))
                }}
              />
            )
          }
        ]
      : []),
    {
      id: 'enchantments',
      label: 'Enchantments',
      icon: <IconListDetails stroke={2} />,
      renderContent: (revealWorkspace) => (
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
      renderContent: (revealWorkspace) => (
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
            id: 'augments',
            label: 'Augments',
            icon: <IconDiamond stroke={2} />,
            renderContent: (revealWorkspace: () => void) => (
              <AugmentsTool
                key={activeSetup.id}
                setup={activeSetup}
                augments={dataState.data.augments}
                enchantmentNames={dataState.data.augmentEnchantmentNames}
                slots={effectiveAugmentSlots}
                effects={allEffects}
                onChange={(socket, augment) => {
                  applySetupState((current) =>
                    setGearPlannerSetupAugment(current, socket.item.id, socket.index, augment, dataState.data.reforging)
                  )
                }}
                onExchange={(from, to) => {
                  applySetupState((current) =>
                    exchangeSetupAugments(current, activeSetup.id, from, to, dataState.data.reforging)
                  )
                }}
                openSet={(name) => {
                  revealWorkspace()
                  openSet(name)
                }}
              />
            )
          },
          {
            id: 'upgrade-paths',
            label: 'Upgrade paths',
            icon: <IconRoute stroke={2} />,
            renderContent: (revealWorkspace: () => void) => (
              <UpgradePathsTool
                effects={effects}
                key={activeSetup.id + owner}
                owner={owner}
                setup={activeSetup}
                data={dataState.data}
                sets={setState}
                initial={
                  pathSearch?.setup === activeSetup && pathSearch.owner === owner ? pathSearch.request : undefined
                }
                onFind={(request) => {
                  setPathSearch((current) => ({
                    request,
                    setup: activeSetup,
                    owner,
                    revision: (current?.revision ?? 0) + 1
                  }))
                  setReturnSlot(null)
                  setMode('paths')
                  setDetailOnMobile(true)
                  revealWorkspace()
                  requestAnimationFrame(() => detailHeadingRef.current?.focus({ preventScroll: true }))
                }}
              />
            )
          },
          {
            id: 'farming',
            label: 'Farming list',
            icon: <IconMapPin stroke={2} />,
            content: <FarmingTool key={activeSetup.id} setup={activeSetup} />
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
                  setRequestedSlot(
                    characterSlotLayout.find((s) => activeGearPlannerSetup(state).equipment[s]) ?? 'Eyes'
                  )
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
        setRequestedSlot(characterSlotLayout.find((s) => activeGearPlannerSetup(restored.state).equipment[s]) ?? 'Eyes')
        setPlannerState(restored.state)
        legacySaveImported.current = restored.legacySaveImported === true
        setPersistenceEnabled(false)
        if (restored.issues.length && !restored.carryover) {
          setFeedback({
            kind: 'error',
            message: 'Some saved selections could not be restored from the current catalog.',
            issues: restored.issues
          })
        }
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
      setRequestedSlot(characterSlotLayout.find((s) => activeGearPlannerSetup(imported.state).equipment[s]) ?? 'Eyes')
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
    setRequestedSlot(targetSlot)
    setPlannerState((current) => equipGearPlannerSetupItem(current, targetSlot, item, dataState.essenceData))
    setMode('equipped')
    setPersistenceEnabled(true)
    if (view === 'grid' && !finding) {
      setDetailOnMobile(false)
      requestAnimationFrame(() =>
        slotListRef.current?.querySelector<HTMLButtonElement>('[aria-current="true"]')?.focus({ preventScroll: true })
      )
      return
    }
    requestAnimationFrame(() => detailHeadingRef.current?.focus({ preventScroll: true }))
  }

  const applySetupState = (transition: (state: GearPlannerSetupsState) => GearPlannerSetupsState) => {
    setPlannerState((current) => transition(current))
    setPersistenceEnabled(true)
  }

  const duplicateSetup = () => {
    const id = createGearPlannerSetupId()
    applySetupState((current) => duplicateGearPlannerSetup(current, id))
    setCompareOpen(false)
    setReturnSlot(null)
    setMode('equipped')
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
          setRequestedSlot(item.slot)
          setDetailOnMobile(true)
          setMode({ filigreeSlot: slotIndex })
        }}

        target={isFinder ? findRequest.target : undefined}
        effectiveAugmentSlots={effectiveAugmentSlots}
        essenceCrafting={essenceCrafting}
        missingWeaponFilters={unavailableWeaponsOnly && owner === 'Character' ? activeSetup.character.weapons : []}
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
        updateLevels={updateLevels}
        onMinorArtifactRejected={() => {
          setFeedback({ kind: 'error', message: 'Only one minor artifact can be equipped at a time.' })
        }}
      />
    )

  function renderDetailsCaret(item: GearPlannerItem) {
    const key = itemKey(item)
    const collapsed = collapsedItems.has(key)
    const label = collapsed ? 'Expand details' : 'Collapse details'
    return (
      <ActionIcon
        variant='subtle'
        size='sm'
        aria-label={label}
        title={label}
        aria-expanded={!collapsed}
        aria-controls={'gear-item-details-' + item.slot.replaceAll(' ', '-')}
        onClick={() => {
          setDetailsCollapsed([key], !collapsed)
        }}
      >
        {collapsed ? <IconChevronRight size={16} aria-hidden /> : <IconChevronDown size={16} aria-hidden />}
      </ActionIcon>
    )
  }

  const renderEquipmentEditor = (cardSlot: GearPlannerSlot, cardItem: GearPlannerItem, inline: boolean) =>
    dataState.status === 'ready' && (
      <EquipmentEditor
        findSlotUpgrades={() => {
          setUpgradeSlot(cardSlot)
        }}
        character={activeSetup.character}
        inline={inline}
        openSet={openSet}
        sets={setState.memberships
          .filter((membership) => membership.category === 'equipped-item' && membership.itemId === cardItem.id)
          .map((membership) => membership.setName)}
        initialFiligreeSlot={!inline && typeof mode === 'object' ? mode.filigreeSlot : undefined}
        onFiligreeClose={() => {
          setMode('equipped')
        }}
        key={cardSlot}
        slot={cardSlot}
        item={cardItem}
        collapsed={collapsedItems.has(itemKey(cardItem))}
        data={dataState.data}
        essenceData={dataState.essenceData}
        effects={effects.filter(
          (effect) =>
            effect.slot === cardSlot &&
            (effect.category === 'augment' ||
              effect.category === 'filigree' ||
              effect.category === 'crafting' ||
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
          selectSlot(cardSlot)
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
            setGearPlannerSetupCraft(current, cardSlot, itemId, system, choiceId, dataState.data.crafting)
          )
        }}
        setCurse={(itemId, curseId) => {
          applySetupState((current) => setGearPlannerSetupCurse(current, itemId, curseId, dataState.data.curses))
        }}
        setFiligree={(itemId, slotIndex, filigree) => {
          applySetupState((current) => setGearPlannerSetupFiligree(current, itemId, slotIndex, filigree))
        }}
        setUnlockedFiligreeSlots={(itemId, count) => {
          applySetupState((current) => setGearPlannerSetupUnlockedFiligreeSlots(current, itemId, count))
        }}
        setEssenceConfiguration={(itemId, update) => {
          applySetupState((current) =>
            setGearPlannerSetupEssenceCraftingConfiguration(current, itemId, update, dataState.essenceData)
          )
        }}
        setReforging={(itemId, stage, update) => {
          applySetupState((current) =>
            setGearPlannerSetupReforgingState(current, itemId, stage, update, dataState.data.reforging)
          )
        }}
      />
    )

  return (
    <WorkspaceLayout tools={tools} scrollMain={false}>
      <Stack className={classes.planner} gap='sm' p={{ base: 'xs', sm: 'md' }}>
        <Group className={`${workspace.banner} ${classes.masthead}`} justify='space-between'>
          <Group gap='sm' wrap='nowrap'>
            <span className={`${workspace.crest} ${classes.crest}`}>
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

        {dataState.status === 'loading' && (
          <Center mih={160} role='status' aria-live='polite'>
            <Stack align='center' gap='xs'>
              <Loader size='sm' />
              <Text c='dimmed' size='sm'>
                Loading Gear Planner data…
              </Text>
            </Stack>
          </Center>
        )}

        {dataState.status === 'error' && (
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
              {import.meta.env.DEV && dataState.cause instanceof Error && (
                <Text component='code' size='xs' style={{ overflowWrap: 'anywhere' }}>
                  {dataState.cause.message}
                </Text>
              )}
              <Button size='sm' variant='light' onClick={retry}>
                Retry
              </Button>
            </Stack>
          </Alert>
        )}

        {dataState.status === 'ready' && (
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
              <Group className={classes.setupActions} gap='xs' wrap='nowrap'>
                <Button
                  size='xs'
                  variant='light'
                  leftSection={<IconColumns2 size={15} />}
                  onClick={() => {
                    setCompareOpen(true)
                  }}
                >
                  Compare
                </Button>
                <Tooltip label='Add setup'>
                  <ActionIcon
                    size='var(--setup-action-size)'
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
                    size='var(--setup-action-size)'
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
                    <Button size='xs' variant='default'>
                      Setup actions
                    </Button>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item leftSection={<IconCopy size={16} />} onClick={duplicateSetup}>
                      Duplicate setup
                    </Menu.Item>

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
              <PlannerViewToolbar
                tools={tools}
                view={view}
                changeView={(next) => {
                  setView(next)
                  setDetailOnMobile(false)
                }}
              />
            </div>
            {upgradeSlot && (
              <SlotUpgrades
                setup={activeSetup}
                slot={upgradeSlot}
                data={dataState.data}
                essence={dataState.essenceData}
                onClose={() => {
                  setUpgradeSlot(null)
                }}
                onEquip={(item) => {
                  equip(upgradeSlot, item)
                  setUpgradeSlot(null)
                }}
              />
            )}
            {compareOpen && (
              <LoadoutComparison
                setups={plannerState.setups}
                active={activeSetup}
                data={dataState.data}
                essence={dataState.essenceData}
                onClose={() => {
                  setCompareOpen(false)
                }}
                duplicate={duplicateSetup}
              />
            )}
            {renameOpen && (
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
            )}
            {feedback?.kind === 'success' && (
              <Notification icon={<IconCheck size={16} />} color='green' withCloseButton={false} role='status'>
                <Text size='sm'>{feedback.message}</Text>
                <ImportDetails issues={feedback.issues} />
              </Notification>
            )}
            {feedback?.kind === 'error' && (
              <Notification icon={<IconAlertTriangle size={16} />} color='red' withCloseButton={false} role='alert'>
                <Text size='sm'>{feedback.message}</Text>
                <ImportDetails issues={feedback.issues} />
              </Notification>
            )}

            <div
              className={classes.columns}
              data-grid={view === 'grid' || undefined}
              data-detail={detailOnMobile || undefined}
            >
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
                        setRequestedSlot(ownerSlots[target][0])
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
                  {(view !== 'grid' || !detailOnMobile) &&
                    slots.map((name) => {
                      const equipped = equipment[name]
                      const SlotIcon = slotIcons[name]
                      const oathViolation =
                        equipped &&
                        violatesDruidicOath(activeSetup.character, equipped, essenceCrafting[equipped.id]?.material)
                      if (view === 'grid')
                        return (
                          <article key={name} className={classes.gearCard} aria-label={name + ' equipment'}>
                            <div className={classes.gearCardHeading}>
                              {equipped && renderDetailsCaret(equipped)}
                              <UnstyledButton
                                className={classes.gearCardSelect}
                                aria-label={'Select ' + name}
                                data-testid={'gear-slot-' + name}
                                aria-current={slot === name || undefined}
                                onClick={() => {
                                  selectSlot(name)
                                  if (equipped) setMode('replace')
                                }}
                              >
                                <SlotIcon size={17} aria-hidden />
                                <strong>{name}</strong>
                                <IconSearch size={15} aria-hidden />
                              </UnstyledButton>
                            </div>
                            {equipped ? (
                              renderEquipmentEditor(name, equipped, true)
                            ) : (
                              <Button
                                variant='subtle'
                                className={classes.emptyCard}
                                aria-label={'Browse gear for ' + name}
                                onClick={() => {
                                  selectSlot(name)
                                }}
                              >
                                Select item
                              </Button>
                            )}
                          </article>
                        )
                      return (
                        <UnstyledButton
                          key={name}
                          type='button'
                          className={classes.slot}
                          aria-label={`Select ${name}`}
                          aria-current={slot === name ? true : undefined}
                          title={equipped?.source.name}
                          aria-description={
                            oathViolation
                              ? equipped.source.name + ' · Violates Druidic Oath'
                              : (equipped?.source.name ?? 'Empty')
                          }
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
                            {oathViolation && (
                              <Text size='xs' c='orange'>
                                Violates Druidic Oath
                              </Text>
                            )}
                          </Stack>
                          <IconChevronRight aria-hidden size={14} />
                        </UnstyledButton>
                      )
                    })}
                </div>
              </nav>
              {(view !== 'grid' || detailOnMobile) && (
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
                      {gearDetailTitle(showingPaths, finding, owner, browsing, slot)}
                    </Title>
                    {!finding && !showingPaths && !browsing && selectedItem && renderDetailsCaret(selectedItem)}
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
                    {(showingPaths || finding || (replacing && selectedItem)) && (
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
                  {showingPaths && (
                    <div className={classes.detailBody}>
                      <UpgradeResults
                        key={pathSearch.revision}
                        request={pathSearch.request}
                        setup={activeSetup}
                        owner={owner}
                        data={dataState.data}
                        essence={dataState.essenceData}
                        onSave={(draft) => {
                          const id = createGearPlannerSetupId()
                          applySetupState((current) => {
                            if (activeGearPlannerSetup(current) !== activeSetup) return current
                            const name = nextSetupName(current.setups, draft.name)
                            return {
                              ...current,
                              setups: [...current.setups, { ...draft, id, name }],
                              activeSetupId: id
                            }
                          })
                          setMode('equipped')
                          setFeedback({ kind: 'success', message: 'Upgrade path saved as a new setup.' })
                        }}
                      />
                    </div>
                  )}
                  {!finding && !showingPaths && (
                    <div
                      key={activeSetup.id + slot + String(browsing) + (typeof mode === 'object' ? 'equipped' : mode)}
                      className={classes.detailBody}
                    >
                      {!browsing && selectedItem
                        ? renderEquipmentEditor(slot, selectedItem, false)
                        : renderBrowser(false)}
                    </div>
                  )}
                </section>
              )}
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
        )}
      </Stack>
    </WorkspaceLayout>
  )
}

export default GearPlannerWorkspace
