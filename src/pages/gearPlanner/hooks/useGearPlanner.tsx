import {
  type Dispatch,
  type JSX,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { Badge, Card, Col } from 'react-bootstrap'
import { FaMagnifyingGlass } from 'react-icons/fa6'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks.ts'
import {
  addSetup as addSetupAction,
  equipItem as equipItemAction,
  removeSetup as removeSetupAction,
  setActiveSetup as setActiveSetupAction,
  setAugment as setAugmentAction,
  setCurse as setCurseAction,
  setFiligree as setFiligreeAction,
  setUnlockedFiligreeSlots as setUnlockedFiligreeSlotsAction
} from '../../../redux/slices/gearPlannerSlice.ts'
import { getTroveOwners, normItem } from '../../../utils/troveUtils.ts'
import AugmentSlotItem from '../components/AugmentSlotItem.tsx'
import CurseSlotItem from '../components/CurseSlotItem.tsx'
import EnchantmentList from '../components/EnchantmentList.tsx'
import {
  checkPotentialConflict,
  getSlotOwner,
  normalizeString,
  resolveConflicts
} from '../conflictResolver.ts'
import { loadCurses, loadGearData, loadSetBonusIndex } from '../dataLoader.ts'
import { getMaxFiligreeSlots, isMinorArtifact } from '../helpers'
import {
  CLASS_PROFICIENCIES,
  type Curse,
  type GearAugment,
  type GearItem,
  type GearSetup,
  GearSlot,
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
 * @param {function} props.setBrowsingSet - A function used to update the currently selected set being browsed.
 * @param {boolean} props.showConflicts - A flag indicating whether to display conflicting items.
 *
 * @returns {Object} An object containing state and utility functions related to the gear planner, including:
 * - Methods for interacting with browsing states, set bonuses, and gear items.
 * - State variables for tracking current slot browsing, conflict states, available items, display settings, and more.
 */
const useGearPlanner = (props: Props) => {
  const {
    enchantmentSearch,
    itemNameSearch,
    setBonusFilter,
    setBrowsingSet,
    showConflicts
  } = props

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
  const [setBonusIndex, setSetBonusIndex] = useState<SetBonusIndex>({})
  const [loading, setLoading] = useState(true)
  const [browsingSlot, setBrowsingSlot] = useState<GearSlot | null>(null)
  const [internalItemNameSearch, setInternalItemNameSearch] = useState('')
  const [itemsToShow, setItemsToShow] = useState(50)

  useEffect(() => {
    setItemsToShow(50)
  }, [itemNameSearch, internalItemNameSearch, browsingSlot])

  const [showSidebar, setShowSidebar] = useState(false)
  const [showEnchantmentSearch, setShowEnchantmentSearch] = useState(false)
  const [showSetBonusBrowser, setShowSetBonusBrowser] = useState(false)
  const observerTarget = useRef<HTMLDivElement>(null)

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
    if (!browsingSlot) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [loadMore, browsingSlot, itemsToShow])

  useEffect(() => {
    const run = async () => {
      try {
        const { items, augments, filigrees } = await loadGearData()
        setAllItems(items)
        setAllAugments(augments)
        setAllFiligrees(filigrees)
        const sbi = await loadSetBonusIndex()
        setSetBonusIndex(sbi)
        const curses = await loadCurses()
        setAllCurses(curses)
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
          !target.closest('.card-header')
        ) {
          setShowSidebar(false)
          setShowEnchantmentSearch(false)
          setShowSetBonusBrowser(false)
          openSlotBrowser(null)
        }
      }
    }

    const anyOpen =
      showSidebar ||
      showEnchantmentSearch ||
      showSetBonusBrowser ||
      browsingSlot !== null

    if (anyOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [
    showSidebar,
    showEnchantmentSearch,
    showSetBonusBrowser,
    browsingSlot,
    openSlotBrowser
  ])

  const activeSetup = setups.find((s) => s.id === activeSetupId) ?? setups[0]

  const isMetal = useCallback((material: string | null | undefined) => {
    if (!material) return false
    const metalMaterials = [
      'Steel',
      'Iron',
      'Gold',
      'Silver',
      'Mithral',
      'Adamantine',
      'Alchemical Silver',
      'Cold Iron',
      'Byeshk',
      'Bronze',
      'Copper'
    ]

    return metalMaterials.includes(material)
  }, [])

  const isItemVisibleForClasses = useCallback(
    (item: GearItem, setup: GearSetup) => {
      const isArtificer = setup.classes.includes('Artificer')
      const isDruid = setup.classes.includes('Druid')

      if (
        item.slot === GearSlot.ArtificerPetArmor ||
        item.slot === GearSlot.ArtificerPetWeapon
      ) {
        return isArtificer
      }
      if (
        item.slot === GearSlot.DruidPetArmor ||
        item.slot === GearSlot.DruidPetWeapon
      ) {
        return isDruid
      }
      return true
    },
    []
  )

  const itemToSetsMap = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const [setName, items] of Object.entries(setBonusIndex)) {
      for (const item of items) {
        const key = `${item.name}|${String(item.minLevel)}`
        const list = map.get(key)
        if (list) {
          list.push(setName)
        } else {
          map.set(key, [setName])
        }
      }
    }
    return map
  }, [setBonusIndex])

  const characterEquipped = useMemo(() => {
    if (!activeSetup) return []
    return Object.values(activeSetup.slots).filter(
      (item): item is GearItem => item !== null
    )
  }, [activeSetup])

  const artificerEquipped = useMemo(() => {
    if (!activeSetup?.classes.includes('Artificer')) return []
    return Object.values(artificerPet.slots).filter(
      (item): item is GearItem => item !== null
    )
  }, [artificerPet.slots, activeSetup?.classes])

  const druidEquipped = useMemo(() => {
    if (!activeSetup?.classes.includes('Druid')) return []
    return Object.values(druidPet.slots).filter(
      (item): item is GearItem => item !== null
    )
  }, [druidPet.slots, activeSetup?.classes])

  const characterConflicts = useMemo(
    () => resolveConflicts(characterEquipped, activeSetup?.slottedAugments),
    [characterEquipped, activeSetup?.slottedAugments]
  )

  const artificerConflicts = useMemo(
    () => resolveConflicts(artificerEquipped, artificerPet.slottedAugments),
    [artificerEquipped, artificerPet.slottedAugments]
  )

  const druidConflicts = useMemo(
    () => resolveConflicts(druidEquipped, druidPet.slottedAugments),
    [druidEquipped, druidPet.slottedAugments]
  )

  const getContextInfo = useCallback(
    (slot: string) => {
      const owner = getSlotOwner(slot)
      let currentConflicts = characterConflicts
      let currentEquipped = characterEquipped
      let currentSlottedAugments = activeSetup?.slottedAugments

      if (owner === 'artificer_pet') {
        currentConflicts = artificerConflicts
        currentEquipped = artificerEquipped
        currentSlottedAugments = artificerPet.slottedAugments
      } else if (owner === 'druid_pet') {
        currentConflicts = druidConflicts
        currentEquipped = druidEquipped
        currentSlottedAugments = druidPet.slottedAugments
      }

      return { currentConflicts, currentEquipped, currentSlottedAugments }
    },
    [
      characterConflicts,
      artificerConflicts,
      druidConflicts,
      characterEquipped,
      artificerEquipped,
      druidEquipped,
      activeSetup?.slottedAugments,
      artificerPet.slottedAugments,
      druidPet.slottedAugments
    ]
  )

  const isItemConflicting = useCallback(
    (item: GearItem, slot: GearSlot) => {
      if (!item.enchantments) return false
      const { currentEquipped, currentSlottedAugments } = getContextInfo(slot)

      return item.enchantments.some((ench) => {
        const potential = checkPotentialConflict(
          ench,
          currentEquipped,
          slot,
          currentSlottedAugments
        )
        return potential.isConflict && potential.isRedundant
      })
    },
    [getContextInfo]
  )

  const shouldShowItem = useCallback(
    (
      item: GearItem,
      slot: GearSlot,
      setup: GearSetup,
      ignoreSetFilter = false
    ) => {
      // Conflict/Lesser enchantment filter
      if (!showConflicts && isItemConflicting(item, slot)) {
        return false
      }

      // Level filter
      const itemLevel = Number.parseInt(item.minLevel, 10) || 1
      if (itemLevel < setup.minLevel || itemLevel > setup.maxLevel) {
        return false
      }

      // Slot filter logic
      const slotMatches = (targetSlot: GearSlot, i: GearItem) => {
        // Filigrees are special
        if (targetSlot === GearSlot.Filigree) {
          return i.slot === GearSlot.Filigree
        }
        // Items are already pre-slotted during data load. Rely on slot alone.
        return i.slot === targetSlot
      }

      if (!slotMatches(slot, item)) return false

      // Filters logic
      const weaponFilterMatches = (
        targetSlot: GearSlot,
        i: GearItem,
        s: GearSetup
      ) => {
        if (
          targetSlot === GearSlot.MainHand ||
          targetSlot === GearSlot.OffHand
        ) {
          // If the item is a weapon, it must match a weapon filter
          const isWeapon =
            Object.values(WEAPON_TYPES).flat().includes(i.type) ||
            (i.type === 'Gloves' && i.name.toLowerCase().includes('handwraps'))
          if (isWeapon) {
            if (s.weaponFilters.length === 0) {
              // If no filters are checked, display all weapons
              return true
            }
            return s.weaponFilters.some((w) => {
              const weaponPart = w.toLowerCase()
              const typeLower = i.type.toLowerCase()
              const nameLower = i.name.toLowerCase()
              return (
                typeLower === weaponPart ||
                (weaponPart === 'handwraps' &&
                  (i.type === 'Gloves' || typeLower === 'handwraps')) ||
                (i.type === 'Weapon' && nameLower.includes(weaponPart))
              )
            })
          }
        }
        return true
      }

      const armorFilterMatches = (
        targetSlot: GearSlot,
        i: GearItem,
        s: GearSetup
      ) => {
        if (targetSlot === GearSlot.Armor) {
          if (s.armorFilters.length > 0) {
            const isClothFilter = s.armorFilters.includes('Cloth Armor')
            const matchesCloth =
              isClothFilter && (i.type === 'Robe' || i.type === 'Outfit')
            const matchesOther = s.armorFilters.includes(i.type)
            return matchesCloth || matchesOther
          } else {
            // If no armor filters are checked, show all armor
            return true
          }
        }
        return true
      }

      const otherFilterMatches = (
        targetSlot: GearSlot,
        i: GearItem,
        s: GearSetup
      ) => {
        // Shield Filter
        if (targetSlot === GearSlot.OffHand) {
          if (s.shieldFilters.length > 0) {
            if (!s.shieldFilters.includes(i.type)) return false
          } else if (i.type === 'Rune Arm' || SHIELD_TYPES.includes(i.type)) {
            // If no shield filters are selected, show all shields and rune arms
            return true
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
          const indexedItems = setBonusIndex[setBonusFilter]
          const itemLvl = Number(i.minLevel) || 1
          return (
            indexedItems?.some(
              (ii) => ii.name === i.name && ii.minLevel === itemLvl
            ) ?? false
          )
        }
        return true
      }

      if (!weaponFilterMatches(slot, item, setup)) return false
      if (!armorFilterMatches(slot, item, setup)) return false
      if (!otherFilterMatches(slot, item, setup)) return false

      // Item Name Search Filter
      if (itemNameSearch) {
        const searchLower = itemNameSearch.toLowerCase().trim()
        if (!item.name.toLowerCase().includes(searchLower)) {
          return false
        }
      }

      return true
    },
    [
      showConflicts,
      isItemConflicting,
      isMetal,
      setBonusFilter,
      setBonusIndex,
      itemNameSearch
    ]
  )

  const filteredSets = useMemo(() => {
    if (!activeSetup) return []
    const { minLevel: min, maxLevel: max } = activeSetup

    // Pre-calculate visible items for current setup in level range
    const visibleItemNames = new Set<string>()
    // If browsingSlot is set, we also want to know which sets are available for THAT slot.
    const setsWithItemsInSlot = new Set<string>()

    for (const i of allItems) {
      const level = Number(i.minLevel) || 1
      if (
        level >= min &&
        level <= max &&
        isItemVisibleForClasses(i, activeSetup)
      ) {
        const key = `${i.name}|${level.toString()}`
        visibleItemNames.add(key)

        // If we are browsing a slot, check if this item matches that slot (ignoring set filter)
        if (
          browsingSlot &&
          shouldShowItem(i, browsingSlot, activeSetup, true)
        ) {
          const itemSets = itemToSetsMap.get(key)
          if (itemSets) {
            itemSets.forEach((s) => setsWithItemsInSlot.add(s))
          }
        }
      }
    }

    return Object.keys(setBonusIndex)
      .filter((setName) => {
        // Global requirement: must have items in level range and visible for classes
        const indexedItems = setBonusIndex[setName]
        let hasVisibleInLevelRange = false
        for (const item of indexedItems) {
          if (item.minLevel >= min && item.minLevel <= max) {
            if (
              visibleItemNames.has(`${item.name}|${item.minLevel.toString()}`)
            ) {
              hasVisibleInLevelRange = true
              break
            }
          }
        }
        if (!hasVisibleInLevelRange) return false

        // Slot-specific requirement: if browsing a slot, must have items in this slot
        if (browsingSlot) {
          return setsWithItemsInSlot.has(setName)
        }

        return true
      })
      .sort((a, b) => a.localeCompare(b))
  }, [
    setBonusIndex,
    activeSetup,
    allItems,
    isItemVisibleForClasses,
    browsingSlot,
    shouldShowItem,
    itemToSetsMap
  ])

  const filteredItems = useMemo(() => {
    if (!activeSetup || !browsingSlot) return []
    const searchLower = (itemNameSearch || internalItemNameSearch)
      .toLowerCase()
      .trim()

    return allItems
      .filter((i) => {
        const matchesVisibility =
          isItemVisibleForClasses(i, activeSetup) &&
          shouldShowItem(i, browsingSlot, activeSetup)

        if (!matchesVisibility) return false

        if (searchLower.length > 0) {
          return normalizeString(i.name).includes(searchLower)
        }

        return true
      })
      .sort((a, b) => {
        // Priority 1: Trove ownership
        const isOwnedA = troveData?.[normItem(a.name)] ? 1 : 0
        const isOwnedB = troveData?.[normItem(b.name)] ? 1 : 0
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
    allItems,
    shouldShowItem,
    isItemVisibleForClasses,
    troveData,
    itemNameSearch,
    internalItemNameSearch
  ])

  const searchResultsBySlot = useMemo(() => {
    if (enchantmentSearch.length <= 2) return null

    const searchLower = enchantmentSearch.toLowerCase().trim()

    const itemMatchesSearch = (item: GearItem) => {
      if (!activeSetup) return false

      // Basic visibility check
      if (!isItemVisibleForClasses(item, activeSetup)) return false

      // Respect all filters (level, weapon/armor types, conflicts, etc.)
      // We ignore the active set filter because we want to search all items.
      if (!shouldShowItem(item, item.slot, activeSetup, true)) return false

      let matchesSetName = false
      for (const setName of Object.keys(setBonusIndex)) {
        if (normalizeString(setName).includes(searchLower)) {
          const indexedItems = setBonusIndex[setName]
          const itemLvl = Number(item.minLevel) || 1
          if (
            indexedItems.some(
              (ii) => ii.name === item.name && ii.minLevel === itemLvl
            )
          ) {
            matchesSetName = true
            break
          }
        }
      }

      return (
        normalizeString(item.name).includes(searchLower) ||
        item.enchantments?.some((ench) =>
          normalizeString(ench.name).includes(searchLower)
        ) ||
        matchesSetName
      )
    }

    return allItems
      .filter(itemMatchesSearch)
      .sort((a, b) => {
        // Priority 1: Trove ownership
        const isOwnedA = troveData?.[normItem(a.name)] ? 1 : 0
        const isOwnedB = troveData?.[normItem(b.name)] ? 1 : 0
        if (isOwnedA !== isOwnedB) return isOwnedB - isOwnedA

        // Priority 2: Min Level (desc)
        const levelA = Number.parseInt(a.minLevel, 10) || 1
        const levelB = Number.parseInt(b.minLevel, 10) || 1
        if (levelB !== levelA) return levelB - levelA

        // Priority 3: Name (asc)
        return a.name.localeCompare(b.name)
      })
      .reduce<Record<string, GearItem[]>>((acc, item) => {
        if (!acc[item.slot]) acc[item.slot] = []
        acc[item.slot].push(item)
        return acc
      }, {})
  }, [
    enchantmentSearch,
    allItems,
    shouldShowItem,
    setBonusIndex,
    activeSetup,
    isItemVisibleForClasses,
    troveData
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
  const updateClassProficiencies = (
    setup: GearSetup,
    oldClasses: (string | null)[],
    newClasses: (string | null)[]
  ) => {
    // 1. Identify what filters are granted by OLD classes
    const oldWeaponProficiencies = new Set<string>()
    const oldArmorProficiencies = new Set<string>()
    const oldShieldProficiencies = new Set<string>()
    oldClasses.forEach((cls) => {
      if (cls && CLASS_PROFICIENCIES[cls]) {
        CLASS_PROFICIENCIES[cls].weapons.forEach((w) =>
          oldWeaponProficiencies.add(w)
        )
        CLASS_PROFICIENCIES[cls].armor.forEach((a) =>
          oldArmorProficiencies.add(a)
        )
        CLASS_PROFICIENCIES[cls].shields.forEach((s) =>
          oldShieldProficiencies.add(s)
        )
      }
    })

    // 2. Identify what filters are granted by NEW classes
    const newWeaponProficiencies = new Set<string>()
    const newArmorProficiencies = new Set<string>()
    const newShieldProficiencies = new Set<string>()
    newClasses.forEach((cls) => {
      if (cls && CLASS_PROFICIENCIES[cls]) {
        CLASS_PROFICIENCIES[cls].weapons.forEach((w) =>
          newWeaponProficiencies.add(w)
        )
        CLASS_PROFICIENCIES[cls].armor.forEach((a) =>
          newArmorProficiencies.add(a)
        )
        CLASS_PROFICIENCIES[cls].shields.forEach((s) =>
          newShieldProficiencies.add(s)
        )
      }
    })

    // 3. Remove filters that were granted by old classes but NOT by new classes
    const weaponsToRemove = new Set(
      [...oldWeaponProficiencies].filter((w) => !newWeaponProficiencies.has(w))
    )
    const armorToRemove = new Set(
      [...oldArmorProficiencies].filter((a) => !newArmorProficiencies.has(a))
    )
    const shieldsToRemove = new Set(
      [...oldShieldProficiencies].filter((s) => !newShieldProficiencies.has(s))
    )

    const updatedWeaponFilters = setup.weaponFilters.filter(
      (w) => !weaponsToRemove.has(w)
    )
    const updatedArmorFilters = setup.armorFilters.filter(
      (a) => !armorToRemove.has(a)
    )
    const updatedShieldFilters = setup.shieldFilters.filter(
      (s) => !shieldsToRemove.has(s)
    )

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

  const openSetBrowser = useCallback(
    (setName: string) => {
      setBrowsingSet(setName)
      setShowSetBonusBrowser(true)
    },
    [setBrowsingSet]
  )

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
      slottedCurses: {}
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
    if (slot === GearSlot.Filigree) {
      if (item && activeSetup) {
        // We need to know which item we are slotting into.
        // We'll look for the global filigreeTarget if available, or fallback to MainHand
        const target = (window as any).filigreeTarget || {
          item: activeSetup.slots[GearSlot.MainHand],
          slot: GearSlot.MainHand
        }

        const weapon = target.item
        const weaponSlot = target.slot

        if (weapon) {
          // This should only be reachable from FiligreeModal, and now it checks duplicates internally.
          // But for safety, let's keep it (or better, let's not use window.alert here)
          const slotted = activeSetup.slottedFiligrees[weapon.id] || []
          // We don't have browsingFiligreeSlotIndex here anymore, it's managed in the Modal.
          // This code in useGearPlanner is actually mostly redundant now if FiligreeModal calls setSlottedFiligree directly.
          // Let's see if we can simplify this.
        }
      }
    } else {
      if (activeSetup && !item) {
        const oldItem = activeSetup.slots[slot]
        if (oldItem && activeSetup.slottedFiligrees[oldItem.id]) {
          const hasFiligrees = activeSetup.slottedFiligrees[oldItem.id].some(
            (f) => f !== null
          )
          if (hasFiligrees) {
            if (
              window.confirm(
                'This item has slotted filigrees. Removing it will clear all filigrees and unlocked slots. Are you sure?'
              )
            ) {
              dispatch(equipItemAction({ slot, item }))
              openSlotBrowser(null)
            }
            return
          }
        }
      } else if (activeSetup && item) {
        const oldItem = activeSetup.slots[slot]
        if (
          oldItem &&
          oldItem.id !== item.id &&
          activeSetup.slottedFiligrees[oldItem.id]
        ) {
          const hasFiligrees = activeSetup.slottedFiligrees[oldItem.id].some(
            (f) => f !== null
          )
          if (hasFiligrees) {
            if (
              window.confirm(
                'The item currently in this slot has slotted filigrees. Replacing it will clear all filigrees and unlocked slots for the old item. Are you sure?'
              )
            ) {
              dispatch(equipItemAction({ slot, item }))
              openSlotBrowser(null)
            }
            return
          }
        }
      }
      dispatch(equipItemAction({ slot, item }))
    }
    openSlotBrowser(null)
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
  const setSlottedAugment = (
    itemId: string,
    slotIndex: number,
    augment: GearAugment | null,
    slot?: GearSlot
  ): void => {
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
  const setSlottedCurse = (
    itemId: string,
    curse: Curse | null,
    slot?: GearSlot
  ) => {
    dispatch(setCurseAction({ itemId, curse, slot }))
  }

  const setSlottedFiligree = (
    itemId: string,
    slotIndex: number,
    filigree: LootItem | null,
    slot?: GearSlot
  ) => {
    dispatch(setFiligreeAction({ itemId, slotIndex, filigree, slot }))
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

    let allowedTypes = colorMap[slotType] || [slotType]

    // Dinosaur Bone Slot and Lamordia slot mapping adjustments
    // We normalize the slotType here to match the augmentType used in allAugments.
    if (
      slotType.startsWith('Isle of Dread:') ||
      slotType.startsWith('Lamordia:') ||
      slotType.startsWith('Dino Bone')
    ) {
      // Normalize:
      // "Isle of Dread: Scale Slot (Accessory):" -> "Isle of Dread: Scale (Accessory)"
      // "Lamordia: Melancholic Slot (Weapon):" -> "Lamordia: Melancholic (Weapon)"
      // "Dino Bone" -> "Isle of Dread:"
      const normalized = slotType
        .replace('Dino Bone', 'Isle of Dread:')
        .replace(/\sSlot/g, '')
        .replace(/:$/, '')
        .replace(/:\s*\(/g, ' (') // Ensure "Isle of Dread: Scale Slot (Accessory):" -> "Isle of Dread: Scale (Accessory)"
        .trim()
      allowedTypes = [normalized]
    }

    const filtered = allAugments.filter((aug) => {
      // For typed slots (Red, Blue, etc.), respect the mapping.
      // For specialty slots (Dino Bone, Lamordia), match exactly or use mapping if defined.
      if (!allowedTypes.includes(aug.augmentType)) return false

      // Augments without minimumLevel (or level 0/1) are always applicable.
      // If the augment has a minimumLevel, it must be <= the item's minimumLevel.
      const augLevel = aug.minimumLevel ?? 1
      return augLevel <= levelLimit
    })

    // Group by augmentType
    const groups: Record<string, GearAugment[]> = {}
    filtered.forEach((aug) => {
      if (!groups[aug.augmentType]) groups[aug.augmentType] = []
      groups[aug.augmentType].push(aug)
    })

    // Sort within groups
    Object.values(groups).forEach((group) => {
      group.sort((a, b) => {
        // Priority 1: Trove ownership
        const isOwnedA = troveData?.[normItem(a.name)] ? 1 : 0
        const isOwnedB = troveData?.[normItem(b.name)] ? 1 : 0
        if (isOwnedA !== isOwnedB) return isOwnedB - isOwnedA

        if (b.minimumLevel !== a.minimumLevel)
          return b.minimumLevel - a.minimumLevel
        return a.name.localeCompare(b.name)
      })
    })

    // Sort group names ascending
    const sortedGroupNames = Object.keys(groups).sort((a, b) =>
      a.localeCompare(b)
    )

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

    if (owner === 'character') {
      selectedItem = setup.slots[slot]
      currentConflicts = characterConflicts
      currentEquipped = characterEquipped
      currentSlottedAugments = activeSetup.slottedAugments
    } else if (owner === 'artificer_pet') {
      selectedItem = artificerPet.slots[slot]
      currentConflicts = artificerConflicts
      currentEquipped = artificerEquipped
      currentSlottedAugments = artificerPet.slottedAugments
    } else if (owner === 'druid_pet') {
      selectedItem = druidPet.slots[slot]
      currentConflicts = druidConflicts
      currentEquipped = druidEquipped
      currentSlottedAugments = druidPet.slottedAugments
    }

    return (
      <Col key={slot} xs={12} sm={6} md={4} lg={3} className='mb-3 px-1'>
        <Card
          className={`h-100 shadow-sm ${selectedItem ? 'border-primary' : ''} position-relative`}
        >
          <Card.Header
            className='py-1 px-2 bg-secondary-subtle text-secondary-emphasis small fw-bold d-flex justify-content-between align-items-center cursor-pointer'
            onClick={() => {
              openSlotBrowser(slot)
            }}
          >
            <div className='d-flex align-items-center gap-2'>
              <span>{slot}</span>
              {selectedItem &&
                (() => {
                  const troveEntry = troveData?.[normItem(selectedItem.name)]
                  if (!troveEntry) return null
                  const owners = getTroveOwners(troveEntry)
                  if (!owners) return null
                  return (
                    <Badge
                      bg='primary'
                      className='shadow-sm'
                      style={{ fontSize: '0.6rem' }}
                    >
                      {owners}
                    </Badge>
                  )
                })()}
            </div>
            <FaMagnifyingGlass className='text-muted' size={12} />
          </Card.Header>

          <Card.Body
            className={`p-2 d-flex flex-column align-items-center ${selectedItem ? 'bg-white' : 'bg-dark-subtle justify-content-center'}`}
            style={{ minHeight: '100px' }}
          >
            {selectedItem ? (
              <div className='text-center w-100 d-flex flex-column'>
                <div className='fw-bold small text-dark mb-1'>
                  {selectedItem.name}
                </div>
                <div
                  className='text-secondary mb-0'
                  style={{ fontSize: '0.7rem' }}
                >
                  ML: {selectedItem.minLevel || '1'} |{' '}
                  {selectedItem.type || 'Item'}
                  {selectedItem.material && (
                    <>
                      &nbsp;|&nbsp;
                      <span
                        className={`mb-1 fw-bold ${isMetal(selectedItem.material) ? 'text-danger' : 'text-success'}`}
                        style={{ fontSize: '0.6rem' }}
                      >
                        {selectedItem.material}{' '}
                        {isMetal(selectedItem.material) && '(Metal)'}
                      </span>
                    </>
                  )}
                </div>
                {selectedItem.setBonus && selectedItem.setBonus.length > 0 && (
                  <div className='my-0'>
                    {selectedItem.setBonus.map((sb) => (
                      <Badge
                        key={sb.name}
                        bg='warning'
                        text='dark'
                        className='me-1 set-bonus-badge-clickable'
                        style={{ fontSize: '0.65rem' }}
                        onClick={() => {
                          openSetBonusBrowser(sb.name)
                        }}
                      >
                        Set: {sb.name}
                      </Badge>
                    ))}
                  </div>
                )}

                {selectedItem.enchantments &&
                  selectedItem.enchantments.length > 0 && (
                    <div
                      className='text-start mt-1 pt-1 border-top gear-planner-slot-enchantments'
                      style={{ fontSize: '0.65rem' }}
                    >
                      <EnchantmentList
                        enchantments={selectedItem.enchantments}
                        itemId={selectedItem.id}
                        conflicts={currentConflicts}
                        equippedItems={currentEquipped}
                        source='slot'
                        browsingSlot={slot}
                        slottedAugments={currentSlottedAugments}
                      />
                    </div>
                  )}
                {selectedItem.augments && selectedItem.augments.length > 0 && (
                  <div className='text-start mt-1 pt-1 border-top gear-planner-slot-augments'>
                    {selectedItem.augments.map((augSlot, idx) => {
                      const slotted =
                        currentSlottedAugments[selectedItem.id]?.[idx]
                      const itemMinLevel =
                        Number.parseInt(selectedItem.minLevel, 10) || 1
                      const applicable = getApplicableAugments(
                        augSlot.augmentType,
                        itemMinLevel
                      )

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
                          setSlottedAugment={setSlottedAugment}
                          openSetBonusBrowser={openSetBonusBrowser}
                        />
                      )
                    })}
                  </div>
                )}
                {(() => {
                  const maxSlots = getMaxFiligreeSlots(selectedItem)

                  if (maxSlots > 0) {
                    const itemSlottedFiligrees =
                      setup.slottedFiligrees[selectedItem.id] || []
                    const activeFiligrees = itemSlottedFiligrees.filter(
                      (f) => f !== null
                    )

                    return (
                      <div className='text-start mt-1 pt-1 border-top'>
                        <div
                          className='fw-bold'
                          style={{
                            color: '#ff8c00',
                            cursor: 'pointer',
                            fontSize: '0.7rem'
                          }}
                          onClick={() => {
                            ;(window as any).openFiligreeModal?.(
                              selectedItem,
                              slot
                            )
                          }}
                        >
                          {activeFiligrees.length > 0
                            ? `Filigrees Slotted (${activeFiligrees.length})`
                            : isMinorArtifact(selectedItem)
                              ? 'Minor Artifact'
                              : 'Sentience Accepted'}
                        </div>
                        {activeFiligrees.length > 0 && (
                          <div
                            className='mt-1 ps-1 border-start border-2'
                            style={{ borderColor: '#ff8c00' }}
                          >
                            {activeFiligrees.map((f, fIdx) => (
                              <div
                                key={`${f.id}-${String(fIdx)}`}
                                className='mb-1'
                              >
                                <div
                                  className='fw-bold text-dark'
                                  style={{ fontSize: '0.65rem' }}
                                >
                                  {f.name}
                                </div>
                                {f.enchantments && (
                                  <div
                                    className='text-secondary'
                                    style={{
                                      fontSize: '0.6rem',
                                      lineHeight: '1.1'
                                    }}
                                  >
                                    <EnchantmentList
                                      enchantments={f.enchantments}
                                      itemId={selectedItem.id}
                                      conflicts={currentConflicts}
                                      equippedItems={currentEquipped}
                                      source='slot'
                                      browsingSlot={slot}
                                      slottedAugments={currentSlottedAugments}
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  }
                  return null
                })()}
                {(() => {
                  const ineligibleTypes = [
                    'Augment',
                    'Cosmetic',
                    'Wand',
                    'Scroll',
                    'Quiver',
                    'Ammunition'
                  ]
                  if (ineligibleTypes.includes(selectedItem.type)) return null

                  const slottedCurse =
                    activeSetup.slottedCurses[selectedItem.id]

                  return (
                    <div className='text-start mt-1 pt-1 border-top gear-planner-slot-curses'>
                      <CurseSlotItem
                        selectedItem={selectedItem}
                        allCurses={allCurses}
                        slotted={slottedCurse}
                        slot={slot}
                        currentConflicts={currentConflicts}
                        currentEquipped={currentEquipped}
                        currentSlottedAugments={currentSlottedAugments}
                        setCurse={setSlottedCurse}
                      />
                    </div>
                  )
                })()}
              </div>
            ) : (
              <div className='text-center italic small text-secondary'>
                No Item Selected
              </div>
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
    allItems,
    artificerEquipped,
    browsingSlot,
    characterEquipped,
    deleteSetup,
    druidEquipped,
    filteredItems,
    filteredSets,
    getContextInfo,
    isItemVisibleForClasses,
    isMetal,
    itemNameSearch: itemNameSearch || internalItemNameSearch,
    itemsToShow,
    loading,
    openSetBonusBrowser,
    openSetBrowser,
    openSlotBrowser,
    renderSlot,
    searchResultsBySlot,
    selectItem,
    setBonusIndex,
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
    allFiligrees,
    updateClassProficiencies
  }
}

/**
 * Interface representing the properties for a component handling item filtering and state management.
 *
 * @interface
 *
 * @property {string} enchantmentSearch - A string representing the search query for enchantments.
 * @property {string | null} setBonusFilter - A string representing the currently applied set bonus filter, or null if no filter is applied.
 * @property {Dispatch<SetStateAction<string | null>>} setBrowsingSet - A state setter function used to update the currently selected browsing set.
 * @property {boolean} showConflicts - A boolean indicating whether conflicts in the current selection should be displayed.
 */
interface Props {
  enchantmentSearch: string
  itemNameSearch: string
  setBonusFilter: string | null
  setBrowsingSet: Dispatch<SetStateAction<string | null>>
  showConflicts: boolean
}

export default useGearPlanner
