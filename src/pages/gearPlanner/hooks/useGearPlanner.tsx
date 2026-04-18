import {
  type JSX,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { Card, Col } from 'react-bootstrap'
import { FaArrowUpRightFromSquare, FaMagnifyingGlass } from 'react-icons/fa6'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks.ts'
import {
  addSetup as addSetupAction,
  equipItem as equipItemAction,
  removeSetup as removeSetupAction,
  setActiveSetup as setActiveSetupAction,
  setAugment as setAugmentAction,
  setCurse as setCurseAction,
  setEssenceEnchantment as setEssenceEnchantmentAction,
  setFiligree as setFiligreeAction,
  setGemSetBonus as setGemSetBonusAction,
  setItemMaterial as setItemMaterialAction,
  setItemMinLevel as setItemMinLevelAction,
  setLostPurposeEnchantment as setLostPurposeEnchantmentAction,
  setNearlyFinishedEnchantment as setNearlyFinishedEnchantmentAction,
  setRitualTableEnchantment as setRitualTableEnchantmentAction,
  setUnlockedFiligreeSlots as setUnlockedFiligreeSlotsAction
} from '../../../redux/slices/gearPlannerSlice.ts'
import { getTroveKey } from '../../../utils/troveUtils.ts'
import AugmentSlotItem from '../components/AugmentSlotItem.tsx'
import CurseSlotItem from '../components/CurseSlotItem.tsx'
import EnchantmentList from '../components/EnchantmentList.tsx'
import EssenceCraftingSelector from '../components/EssenceCraftingSelector.tsx'
import GemSetBonusSelector from '../components/GetSetBonusSelector.tsx'
import ItemSetBonusDisplay from '../components/ItemSetBonusDisplay.tsx'
import LostPurposeSelector from '../components/LostPurposeSelector.tsx'
import NearlyFinishedSelector from '../components/NearlyFinishedSelector.tsx'
import RitualTableSelector from '../components/RitualTableSelector.tsx'
import TroveBadge from '../components/TroveBadge.tsx'
import {
  checkPotentialConflict,
  getSlotOwner,
  normalizeString,
  resolveConflicts
} from '../conflictResolver.ts'
import {
  type EssenceEnchantment,
  loadCurses,
  loadEssenceEnchantments,
  loadFiligreeSets,
  loadGearData,
  loadSetBonusIndex
} from '../dataLoader.ts'
import { getMaxFiligreeSlots, isMinorArtifact } from '../helpers'
import {
  CLASS_PROFICIENCIES,
  type Curse,
  type GearAugment,
  type GearItem,
  type GearSetup,
  GearSlot,
  type LootDropLocation,
  type LootEnchantment,
  type LootItem,
  type SetBonusIndex,
  SHIELD_TYPES,
  WEAPON_TYPES
} from '../types.ts'

/**
 * A hook function used to manage and interact with the gear planner state and functionality.
 * Provides features for browsing, filtering, and managing gear items, augments, curses, and set bonuses.
 *
 * @param {Object} props - The props provided to the gear planner hook.
 * @param {function} props.enchantmentSearch - A callback function for initiating an enchantment search.
 * @param {function} props.setBonusFilter - A function to filter available set bonuses based on specific criteria.
 * @param {boolean} props.showConflicts - A flag indicating whether to display conflicting items.
 *
 * @returns {Object} An object containing state and utility functions related to the gear planner, including:
 * - Methods for interacting with browsing states, set bonuses, and gear items.
 * - State variables for tracking current slot browsing, conflict states, available items, display settings, and more.
 */
const useGearPlanner = (props: Props) => {
  const { enchantmentSearch, itemNameSearch, setBonusFilter, showConflicts, showOwnedOnly } = props

  const dispatch = useAppDispatch()
  const {
    characterSetups: setups,
    activeSetupId,
    artificerPet,
    druidPet
  } = useAppSelector((state) => state.gearPlanner)

  const { troveData } = useAppSelector((state) => state.app)

  const [allItems, setAllItems] = useState<GearItem[]>([])
  const [allAugments, setAllAugments] = useState<GearAugment[]>([])
  const [allCurses, setAllCurses] = useState<Curse[]>([])
  const [allFiligrees, setAllFiligrees] = useState<GearItem[]>([])
  const [allFiligreeSetNames, setAllFiligreeSetNames] = useState<string[]>([])
  const [essenceEnchantments, setEssenceEnchantments] = useState<EssenceEnchantment[]>([])
  const [itemSetBonusIndex, setItemSetBonusIndex] = useState<SetBonusIndex>({})
  const [filigreeSetBonusIndex, setFiligreeSetBonusIndex] = useState<SetBonusIndex>({})
  const [loading, setLoading] = useState(true)
  const [dataReady, setDataReady] = useState(false)
  const [pendingMinorArtifact, setPendingMinorArtifact] = useState<{
    slot: GearSlot
    item: GearItem
  } | null>(null)

  const [allItemsBySlot, setAllItemsBySlot] = useState<Map<GearSlot, GearItem[]>>(() => new Map())

  const [itemToSetsMap, setItemToSetsMap] = useState<Map<string, string[]>>(() => new Map())

  const [browsingSlot, setBrowsingSlot] = useState<GearSlot | null>(null)
  const [internalItemNameSearch, setInternalItemNameSearch] = useState('')
  const [itemsToShow, setItemsToShow] = useState(50)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setItemsToShow(50)
    }, 0)
    return () => {
      clearTimeout(timeoutId)
    }
  }, [itemNameSearch, internalItemNameSearch, browsingSlot])

  const [showSidebar, setShowSidebar] = useState(false)
  const [showEnchantmentSearch, setShowEnchantmentSearch] = useState(false)
  const [showSetBonusBrowser, setShowSetBonusBrowser] = useState(false)
  const [browsingSet, setBrowsingSet] = useState<string | null>(null)
  const observerTargetRef = useRef<HTMLDivElement>(null)

  const openSlotBrowser = useCallback((slot: GearSlot | null) => {
    setBrowsingSlot(slot)
    setItemsToShow(50)
    setInternalItemNameSearch('')
  }, [])

  const openSetBonusBrowser = useCallback(
    (setName: string) => {
      setBrowsingSet(setName)
      setShowSetBonusBrowser(true)
    },
    [setBrowsingSet]
  )

  const loadMore = useCallback(() => {
    setItemsToShow((prev) => prev + 50)
  }, [])

  useEffect(() => {
    const run = async () => {
      try {
        const { items, augments, filigrees } = await loadGearData()
        setAllItems(items)
        setAllAugments(augments)
        setAllFiligrees(filigrees)

        const sbi = await loadSetBonusIndex()
        setItemSetBonusIndex(sbi)

        const curses: Curse[] = await loadCurses()
        setAllCurses(curses)

        const filigreeSetsData = await loadFiligreeSets()
        const filigreeSetNames = filigreeSetsData.map((s) => s.name).sort((a, b) => a.localeCompare(b))
        setAllFiligreeSetNames(filigreeSetNames)

        const essenceEnchants = await loadEssenceEnchantments()
        setEssenceEnchantments(essenceEnchants)

        // Augment filigreeSetBonusIndex
        const filigreeSetBonusIndex: SetBonusIndex = {}

        const isFiligreeAlreadyPresent = (setName: string, filigreeName: string) => {
          const setEntries = filigreeSetBonusIndex[setName]
          if (!setEntries) return false
          for (const entry of setEntries) {
            if (entry.name === filigreeName) return true
          }
          return false
        }

        const updateFiligreeSetBonusIndexInternal = (filigree: GearItem, setName: string) => {
          filigreeSetBonusIndex[setName] ??= []

          if (!isFiligreeAlreadyPresent(setName, filigree.name)) {
            filigreeSetBonusIndex[setName].push({
              name: filigree.name,
              minLevel: parseInt(String(filigree.minLevel)) || 1
            })
          }
        }

        filigrees.forEach((filigree: GearItem) => {
          const allSets = new Set<string>()

          // From setBonus
          if (filigree.setBonus) {
            for (const sb of filigree.setBonus) {
              allSets.add(sb.name)
            }
          }

          if (allSets.size > 0) {
            for (const setName of allSets) {
              updateFiligreeSetBonusIndexInternal(filigree, setName)
            }
          }
        })
        setFiligreeSetBonusIndex(filigreeSetBonusIndex)
      } catch (err) {
        console.error('Error loading gear data:', err)
      } finally {
        setLoading(false)
      }
    }

    void run()
  }, [])

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // If any of the offcanvases are open and we click outside
      if (!target.closest('.gear-planner-offcanvas')) {
        // Only close if we didn't click a toggle button (to prevent immediate reopen)
        if (
          !target.closest('.btn') &&
          !target.closest('.gear-planner-sidebar-toggle') &&
          !target.closest('.card-header') &&
          !target.closest('.badge') &&
          !target.closest('.set-bonus-badge-clickable') &&
          !target.closest('.gear-planner-set-card')
        ) {
          setShowSidebar(false)
          setShowEnchantmentSearch(false)
          setShowSetBonusBrowser(false)
          openSlotBrowser(null)
        }
      }
    }

    const anyOpen = showSidebar || showEnchantmentSearch || showSetBonusBrowser || browsingSlot !== null

    if (anyOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [showSidebar, showEnchantmentSearch, showSetBonusBrowser, browsingSlot, openSlotBrowser])

  const activeSetup = setups.find((s) => s.id === activeSetupId) ?? setups[0]

  const isMetal = useCallback((material: string | null | undefined) => {
    if (!material) return false
    const materialLower = material.trim().toLowerCase()
    const metalMaterials = [
      'steel',
      'iron',
      'gold',
      'silver',
      'mithral',
      'adamantine',
      'alchemical silver',
      'cold iron',
      'byeshk',
      'bronze',
      'copper',
      'dwarven iron',
      'magesteel',
      'planeforged steel',
      'spiritforged iron'
    ]

    return metalMaterials.includes(materialLower)
  }, [])

  const formatDropLocations = useCallback((dropLocations: LootDropLocation[]): React.ReactNode => {
    if (!Array.isArray(dropLocations) || dropLocations.length === 0) {
      return ''
    }

    const cleanLocationName = (name: string): string => {
      // Find the last set of parentheses
      const lastParenOpen = name.lastIndexOf('(')
      const lastParenClose = name.lastIndexOf(')')

      if (lastParenOpen !== -1 && lastParenClose !== -1 && lastParenClose > lastParenOpen) {
        // Only remove if it's the last thing in the string (possibly with some whitespace)
        if (name.substring(lastParenClose + 1).trim() === '') {
          return name.substring(0, lastParenOpen).trim()
        }
      }

      return name.trim()
    }

    const locations = dropLocations
      .map((loc) => {
        let text = ''
        if (loc.isCraftOnly) {
          text = 'Craft Only'
        } else if (loc.questWildernessChain) {
          text = loc.questWildernessChain
          if (loc.difficulty) text += ` (${loc.difficulty})`
        } else if (loc.adventurePack) {
          text = loc.adventurePack
        } else if (loc.sourceType) {
          text = loc.sourceType
        }

        if (!text) return null

        const cleanedName = cleanLocationName(text)
        const url = `https://ddocompendium.com/w/${encodeURIComponent(cleanedName)}`

        return (
          <a
            key={text}
            href={url}
            target='_blank'
            rel='noopener'
            referrerPolicy='no-referrer-when-downgrade'
            data-referrer='https://yourddo.com'
            className='text-primary'
          >
            {text} <FaArrowUpRightFromSquare />
          </a>
        )
      })
      .filter((node): node is JSX.Element => node !== null)

    if (locations.length === 0) return ''

    return locations.reduce((prev, curr, i) => [prev, i > 0 ? ', ' : '', curr] as any, [])
  }, [])

  const isItemVisibleForClasses = useCallback((item: GearItem, setup: GearSetup) => {
    const isArtificer = setup.classes.includes('Artificer')
    const isDruid = setup.classes.includes('Druid')

    if (item.slot === GearSlot.ArtificerPetArmor || item.slot === GearSlot.ArtificerPetWeapon) {
      return isArtificer
    }
    if (item.slot === GearSlot.DruidPetArmor || item.slot === GearSlot.DruidPetWeapon) {
      return isDruid
    }
    return true
  }, [])

  // Process data into slot-based buckets asynchronously to avoid page-load lag
  useEffect(() => {
    if (
      allItems.length === 0 ||
      (Object.keys(itemSetBonusIndex).length === 0 && Object.keys(filigreeSetBonusIndex).length === 0)
    ) {
      return
    }

    let timeoutId_1: ReturnType<typeof setTimeout> | null = null
    let timeoutId_2: ReturnType<typeof setTimeout> | null = null

    const indexItemsBySlot = async (
      items: GearItem[],
      filigrees: GearItem[],
      chunkSize: number
    ): Promise<Map<GearSlot, GearItem[]>> => {
      const slotMap = new Map<GearSlot, GearItem[]>()
      const allItemsToProcess = [...items, ...filigrees]

      for (let i = 0; i < allItemsToProcess.length; i += chunkSize) {
        const chunk = allItemsToProcess.slice(i, i + chunkSize)
        for (const item of chunk) {
          const list = slotMap.get(item.slot)
          if (list) {
            list.push(item)
          } else {
            slotMap.set(item.slot, [item])
          }
        }

        // Yield to the main thread
        await new Promise((resolve) => {
          timeoutId_1 = setTimeout(resolve, 0)
        })
      }

      return slotMap
    }

    const indexSetsByItem = async (index: SetBonusIndex, chunkSize: number): Promise<Map<string, string[]>> => {
      const setsMap = new Map<string, string[]>()
      const setEntries = Object.entries(index)
      for (let i = 0; i < setEntries.length; i += chunkSize) {
        const chunk = setEntries.slice(i, i + chunkSize)
        for (const [setName, items] of chunk) {
          if (!items) continue

          for (const item of items) {
            const key = `${item.name}|${String(item.minLevel)}`
            const list = setsMap.get(key)
            if (list) {
              list.push(setName)
            } else {
              setsMap.set(key, [setName])
            }
          }
        }
        await new Promise((resolve) => {
          timeoutId_2 = setTimeout(resolve, 0)
        })
      }
      return setsMap
    }

    const processData = async () => {
      const slotMap = await indexItemsBySlot(allItems, allFiligrees, 1000)
      setAllItemsBySlot(slotMap)

      const combinedIndex = { ...itemSetBonusIndex, ...filigreeSetBonusIndex }
      const setsMap = await indexSetsByItem(combinedIndex, 100)
      setItemToSetsMap(setsMap)

      setDataReady(true)
    }

    void processData()

    return () => {
      if (timeoutId_1 !== null) {
        clearTimeout(timeoutId_1)
      }

      if (timeoutId_2 !== null) {
        clearTimeout(timeoutId_2)
      }
    }
  }, [allItems, allFiligrees, itemSetBonusIndex, filigreeSetBonusIndex])

  const characterEquipped = useMemo(() => {
    return Object.values(activeSetup.slots).filter((item): item is GearItem => item !== null)
  }, [activeSetup.slots])

  const artificerEquipped = useMemo(() => {
    if (!activeSetup.classes.includes('Artificer')) return []
    return Object.values(artificerPet.slots).filter((item): item is GearItem => item !== null)
  }, [artificerPet.slots, activeSetup.classes])

  const druidEquipped = useMemo(() => {
    if (!activeSetup.classes.includes('Druid')) return []
    return Object.values(druidPet.slots).filter((item): item is GearItem => item !== null)
  }, [druidPet.slots, activeSetup.classes])

  const characterConflicts = useMemo(
    () =>
      resolveConflicts(
        characterEquipped,
        activeSetup.slottedAugments,
        activeSetup.slottedNearlyFinished,
        activeSetup.slottedRitualTable,
        activeSetup.slottedLostPurpose
      ),
    [
      characterEquipped,
      activeSetup.slottedAugments,
      activeSetup.slottedNearlyFinished,
      activeSetup.slottedRitualTable,
      activeSetup.slottedLostPurpose
    ]
  )

  const artificerConflicts = useMemo(
    () =>
      resolveConflicts(
        artificerEquipped,
        artificerPet.slottedAugments,
        artificerPet.slottedNearlyFinished,
        artificerPet.slottedRitualTable,
        artificerPet.slottedLostPurpose
      ),
    [
      artificerEquipped,
      artificerPet.slottedAugments,
      artificerPet.slottedNearlyFinished,
      artificerPet.slottedRitualTable,
      artificerPet.slottedLostPurpose
    ]
  )

  const druidConflicts = useMemo(
    () =>
      resolveConflicts(
        druidEquipped,
        druidPet.slottedAugments,
        druidPet.slottedNearlyFinished,
        druidPet.slottedRitualTable,
        druidPet.slottedLostPurpose
      ),
    [
      druidEquipped,
      druidPet.slottedAugments,
      druidPet.slottedNearlyFinished,
      druidPet.slottedRitualTable,
      druidPet.slottedLostPurpose
    ]
  )

  const getContextInfo = useCallback(
    (slot: string) => {
      const owner = getSlotOwner(slot)
      let currentConflicts = characterConflicts
      let currentEquipped = characterEquipped
      let currentSlottedAugments = activeSetup.slottedAugments
      let currentSlottedFiligrees = activeSetup.slottedFiligrees
      let currentSlottedNearlyFinished = activeSetup.slottedNearlyFinished
      let currentSlottedRitualTable = activeSetup.slottedRitualTable
      let currentSlottedLostPurpose = activeSetup.slottedLostPurpose

      if (owner === 'artificer_pet') {
        currentConflicts = artificerConflicts
        currentEquipped = artificerEquipped
        currentSlottedAugments = artificerPet.slottedAugments
        currentSlottedFiligrees = artificerPet.slottedFiligrees
        currentSlottedNearlyFinished = artificerPet.slottedNearlyFinished
        currentSlottedRitualTable = artificerPet.slottedRitualTable
        currentSlottedLostPurpose = artificerPet.slottedLostPurpose
      } else if (owner === 'druid_pet') {
        currentConflicts = druidConflicts
        currentEquipped = druidEquipped
        currentSlottedAugments = druidPet.slottedAugments
        currentSlottedFiligrees = druidPet.slottedFiligrees
        currentSlottedNearlyFinished = druidPet.slottedNearlyFinished
        currentSlottedRitualTable = druidPet.slottedRitualTable
        currentSlottedLostPurpose = druidPet.slottedLostPurpose
      }

      return {
        currentConflicts,
        currentEquipped,
        currentSlottedAugments,
        currentSlottedFiligrees,
        currentSlottedNearlyFinished,
        currentSlottedRitualTable,
        currentSlottedLostPurpose
      }
    },
    [
      characterConflicts,
      artificerConflicts,
      druidConflicts,
      characterEquipped,
      artificerEquipped,
      druidEquipped,
      activeSetup.slottedAugments,
      activeSetup.slottedFiligrees,
      activeSetup.slottedNearlyFinished,
      activeSetup.slottedRitualTable,
      activeSetup.slottedLostPurpose,
      artificerPet.slottedAugments,
      artificerPet.slottedFiligrees,
      artificerPet.slottedNearlyFinished,
      artificerPet.slottedRitualTable,
      artificerPet.slottedLostPurpose,
      druidPet.slottedAugments,
      druidPet.slottedFiligrees,
      druidPet.slottedNearlyFinished,
      druidPet.slottedRitualTable,
      druidPet.slottedLostPurpose
    ]
  )

  const isItemConflicting = useCallback(
    (item: GearItem, slot: GearSlot) => {
      const {
        currentEquipped,
        currentSlottedAugments,
        currentSlottedNearlyFinished,
        currentSlottedRitualTable,
        currentSlottedLostPurpose
      } = getContextInfo(slot)

      return item.enchantments.some((ench) => {
        const potential = checkPotentialConflict(
          ench,
          currentEquipped,
          slot,
          currentSlottedAugments,
          currentSlottedNearlyFinished,
          currentSlottedRitualTable,
          currentSlottedLostPurpose,
          item.id
        )
        return potential.isConflict && potential.isRedundant
      })
    },
    [getContextInfo]
  )

  const weaponFilterMatches = useCallback((targetSlot: GearSlot, item: GearItem, setup: GearSetup) => {
    if (targetSlot === GearSlot.MainHand || targetSlot === GearSlot.OffHand) {
      // If the item is a weapon, it must match a weapon filter
      const isWeapon =
        Object.values(WEAPON_TYPES).flat().includes(item.type) ||
        (item.type === 'Gloves' && item.name.toLowerCase().includes('handwraps'))
      if (isWeapon) {
        if (setup.weaponFilters.length === 0) {
          // If no filters are checked, display all weapons
          return true
        }
        return setup.weaponFilters.some((w) => {
          const weaponPart = w.toLowerCase()
          const typeLower = item.type.toLowerCase()
          const nameLower = item.name.toLowerCase()
          return (
            typeLower === weaponPart ||
            (weaponPart === 'handwraps' && (item.type === 'Gloves' || typeLower === 'handwraps')) ||
            (item.type === 'Weapon' && nameLower.includes(weaponPart))
          )
        })
      }
    }
    return true
  }, [])

  const armorFilterMatches = useCallback((targetSlot: GearSlot, i: GearItem, s: GearSetup) => {
    if (targetSlot === GearSlot.Armor) {
      if (s.armorFilters.length > 0) {
        const isClothFilter = s.armorFilters.includes('Cloth Armor')
        const matchesCloth = isClothFilter && (i.type === 'Robe' || i.type === 'Outfit')
        const matchesOther = s.armorFilters.includes(i.type)
        return matchesCloth || matchesOther
      } else {
        // If no armor filters are checked, show all armor
        return true
      }
    }
    return true
  }, [])

  const otherFilterMatches = useCallback(
    (targetSlot: GearSlot, i: GearItem, s: GearSetup, ignoreSetFilter: boolean) => {
      // Shield Filter
      if (targetSlot === GearSlot.OffHand) {
        if (s.shieldFilters.length > 0) {
          if (!s.shieldFilters.includes(i.type)) return false
        }
      }

      // Druid Metal Filter
      const isDruid = s.classes.includes('Druid')
      if (isDruid && !s.allowMetalWithDruid) {
        if (isMetal(i.material)) {
          // Exceptions for Druids (Sickle and Scimitar are allowed even if metal in DDO usually, but here we follow material)
          // The user has a toggle for this, so we respect it.
          return false
        }
      }

      // Set Bonus Filter
      if (!ignoreSetFilter && setBonusFilter) {
        const combinedIndex = {
          ...itemSetBonusIndex,
          ...filigreeSetBonusIndex
        }
        const indexedItems = combinedIndex[setBonusFilter]
        const itemLvl = Number(i.minLevel) || 1
        return indexedItems?.some((ii) => ii.name === i.name && ii.minLevel === itemLvl) ?? false
      }
      return true
    },
    [setBonusFilter, itemSetBonusIndex, filigreeSetBonusIndex, isMetal]
  )

  const levelMatches = useCallback((item: GearItem, slot: GearSlot, setup: GearSetup) => {
    if (slot !== GearSlot.Filigree) {
      const itemLevel = Number.parseInt(item.minLevel, 10) || 1
      return itemLevel >= setup.minLevel && itemLevel <= setup.maxLevel
    }
    return true
  }, [])

  const ownedOnlyMatches = useCallback(
    (item: GearItem) => {
      if (showOwnedOnly && troveData) {
        return !!troveData[getTroveKey(item.name)]
      }
      return true
    },
    [showOwnedOnly, troveData]
  )

  const nameSearchMatches = useCallback(
    (item: GearItem) => {
      if (itemNameSearch) {
        const searchLower = itemNameSearch.toLowerCase().trim()
        return item.name.toLowerCase().includes(searchLower)
      }
      return true
    },
    [itemNameSearch]
  )

  const shouldShowItem = useCallback(
    (item: GearItem, slot: GearSlot, setup: GearSetup, ignoreSetFilter = false) => {
      // Level filter
      if (!levelMatches(item, slot, setup)) {
        return false
      }

      // Slot filter logic
      // Items are already pre-slotted during the data load. Rely on slot alone.
      if (item.slot !== slot) {
        return false
      }

      if (!weaponFilterMatches(slot, item, setup)) return false
      if (!armorFilterMatches(slot, item, setup)) return false
      if (!otherFilterMatches(slot, item, setup, ignoreSetFilter)) return false

      if (!ownedOnlyMatches(item)) return false

      // Item Name Search Filter
      return nameSearchMatches(item)
    },
    [levelMatches, weaponFilterMatches, armorFilterMatches, otherFilterMatches, ownedOnlyMatches, nameSearchMatches]
  )

  const isSetVisibleInRange = useCallback(
    (setName: string, index: SetBonusIndex, visibleItemKeys: Set<string>, isFiligreeSet = false) => {
      const indexedItems = index[setName]
      const { minLevel: min, maxLevel: max } = activeSetup

      if (!indexedItems) return false

      for (const item of indexedItems) {
        if (isFiligreeSet) {
          return true
        }
        if (item.minLevel >= min && item.minLevel <= max) {
          if (visibleItemKeys.has(`${item.name}|${item.minLevel.toString()}`)) {
            return true
          }
        }
      }

      return false
    },
    [activeSetup]
  )

  const filteredItemSets = useMemo(() => {
    if (!dataReady) return []
    const { minLevel: min, maxLevel: max } = activeSetup

    const getVisibleItemKeys = () => {
      const keys = new Set<string>()
      for (const [slot, items] of allItemsBySlot.entries()) {
        if (!isItemVisibleForClasses({ slot } as GearItem, activeSetup)) continue
        for (const i of items) {
          const level = Number(i.minLevel) || 1
          if (level >= min && level <= max) {
            const key = `${i.name}|${level.toString()}`
            keys.add(key)
          }
        }
      }
      return keys
    }

    const getSetsWithItemsInSlot = () => {
      const sets = new Set<string>()
      if (browsingSlot) {
        const slotItems = allItemsBySlot.get(browsingSlot) ?? []
        for (const i of slotItems) {
          const level = Number(i.minLevel) || 1

          if (
            level >= min &&
            level <= max &&
            isItemVisibleForClasses(i, activeSetup) &&
            shouldShowItem(i, browsingSlot, activeSetup, true)
          ) {
            const key = `${i.name}|${level.toString()}`
            const itemSets = itemToSetsMap.get(key)
            if (itemSets) {
              itemSets.forEach((s) => sets.add(s))
            }
          }
        }
      }
      return sets
    }

    const visibleItemKeys = getVisibleItemKeys()
    const setsWithItemsInSlot = getSetsWithItemsInSlot()

    return Object.keys(itemSetBonusIndex)
      .filter((setName) => {
        if (!isSetVisibleInRange(setName, itemSetBonusIndex, visibleItemKeys)) return false

        return !(browsingSlot && !setsWithItemsInSlot.has(setName))
      })
      .sort((a, b) => a.localeCompare(b))
  }, [
    itemSetBonusIndex,
    activeSetup,
    dataReady,
    allItemsBySlot,
    isItemVisibleForClasses,
    browsingSlot,
    shouldShowItem,
    itemToSetsMap,
    isSetVisibleInRange
  ])

  const filteredFiligreeSets = useMemo(() => {
    if (!dataReady) return []

    return allFiligreeSetNames
  }, [allFiligreeSetNames, dataReady])

  const filteredItems = useMemo(() => {
    if (!browsingSlot) return []
    const searchLower = (itemNameSearch || internalItemNameSearch).toLowerCase().trim()

    const slotItems = [...(allItemsBySlot.get(browsingSlot) ?? [])]

    // Inject Essence Crafted item if not a special slot
    const excludedSlots = [GearSlot.Quiver, GearSlot.ArtificerPetWeapon, GearSlot.DruidPetWeapon] as GearSlot[]

    if (!excludedSlots.includes(browsingSlot)) {
      const getEssenceCraftedName = (slot: GearSlot, type?: string) => {
        switch (slot) {
          case GearSlot.Head:
            return 'Essence Crafted Helmet'
          case GearSlot.Hands:
            return 'Essence Crafted Gloves'
          case GearSlot.Feet:
            return 'Essence Crafted Boots'
          case GearSlot.Wrists:
            return 'Essence Crafted Bracers'
          case GearSlot.Eyes:
            return 'Essence Crafted Goggles'
          case GearSlot.Neck:
            return 'Essence Crafted Necklace'
          case GearSlot.Waist:
            return 'Essence Crafted Belt'
          case GearSlot.Cloak:
            return 'Essence Crafted Cloak'
          case GearSlot.FirstFinger:
          case GearSlot.SecondFinger:
            return 'Essence Crafted Ring'
          case GearSlot.Trinket:
            return 'Essence Crafted Trinket'
          case GearSlot.Armor:
            return 'Essence Crafted Armor'
          case GearSlot.MainHand:
          case GearSlot.OffHand:
            return type ? `Essence Crafted ${type}` : 'Essence Crafted Weapon'
          default:
            return 'Essence Crafted Item'
        }
      }

      if (browsingSlot === GearSlot.MainHand || browsingSlot === GearSlot.OffHand) {
        const weaponTypes = Object.values(WEAPON_TYPES).flat()
        weaponTypes.forEach((type) => {
          slotItems.unshift({
            id: `essence-crafted-${browsingSlot}-${type.toLowerCase().replace(/ /g, '-')}`,
            name: getEssenceCraftedName(browsingSlot, type),
            type: type,
            isEssenceCrafted: true, // Specific flag for essence crafted items
            minLevel: '1',
            enchantments: [],
            slot: browsingSlot,
            material: 'Other'
          } as unknown as GearItem)
        })

        if (browsingSlot === GearSlot.OffHand) {
          SHIELD_TYPES.forEach((type) => {
            slotItems.unshift({
              id: `essence-crafted-${browsingSlot}-${type.toLowerCase().replace(/ /g, '-')}`,
              name: getEssenceCraftedName(browsingSlot, type),
              type: type,
              isEssenceCrafted: true,
              minLevel: '1',
              enchantments: [],
              slot: browsingSlot,
              material: 'Other'
            } as unknown as GearItem)
          })
        }
      } else {
        slotItems.unshift({
          id: `essence-crafted-${browsingSlot}`,
          name: getEssenceCraftedName(browsingSlot),
          type: 'Crafted',
          minLevel: '1',
          enchantments: [],
          slot: browsingSlot,
          material: 'Other'
        } as unknown as GearItem)
      }
    }

    return slotItems
      .filter((i) => {
        if (i.id.startsWith('essence-crafted-')) return true // Always show
        const matchesVisibility =
          isItemVisibleForClasses(i, activeSetup) && shouldShowItem(i, browsingSlot, activeSetup)

        if (!matchesVisibility) return false

        if (searchLower.length > 0) {
          return normalizeString(i.name).includes(searchLower)
        }

        return true
      })
      .sort((a, b) => {
        // Priority 0: Essence Crafted always first
        const isEssenceA = a.id.startsWith('essence-crafted-')
        const isEssenceB = b.id.startsWith('essence-crafted-')
        if (isEssenceA && !isEssenceB) return -1
        if (!isEssenceA && isEssenceB) return 1

        // Priority 1: Trove ownership
        const isOwnedA = troveData?.[getTroveKey(a.name)] ? 1 : 0
        const isOwnedB = troveData?.[getTroveKey(b.name)] ? 1 : 0
        if (isOwnedA !== isOwnedB) return isOwnedB - isOwnedA

        // Priority 2: Min Level (desc)
        const levelA = Number.parseInt(a.minLevel, 10) || 1
        const levelB = Number.parseInt(b.minLevel, 10) || 1
        if (levelB !== levelA) return levelB - levelA

        // Priority 3: Name (asc)
        return a.name.localeCompare(b.name)
      })
  }, [
    activeSetup,
    browsingSlot,
    allItemsBySlot,
    shouldShowItem,
    isItemVisibleForClasses,
    troveData,
    itemNameSearch,
    internalItemNameSearch
  ])

  useEffect(() => {
    if (!browsingSlot) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    )

    const currentTarget = observerTargetRef.current
    // Give the DOM a moment to render the spinner if it just appeared
    const timeoutId = setTimeout(() => {
      if (currentTarget) {
        observer.observe(currentTarget)
      }
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
      observer.disconnect()
    }
  }, [loadMore, browsingSlot])

  const searchResultsBySlot = useMemo(() => {
    if (enchantmentSearch.length <= 2) return null

    const searchLower = enchantmentSearch.toLowerCase().trim()

    const itemMatchesSearch = (item: GearItem) => {
      // level, weapon/armor types, conflicts, etc.
      if (!shouldShowItem(item, item.slot, activeSetup, true)) return false

      if (showOwnedOnly && troveData && !troveData[getTroveKey(item.name)]) {
        return false
      }

      let matchesSetName = false
      const combinedIndex = { ...itemSetBonusIndex, ...filigreeSetBonusIndex }
      for (const setName of Object.keys(combinedIndex)) {
        if (normalizeString(setName).includes(searchLower)) {
          const indexedItems = combinedIndex[setName]
          const isFiligreeSet = !!filigreeSetBonusIndex[setName]
          const itemLvl = Number(item.minLevel) || 1
          if (indexedItems?.some((ii) => ii.name === item.name && (isFiligreeSet || ii.minLevel === itemLvl))) {
            matchesSetName = true
            break
          }
        }
      }

      return (
        normalizeString(item.name).includes(searchLower) ||
        item.enchantments.some((ench) => normalizeString(ench.name).includes(searchLower)) ||
        matchesSetName
      )
    }

    return allItems
      .filter(itemMatchesSearch)
      .sort((a, b) => {
        const levelA = Number.parseInt(a.minLevel, 10) || 1
        const levelB = Number.parseInt(b.minLevel, 10) || 1
        if (levelB !== levelA) return levelB - levelA

        // Priority 3: Name (asc)
        return a.name.localeCompare(b.name)
      })
      .reduce<Record<string, GearItem[]>>((acc, item) => {
        acc[item.slot] = acc[item.slot] ?? []
        acc[item.slot].push(item)
        return acc
      }, {})
  }, [
    enchantmentSearch,
    allItems,
    shouldShowItem,
    itemSetBonusIndex,
    filigreeSetBonusIndex,
    activeSetup,
    isItemVisibleForClasses,
    troveData,
    showOwnedOnly
  ])

  /**
   * Updates the proficiency filters for a given gear setup by comparing the proficiencies
   * granted by old and new class assignments.
   *
   * @param {GearSetup} setup - The gear setup object containing the current filter settings.
   * @param {(string | null)[]} oldClasses - The list of previously assigned character classes.
   * @param {(string | null)[]} newClasses - The list of newly assigned character classes.
   *
   * @description
   * This function modifies the gear setup's proficiency filters (weapons, armor, shields)
   * to reflect changes in class proficiencies. It performs the following actions:
   * 1. Identifies the proficiencies (weapons, armor, shields) granted by the old classes.
   * 2. Identifies the proficiencies granted by the new classes.
   * 3. Removes any proficiencies from the gear setup that were granted by old classes
   *    but are not granted by new classes.
   * 4. Adds any proficiencies from the new classes not already present.
   *
   * The result is an updated gear setup with filters that correctly represent the combined
   * proficiencies of the newly assigned classes.
   */
  const updateClassProficiencies = (setup: GearSetup, oldClasses: (string | null)[], newClasses: (string | null)[]) => {
    // 1. Identify what filters are granted by OLD classes
    const oldWeaponProficiencies = new Set<string>()
    const oldArmorProficiencies = new Set<string>()
    const oldShieldProficiencies = new Set<string>()
    oldClasses.forEach((cls) => {
      if (cls) {
        CLASS_PROFICIENCIES[cls].weapons.forEach((w) => oldWeaponProficiencies.add(w))
        CLASS_PROFICIENCIES[cls].armor.forEach((a) => oldArmorProficiencies.add(a))
        CLASS_PROFICIENCIES[cls].shields.forEach((s) => oldShieldProficiencies.add(s))
      }
    })

    // 2. Identify what filters are granted by NEW classes
    const newWeaponProficiencies = new Set<string>()
    const newArmorProficiencies = new Set<string>()
    const newShieldProficiencies = new Set<string>()
    newClasses.forEach((cls) => {
      if (cls) {
        CLASS_PROFICIENCIES[cls].weapons.forEach((w) => newWeaponProficiencies.add(w))
        CLASS_PROFICIENCIES[cls].armor.forEach((a) => newArmorProficiencies.add(a))
        CLASS_PROFICIENCIES[cls].shields.forEach((s) => newShieldProficiencies.add(s))
      }
    })

    // 3. Remove filters that were granted by old classes but NOT by new classes
    const weaponsToRemove = new Set([...oldWeaponProficiencies].filter((w) => !newWeaponProficiencies.has(w)))
    const armorToRemove = new Set([...oldArmorProficiencies].filter((a) => !newArmorProficiencies.has(a)))
    const shieldsToRemove = new Set([...oldShieldProficiencies].filter((s) => !newShieldProficiencies.has(s)))

    const updatedWeaponFilters = setup.weaponFilters.filter((w) => !weaponsToRemove.has(w))
    const updatedArmorFilters = setup.armorFilters.filter((a) => !armorToRemove.has(a))
    const updatedShieldFilters = setup.shieldFilters.filter((s) => !shieldsToRemove.has(s))

    // 4. Add filters granted by new classes
    newWeaponProficiencies.forEach((w) => {
      if (!updatedWeaponFilters.includes(w)) {
        updatedWeaponFilters.push(w)
      }
    })
    newArmorProficiencies.forEach((a) => {
      if (!updatedArmorFilters.includes(a)) {
        updatedArmorFilters.push(a)
      }
    })
    newShieldProficiencies.forEach((s) => {
      if (!updatedShieldFilters.includes(s)) {
        updatedShieldFilters.push(s)
      }
    })

    setup.weaponFilters = updatedWeaponFilters
    setup.armorFilters = updatedArmorFilters
    setup.shieldFilters = updatedShieldFilters
  }

  /**
   * A function variable that generates a new gear setup configuration with default properties,
   * assigns it a unique identifier, and updates the application state by dispatching actions
   * to add the new setup and set it as the active setup.
   *
   * The generated gear setup includes:
   * - A unique ID.
   * - A default name based on the number of existing setups.
   * - Minimum and maximum level constraints.
   * - Default slots for classes, weapons, armor, and shields.
   * - Default filters for weapon, armor, and shield types.
   * - An option to disallow metal gear with druids.
   * - An empty set of slots, slotted augments, and slotted curses.
   *
   * Dispatches actions:
   * - Adds the newly created setup to the existing list of setups.
   * - Marks the newly created setup as the active one.
   */
  const addSetup = () => {
    const newId = crypto.randomUUID()
    const newSetup: GearSetup = {
      id: newId,
      name: `New Setup ${String(setups.length + 1)}`,
      minLevel: 1,
      maxLevel: 34,
      classes: [null, null, null],
      weaponFilters: [],
      armorFilters: [],
      shieldFilters: [],
      allowMetalWithDruid: false,
      slots: {} as Record<GearSlot, GearItem | null>,
      slottedAugments: {},
      slottedCurses: {},
      slottedFiligrees: {},
      unlockedFiligreeSlots: {},
      slottedGemSetBonuses: {},
      slottedEssenceEnchantments: {},
      slottedNearlyFinished: {},
      slottedRitualTable: {},
      slottedLostPurpose: {}
    }

    dispatch(addSetupAction(newSetup))
    dispatch(setActiveSetupAction(newId))
  }

  /**
   * Deletes a setup by dispatching an action to remove it from the store.
   *
   * @param {string} id - The unique identifier of the setup to be deleted.
   *
   * @returns {void} This function does not return a value.
   */
  const deleteSetup = (id: string): void => {
    dispatch(removeSetupAction(id))
  }

  /**
   * Updates the selected gear slot with the provided item and closes the slot browser.
   *
   * @param {GearSlot} slot - The gear slot to be updated.
   * @param {GearItem | null} item - The gear item to equip in the given slot, or null to unequip.
   *
   * @returns {void}
   */
  const selectItem = (slot: GearSlot, item: GearItem | null): void => {
    handleItemEquip(slot, item, activeSetup)
    openSlotBrowser(null)
  }

  const checkMinorArtifactConflict = (slot: GearSlot, item: GearItem, setup: GearSetup): boolean => {
    if (!isMinorArtifact(item)) return false

    const otherArtifactSlot = (Object.keys(setup.slots) as GearSlot[]).find(
      (s) => s !== slot && setup.slots[s] && isMinorArtifact(setup.slots[s])
    )

    if (otherArtifactSlot && !pendingMinorArtifact) {
      setPendingMinorArtifact({ slot, item })
      return true
    }
    return false
  }

  const confirmFiligreeClear = (itemId: string, setup: GearSetup, message: string): boolean => {
    if (hasActiveFiligrees(itemId, setup)) {
      return globalThis.confirm(message)
    }
    return true
  }

  const handleItemEquip = (slot: GearSlot, item: GearItem | null, setup: GearSetup) => {
    if (item) {
      if (checkMinorArtifactConflict(slot, item, setup)) {
        return
      }

      const oldItem = setup.slots[slot]
      if (oldItem && oldItem.id !== item.id) {
        const msg =
          'The item currently in this slot has slotted filigrees. Replacing it will clear all filigrees and unlocked slots for the old item. Are you sure?'
        if (!confirmFiligreeClear(oldItem.id, setup, msg)) {
          return
        }
      }
    } else {
      const oldItem = setup.slots[slot]
      if (oldItem) {
        const msg =
          'This item has slotted filigrees. Removing it will clear all filigrees and unlocked slots. Are you sure?'
        if (!confirmFiligreeClear(oldItem.id, setup, msg)) {
          return
        }
      }
    }
    dispatch(equipItemAction({ slot, item }))
  }

  const hasActiveFiligrees = (itemId: string, setup: GearSetup) => {
    return (setup.slottedFiligrees[itemId] ?? []).some((f) => f !== null)
  }

  /**
   * Sets a slotted augment for a specific gear item.
   *
   * @param {string} itemId - The unique identifier of the gear item.
   * @param {number} slotIndex - The index of the slot where the augment will be placed.
   * @param {GearAugment | null} augment - The augment to be slotted into the specified gear slot. Pass null to remove an augment.
   * @param {GearSlot} [slot] - Optional parameter specifying additional slot details or specific slot type.
   *
   * @returns {void}
   */
  const setSlottedAugment = (itemId: string, slotIndex: number, augment: GearAugment | null, slot?: GearSlot): void => {
    dispatch(setAugmentAction({ itemId, slotIndex, augment, slot }))
  }

  /**
   * Assigns or removes a curse for a specific item and optional gear slot.
   *
   * @param {string} itemId - The unique identifier of the item to which the curse is to be applied or removed.
   * @param {Curse | null} curse - The curse to assign or null to remove the curse from the item.
   * @param {GearSlot} [slot] - Optional gear slot indicating where the cursed item resides.
   *
   * Dispatches an action to update the curse status on the specified item and optional slot.
   */
  const setSlottedCurse = (itemId: string, curse: Curse | null, slot?: GearSlot) => {
    dispatch(setCurseAction({ itemId, curse, slot }))
  }

  const setSlottedFiligree = (itemId: string, slotIndex: number, filigree: LootItem | null, slot?: GearSlot) => {
    dispatch(setFiligreeAction({ itemId, slotIndex, filigree, slot }))
  }

  const setSlottedGemSetBonus = (itemId: string, slotIndex: number, setName: string | null, slot?: GearSlot) => {
    dispatch(setGemSetBonusAction({ itemId, slotIndex, setName, slot }))
  }

  const setEssenceEnchantment = (itemId: string, slotName: string, enchantmentId: string | null, slot?: GearSlot) => {
    dispatch(setEssenceEnchantmentAction({ itemId, slotName, enchantmentId, slot }))
  }

  const setItemMinLevel = (itemId: string, minLevel: number, slot?: GearSlot) => {
    dispatch(setItemMinLevelAction({ itemId, minLevel, slot }))
  }

  const setItemMaterial = (itemId: string, material: string, slot?: GearSlot) => {
    dispatch(setItemMaterialAction({ itemId, material, slot }))
  }

  const setNearlyFinishedEnchantment = (itemId: string, enchantment: LootEnchantment | null, slot?: GearSlot) => {
    dispatch(setNearlyFinishedEnchantmentAction({ itemId, enchantment, slot }))
  }

  const setRitualTableEnchantment = (itemId: string, enchantment: LootEnchantment | null, slot?: GearSlot) => {
    dispatch(setRitualTableEnchantmentAction({ itemId, enchantment, slot }))
  }

  const setLostPurposeEnchantment = (itemId: string, enchantment: LootEnchantment | null, slot?: GearSlot) => {
    dispatch(setLostPurposeEnchantmentAction({ itemId, enchantment, slot }))
  }

  /**
   * Determines applicable augments for a given slot type and item minimum level.
   *
   * @param {string} slotType - The type of the slot (e.g., "Red", "Blue", "Dino Bone").
   * @param {number} itemMinLevel - The minimum level of the item.
   *
   * @returns {Object} An object containing the following properties:
   * - `groups`: A mapping of augment types to their corresponding arrays of applicable augments.
   * - `sortedGroupNames`: An array of augment type names, sorted in ascending order.
   *
   * This function applies several rules to filter and group augments:
   * - Maps slot types to their allowed color-based augment types using a predefined mapping (`colorMap`).
   * - Normalizes certain specialty slot types (e.g., "Dino Bone", "Lamordia") to match augment definitions.
   * - Filters augments based on their `minimumLevel`, ensuring they are applicable to the item level.
   * - Groups applicable augments by their types and sorts the augments within each group.
   * - Augments are prioritized based on trove ownership status and their minimum level.
   */
  const getApplicableAugments = (
    slotType: string,
    itemMinLevel: number
  ): { groups: Record<string, GearAugment[]>; sortedGroupNames: string[] } => {
    const levelLimit = itemMinLevel
    const colorMap: Record<string, string[]> = {
      Colorless: ['Colorless'],
      Red: ['Red', 'Colorless'],
      Blue: ['Blue', 'Colorless'],
      Yellow: ['Yellow', 'Colorless'],
      Purple: ['Purple', 'Red', 'Blue', 'Colorless'],
      Orange: ['Orange', 'Red', 'Yellow', 'Colorless'],
      Green: ['Green', 'Blue', 'Yellow', 'Colorless'],
      Sun: ['Sun'],
      Moon: ['Moon']
    }

    const allowedTypes = colorMap[slotType]

    const filtered = allAugments.filter((aug) => {
      // For specialty slots (Dino Bone, Lamordia), match exactly or use mapping if defined.
      const isSpecialty =
        slotType.startsWith('Isle of Dread:') || slotType.startsWith('Lamordia:') || slotType.startsWith('Dino Bone')

      if (isSpecialty) {
        const normalized = slotType
          .replaceAll('Dino Bone', 'Isle of Dread:')
          .replaceAll(/\sSlot/g, '')
          .replace(/:$/, '')
          .replaceAll(/:\s*\(/g, ' (')
          .trim()
        if (aug.augmentType !== normalized) return false
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const matches = allowedTypes ? allowedTypes.includes(aug.augmentType) : aug.augmentType === slotType
        if (!matches) return false
      }

      const augLevel = aug.minLevel
      return augLevel <= levelLimit
    })

    // Group by augmentType
    const groups: Record<string, GearAugment[]> = {}

    filtered.forEach((aug) => {
      groups[aug.augmentType] = groups[aug.augmentType] ?? []
      groups[aug.augmentType].push(aug)
    })

    // Sort within groups
    Object.values(groups).forEach((group) => {
      group.sort((a, b) => {
        // Priority 1: Trove ownership
        const isOwnedA = troveData?.[getTroveKey(a.name)] ? 1 : 0
        const isOwnedB = troveData?.[getTroveKey(b.name)] ? 1 : 0

        if (isOwnedA !== isOwnedB) {
          return isOwnedB - isOwnedA
        }

        if (b.minLevel !== a.minLevel) {
          return b.minLevel - a.minLevel
        }

        return a.name.localeCompare(b.name)
      })
    })

    // Sort group names ascending
    const sortedGroupNames = Object.keys(groups).sort((a, b) => a.localeCompare(b))

    return { groups, sortedGroupNames }
  }

  /**
   * Renders a gear slot UI component based on the specified gear slot and setup configuration.
   *
   * This function determines the ownership of the gear slot (character, artificer pet, or druid pet) and dynamically sets the corresponding configurations such as the selected item, conflicts, equipped items, and slotted augments. It generates a UI card representing the gear slot, displaying the item's details, enchantments, augments, and curses if applicable. Clicking the card header opens a browser for selecting items for the gear slot.
   *
   * @param {GearSlot} slot - The gear slot to be rendered (e.g., head, chest, weapon, etc.).
   * @param {GearSetup} setup - The active configuration of gear setups containing the gear slot information and associated data.
   *
   * @returns {JSX.Element} A UI component representing the rendered gear slot.
   */
  const renderSlot = (slot: GearSlot, setup: GearSetup): JSX.Element => {
    const owner = getSlotOwner(slot)
    let selectedItem: GearItem | null = null
    let currentConflicts = characterConflicts
    let currentEquipped = characterEquipped
    let currentSlottedAugments = activeSetup.slottedAugments
    let currentSlottedNearlyFinished = activeSetup.slottedNearlyFinished
    let currentSlottedRitualTable = activeSetup.slottedRitualTable
    let currentSlottedLostPurpose = activeSetup.slottedLostPurpose

    if (owner === 'character') {
      selectedItem = setup.slots[slot]
      currentConflicts = characterConflicts
      currentEquipped = characterEquipped
      currentSlottedAugments = activeSetup.slottedAugments
      currentSlottedNearlyFinished = activeSetup.slottedNearlyFinished
      currentSlottedRitualTable = activeSetup.slottedRitualTable
      currentSlottedLostPurpose = activeSetup.slottedLostPurpose
    } else if (owner === 'artificer_pet') {
      selectedItem = artificerPet.slots[slot]
      currentConflicts = artificerConflicts
      currentEquipped = artificerEquipped
      currentSlottedAugments = artificerPet.slottedAugments
      currentSlottedNearlyFinished = artificerPet.slottedNearlyFinished
      currentSlottedRitualTable = artificerPet.slottedRitualTable
      currentSlottedLostPurpose = artificerPet.slottedLostPurpose
    } else if (owner === 'druid_pet') {
      selectedItem = druidPet.slots[slot]
      currentConflicts = druidConflicts
      currentEquipped = druidEquipped
      currentSlottedAugments = druidPet.slottedAugments
      currentSlottedNearlyFinished = druidPet.slottedNearlyFinished
      currentSlottedRitualTable = druidPet.slottedRitualTable
      currentSlottedLostPurpose = druidPet.slottedLostPurpose
    }

    return (
      <Col key={slot} xs={12} sm={6} md={4} lg={3} className='mb-3 px-1'>
        <Card className={`h-100 shadow-sm ${selectedItem ? 'border-primary' : ''} position-relative`}>
          <Card.Header
            className='py-1 px-2 bg-secondary-subtle text-secondary-emphasis small fw-bold d-flex justify-content-between align-items-center cursor-pointer'
            onClick={() => {
              openSlotBrowser(slot)
            }}
          >
            <div className='d-flex align-items-center gap-2'>
              <span>{slot}</span>
              {selectedItem && <TroveBadge itemName={selectedItem.name} troveData={troveData} />}
            </div>
            <FaMagnifyingGlass className='text-muted' size={12} />
          </Card.Header>

          <Card.Body
            className={`p-2 d-flex flex-column align-items-center ${selectedItem ? 'bg-white' : 'bg-dark-subtle justify-content-center'}`}
            style={{ minHeight: '100px' }}
          >
            {selectedItem ? (
              <div className='text-center w-100 d-flex flex-column'>
                <div className='fw-bold small text-dark mb-1'>{selectedItem.name}</div>
                {Array.isArray(selectedItem.dropLocations) && selectedItem.dropLocations.length > 0 && (
                  <div className='text-primary' style={{ fontSize: '0.65rem', paddingBottom: '0.25rem' }}>
                    <hr className='mb-1 mt-0' />
                    <div style={{ lineHeight: '1.2' }}>{formatDropLocations(selectedItem.dropLocations)}</div>
                    <hr className='mt-1 mb-0' />
                  </div>
                )}
                {selectedItem.name.includes('Gem of Many Facets') && (
                  <GemSetBonusSelector
                    selectedItem={selectedItem}
                    activeSetup={activeSetup}
                    slot={slot}
                    setSlottedGemSetBonus={setSlottedGemSetBonus}
                  />
                )}
                <ItemSetBonusDisplay
                  selectedItem={selectedItem}
                  activeSetup={activeSetup}
                  openSetBonusBrowser={openSetBonusBrowser}
                />

                <div className='text-secondary mb-0' style={{ fontSize: '0.7rem' }}>
                  ML: {selectedItem.minLevel || '1'} | {selectedItem.type || 'Item'}
                  {selectedItem.material && (
                    <>
                      &nbsp;|&nbsp;
                      <span
                        className={`mb-1 fw-bold ${isMetal(selectedItem.material) ? 'text-danger' : 'text-success'}`}
                        style={{ fontSize: '0.6rem' }}
                      >
                        {selectedItem.material} {isMetal(selectedItem.material) && '(Metal)'}
                      </span>
                    </>
                  )}
                </div>

                {activeSetup.slottedCurses[selectedItem.id]?.name === 'Curse of Minor Masterworks' && (
                  <div key='curse-boost-minor' className='text-success fw-bold' style={{ fontSize: '0.6rem' }}>
                    Crafting Effect Level +1
                  </div>
                )}
                {activeSetup.slottedCurses[selectedItem.id]?.name === 'Curse of Major Masterworks' && (
                  <div key='curse-boost-major' className='text-success fw-bold' style={{ fontSize: '0.6rem' }}>
                    Crafting Effect Level +2
                  </div>
                )}

                {selectedItem.enchantments.length > 0 && (
                  <div
                    className='text-start mt-1 pt-1 border-top gear-planner-slot-enchantments'
                    style={{ fontSize: '0.65rem' }}
                  >
                    <EnchantmentList
                      enchantments={selectedItem.enchantments.filter(
                        (e) =>
                          e.name !== 'Craftable Rune Arm' &&
                          e.name !== 'Nearly Finished' &&
                          e.name !== 'Sealed in Fire' &&
                          e.name !== 'Sealed in Undeath' &&
                          e.name !== 'Lost Purpose'
                      )}
                      itemId={selectedItem.id}
                      conflicts={currentConflicts}
                      equippedItems={currentEquipped}
                      source='slot'
                      browsingSlot={slot}
                      slottedAugments={currentSlottedAugments}
                      slottedNearlyFinished={currentSlottedNearlyFinished}
                      slottedRitualTable={currentSlottedRitualTable}
                      slottedLostPurpose={currentSlottedLostPurpose}
                    />
                  </div>
                )}

                {selectedItem.enchantments.some((e) => e.name === 'Nearly Finished') && (
                  <NearlyFinishedSelector
                    item={selectedItem}
                    slot={slot}
                    selectedEnchantment={currentSlottedNearlyFinished[selectedItem.id] ?? null}
                    onSelect={(ench) => {
                      setNearlyFinishedEnchantment(selectedItem.id, ench, slot)
                    }}
                    conflicts={currentConflicts}
                    equippedItems={currentEquipped}
                    slottedAugments={currentSlottedAugments}
                    slottedNearlyFinished={currentSlottedNearlyFinished}
                    slottedRitualTable={currentSlottedRitualTable}
                    slottedLostPurpose={currentSlottedLostPurpose}
                  />
                )}

                {selectedItem.enchantments.some(
                  (e) => e.name === 'Sealed in Fire' || e.name === 'Sealed in Undeath'
                ) && (
                  <RitualTableSelector
                    item={selectedItem}
                    slot={slot}
                    selectedEnchantment={currentSlottedRitualTable[selectedItem.id] ?? null}
                    onSelect={(ench) => {
                      setRitualTableEnchantment(selectedItem.id, ench, slot)
                    }}
                    troveData={troveData}
                    conflicts={currentConflicts}
                    equippedItems={currentEquipped}
                    slottedAugments={currentSlottedAugments}
                    slottedNearlyFinished={currentSlottedNearlyFinished}
                    slottedRitualTable={currentSlottedRitualTable}
                    slottedLostPurpose={currentSlottedLostPurpose}
                  />
                )}

                {selectedItem.enchantments.some((e) => e.name === 'Lost Purpose') && (
                  <LostPurposeSelector
                    item={selectedItem}
                    slot={slot}
                    selectedEnchantment={currentSlottedLostPurpose[selectedItem.id] ?? null}
                    onSelect={(ench) => {
                      setLostPurposeEnchantment(selectedItem.id, ench, slot)
                    }}
                    conflicts={currentConflicts}
                    equippedItems={currentEquipped}
                    slottedAugments={currentSlottedAugments}
                    slottedNearlyFinished={currentSlottedNearlyFinished}
                    slottedRitualTable={currentSlottedRitualTable}
                    slottedLostPurpose={currentSlottedLostPurpose}
                  />
                )}

                {(selectedItem.id.startsWith('essence-crafted-') || selectedItem.isEssenceCrafted) && (
                  <div className='mt-2 border-top pt-2 w-100'>
                    <EssenceCraftingSelector
                      selectedItem={selectedItem}
                      activeSetup={activeSetup}
                      essenceEnchantments={essenceEnchantments}
                      setEssenceEnchantment={setEssenceEnchantment}
                      setItemMinLevel={setItemMinLevel}
                      setItemMaterial={setItemMaterial}
                      slot={slot}
                      currentConflicts={currentConflicts}
                      currentEquipped={currentEquipped}
                      currentSlottedAugments={currentSlottedAugments}
                      currentSlottedNearlyFinished={currentSlottedNearlyFinished}
                      currentSlottedRitualTable={currentSlottedRitualTable}
                      currentSlottedLostPurpose={currentSlottedLostPurpose}
                    />
                  </div>
                )}

                {selectedItem.enchantments.some((e) => e.name === 'Craftable Rune Arm') ||
                selectedItem.name.includes('Gem of Many Facets') ? (
                  <div className='text-start mt-1 pt-1 border-top gear-planner-slot-essence-crafting'>
                    <EssenceCraftingSelector
                      selectedItem={selectedItem}
                      activeSetup={activeSetup}
                      essenceEnchantments={essenceEnchantments}
                      setEssenceEnchantment={setEssenceEnchantment}
                      setItemMinLevel={setItemMinLevel}
                      setItemMaterial={setItemMaterial}
                      slot={slot}
                      currentConflicts={currentConflicts}
                      currentEquipped={currentEquipped}
                      currentSlottedAugments={currentSlottedAugments}
                      currentSlottedNearlyFinished={currentSlottedNearlyFinished}
                      currentSlottedRitualTable={currentSlottedRitualTable}
                      currentSlottedLostPurpose={currentSlottedLostPurpose}
                    />
                  </div>
                ) : null}

                {selectedItem.augments && Array.isArray(selectedItem.augments) && selectedItem.augments.length > 0 && (
                  <div className='text-start mt-1 pt-1 border-top gear-planner-slot-augments'>
                    {selectedItem.augments.map((augSlot, idx) => {
                      const slotted =
                        selectedItem.id in currentSlottedAugments ? currentSlottedAugments[selectedItem.id][idx] : null
                      const itemMinLevel = Number.parseInt(String(selectedItem.minLevel), 10) || 1
                      const applicable = getApplicableAugments(augSlot.augmentType, itemMinLevel)

                      return (
                        <AugmentSlotItem
                          key={`${augSlot.name ?? 'unknown-augment-slot'}-${String(idx)}`}
                          selectedItem={selectedItem}
                          idx={idx}
                          augSlot={augSlot}
                          slotted={slotted}
                          applicable={applicable}
                          slot={slot}
                          currentConflicts={currentConflicts}
                          currentEquipped={currentEquipped}
                          currentSlottedAugments={currentSlottedAugments}
                          currentSlottedNearlyFinished={currentSlottedNearlyFinished}
                          currentSlottedRitualTable={currentSlottedRitualTable}
                          currentSlottedLostPurpose={currentSlottedLostPurpose}
                          setSlottedAugment={setSlottedAugment}
                          openSetBonusBrowser={openSetBonusBrowser}
                        />
                      )
                    })}
                  </div>
                )}
                {getMaxFiligreeSlots(selectedItem) > 0 && (
                  <div key='filigrees' className='text-start mt-1 pt-1 border-top'>
                    <FiligreeLabel item={selectedItem} setup={setup} slot={slot} />

                    {(setup.slottedFiligrees[selectedItem.id] ?? []).some((f) => f !== null) && (
                      <div className='mt-1 ps-1 border-start border-2' style={{ borderColor: '#ff8c00' }}>
                        {(setup.slottedFiligrees[selectedItem.id] ?? [])
                          .filter((f) => f !== null)
                          .map((filigree, fIdx) => (
                            <div key={`${filigree.name}-${String(fIdx)}`} className='mb-1'>
                              <div className='fw-bold text-dark' style={{ fontSize: '0.65rem' }}>
                                {filigree.name}
                              </div>

                              {filigree.enchantments.length > 0 && (
                                <div
                                  className='text-secondary'
                                  style={{
                                    fontSize: '0.6rem',
                                    lineHeight: '1.1'
                                  }}
                                >
                                  <EnchantmentList
                                    enchantments={filigree.enchantments}
                                    itemId={selectedItem.id}
                                    conflicts={currentConflicts}
                                    equippedItems={currentEquipped}
                                    source='slot'
                                    browsingSlot={slot}
                                    slottedAugments={currentSlottedAugments}
                                    slottedNearlyFinished={currentSlottedNearlyFinished}
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                {!['Augment', 'Cosmetic', 'Wand', 'Scroll'].includes(selectedItem.type) &&
                  selectedItem.slot !== GearSlot.Quiver && (
                    <div key='curse-slot' className='text-start mt-1 pt-1 border-top gear-planner-slot-curses'>
                      <CurseSlotItem
                        selectedItem={selectedItem}
                        allCurses={allCurses}
                        slotted={activeSetup.slottedCurses[selectedItem.id]}
                        slot={slot}
                        currentConflicts={currentConflicts}
                        currentEquipped={currentEquipped}
                        currentSlottedAugments={currentSlottedAugments}
                        currentSlottedNearlyFinished={currentSlottedNearlyFinished}
                        currentSlottedRitualTable={currentSlottedRitualTable}
                        currentSlottedLostPurpose={currentSlottedLostPurpose}
                        setCurse={setSlottedCurse}
                      />
                    </div>
                  )}
              </div>
            ) : (
              <div className='text-center italic small text-secondary'>No Item Selected</div>
            )}
          </Card.Body>
        </Card>
      </Col>
    )
  }

  return {
    activeSetup,
    addSetup,
    allAugments,
    allCurses,
    artificerEquipped,
    allFiligrees,
    allItems: useMemo(() => [...allItems, ...allFiligrees], [allItems, allFiligrees]),
    browsingSlot,
    browsingSet,
    setBrowsingSet,
    showSidebar,
    setShowSidebar,
    showEnchantmentSearch,
    setShowEnchantmentSearch,
    showSetBonusBrowser,
    setShowSetBonusBrowser,
    characterEquipped,
    deleteSetup,
    druidEquipped,
    filteredItems,
    filteredItemSets,
    filteredFiligreeSets,
    allFiligreeSetNames,
    getContextInfo,
    isItemVisibleForClasses,
    isMetal,
    setItemMaterial,
    itemNameSearch: itemNameSearch || internalItemNameSearch,
    itemsToShow,
    loading,
    openSetBonusBrowser,
    openSlotBrowser,
    pendingMinorArtifact,
    setPendingMinorArtifact,
    renderSlot,
    searchResultsBySlot,
    selectItem,
    setBonusIndex: useMemo(
      () => ({ ...itemSetBonusIndex, ...filigreeSetBonusIndex }),
      [itemSetBonusIndex, filigreeSetBonusIndex]
    ),
    setItemNameSearch: setInternalItemNameSearch,
    setSlottedFiligree,
    setUnlockedFiligreeSlots: (itemId: string, numSlots: number, slot: GearSlot) => {
      dispatch(
        setUnlockedFiligreeSlotsAction({
          itemId,
          numSlots,
          slot
        })
      )
    },
    updateClassProficiencies,
    observerTargetRef,
    dataReady,
    essenceEnchantments,
    setEssenceEnchantment: (itemId: string, slotName: string, enchantmentId: string | null, slot: GearSlot) => {
      dispatch(
        setEssenceEnchantmentAction({
          itemId,
          slotName,
          enchantmentId,
          slot
        })
      )
    },
    setItemMinLevel: (itemId: string, minLevel: number, slot: GearSlot) => {
      dispatch(
        setItemMinLevelAction({
          itemId,
          minLevel,
          slot
        })
      )
    },
    setLostPurposeEnchantment: (itemId: string, enchantment: LootEnchantment | null, slot: GearSlot) => {
      dispatch(
        setLostPurposeEnchantmentAction({
          itemId,
          enchantment,
          slot
        })
      )
    }
  }
}

const FiligreeLabel = ({ item, setup, slot }: { item: GearItem; setup: GearSetup; slot: GearSlot }) => {
  const isSlotted = (setup.slottedFiligrees[item.id] ?? []).some((f) => f !== null)
  let label = 'Sentience Accepted'
  if (isSlotted) {
    const activeCount = (setup.slottedFiligrees[item.id] ?? []).filter((f) => f !== null).length
    label = `Filigrees Slotted (${String(activeCount)})`
  } else if (isMinorArtifact(item)) {
    label = 'Minor Artifact'
  }

  return (
    <button
      type='button'
      className='fw-bold border-0 bg-transparent p-0 text-start w-100'
      style={{
        color: '#ff8c00',
        fontSize: '0.7rem'
      }}
      onClick={() => {
        ;(
          globalThis as unknown as {
            openFiligreeModal: (item: GearItem, slot: GearSlot) => void
          }
        ).openFiligreeModal(item, slot)
      }}
    >
      {label}
    </button>
  )
}

/**
 * Interface representing the properties for a component handling item filtering and state management.
 *
 * @interface
 *
 * @property {string} enchantmentSearch - A string representing the search query for enchantments.
 * @property {string | null} setBonusFilter - A string representing the currently applied set bonus filter, or null if no filter is applied.
 * @property {boolean} showConflicts - A boolean indicating whether conflicts in the current selection should be displayed.
 */
interface Props {
  enchantmentSearch: string
  itemNameSearch: string
  setBonusFilter: string | null
  showConflicts: boolean
  showOwnedOnly: boolean
}

export default useGearPlanner
