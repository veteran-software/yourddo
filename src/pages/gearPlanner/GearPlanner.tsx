import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Accordion, Badge, Button, Card, Col, Container, Form, Modal, Row, Stack, Tab, Tabs } from 'react-bootstrap'
import { FaChevronRight, FaGear, FaLayerGroup, FaMagnifyingGlass, FaXmark } from 'react-icons/fa6'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import {
  addSetup as addSetupAction,
  equipItem as equipItemAction,
  removeSetup as removeSetupAction,
  setActiveSetup as setActiveSetupAction,
  setAugment as setAugmentAction,
  setCurse as setCurseAction,
  updateSetup as updateSetupAction
} from '../../redux/slices/gearPlannerSlice'
import { getTroveOwners, normItem } from '../../utils/troveUtils.ts'
import AugmentSlotItem from './components/AugmentSlotItem.tsx'
import CharacterSettingsSidebar from './components/CharacterSettingsSidebar.tsx'
import CurseSlotItem from './components/CurseSlotItem.tsx'
import EnchantmentList from './components/EnchantmentList.tsx'
import EnchantmentSearchOffcanvas from './components/EnchantmentSearchOffcanvas.tsx'
import EnchantmentsSummary from './components/EnhancementsSummary.tsx'
import ItemBrowserOffcanvas from './components/ItemBrowserOffcanvas.tsx'
import SetBonusBrowserOffcanvas from './components/SetBonusBrowserOffcanvas.tsx'
import SetBonusesSummary from './components/SetBonusesSummary.tsx'
import { checkPotentialConflict, getSlotOwner, normalizeString, resolveConflicts } from './conflictResolver'
import { loadCurses, loadGearData, loadSetBonusIndex } from './dataLoader'
import {
  ARMOR_TYPES,
  ARTIFICER_PET_SLOTS,
  CLASS_PROFICIENCIES,
  type Curse,
  DRUID_PET_SLOTS,
  GEAR_CLASSES,
  GEAR_SLOTS,
  type GearAugment,
  type GearItem,
  type GearSetup,
  GearSlot,
  type SetBonusIndex,
  SHIELD_TYPES,
  WEAPON_TYPES
} from './types'
import './GearPlanner.css'

const WeaponCategory = ({
  category,
  types,
  activeSetup,
  dispatch
}: {
  category: string
  types: string[]
  activeSetup: GearSetup
  dispatch: ReturnType<typeof useAppDispatch>
}) => {
  return (
    <Accordion.Item eventKey={category} key={category} className='border-0'>
      <Accordion.Header className='bg-dark py-1'>{category} Weapons</Accordion.Header>
      <Accordion.Body className='bg-dark-subtle p-2'>
        <Row>
          {types.map((type) => (
            <Col xs={12} md={6} key={type}>
              <Form.Check
                type='checkbox'
                id={`weapon-${type}`}
                label={type}
                checked={activeSetup.weaponFilters.includes(type)}
                onChange={(e) => {
                  const updated = e.target.checked
                    ? [...activeSetup.weaponFilters, type]
                    : activeSetup.weaponFilters.filter((t) => t !== type)
                  dispatch(updateSetupAction({ id: activeSetup.id, weaponFilters: updated }))
                }}
              />
            </Col>
          ))}
        </Row>
      </Accordion.Body>
    </Accordion.Item>
  )
}

const GearPlanner = () => {
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
  const [setBonusIndex, setSetBonusIndex] = useState<SetBonusIndex>({})
  const [loading, setLoading] = useState(true)
  const [browsingSlot, setBrowsingSlot] = useState<GearSlot | null>(null)
  const [itemsToShow, setItemsToShow] = useState(50)
  const [showConflicts, setShowConflicts] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [showEnchantmentSearch, setShowEnchantmentSearch] = useState(false)
  const [showSetBonusBrowser, setShowSetBonusBrowser] = useState(false)
  const [browsingSet, setBrowsingSet] = useState<string | null>(null)
  const [setBonusFilter, setSetBonusFilter] = useState<string | null>(null)
  const [enchantmentSearch, setEnchantmentSearch] = useState('')
  const observerTarget = useRef<HTMLDivElement>(null)

  const openSlotBrowser = useCallback((slot: GearSlot | null) => {
    setBrowsingSlot(slot)
    setItemsToShow(50)
  }, [])

  const openSetBonusBrowser = useCallback((setName: string) => {
    setBrowsingSet(setName)
    setShowSetBonusBrowser(true)
  }, [])

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
        const { items, augments } = await loadGearData()
        setAllItems(items)
        setAllAugments(augments)
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
    return Object.values(activeSetup.slots).filter((item): item is GearItem => item !== null)
  }, [activeSetup])

  const artificerEquipped = useMemo(() => {
    if (!activeSetup?.classes.includes('Artificer')) return []
    return Object.values(artificerPet.slots).filter((item): item is GearItem => item !== null)
  }, [artificerPet.slots, activeSetup?.classes])

  const druidEquipped = useMemo(() => {
    if (!activeSetup?.classes.includes('Druid')) return []
    return Object.values(druidPet.slots).filter((item): item is GearItem => item !== null)
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
        const potential = checkPotentialConflict(ench, currentEquipped, slot, currentSlottedAugments)
        return potential.isConflict && potential.isRedundant
      })
    },
    [getContextInfo]
  )

  const shouldShowItem = useCallback(
    (item: GearItem, slot: GearSlot, setup: GearSetup, ignoreSetFilter = false) => {
      // Conflict/Lesser enchantment filter
      if (!showConflicts && isItemConflicting(item, slot)) {
        return false
      }

      // Level filter
      const itemLevel = parseInt(item.minLevel, 10) || 0
      if (itemLevel < setup.minLevel || itemLevel > setup.maxLevel) {
        return false
      }

      // Slot filter logic
      const slotMatches = (targetSlot: GearSlot, i: GearItem) => {
        if (targetSlot === GearSlot.ArtificerPetArmor || targetSlot === GearSlot.DruidPetArmor) {
          return i.slot === targetSlot && i.name.toLowerCase().includes('docent')
        }
        if (targetSlot === GearSlot.ArtificerPetWeapon || targetSlot === GearSlot.DruidPetWeapon) {
          return i.slot === targetSlot && i.name.toLowerCase().includes('collar')
        }
        return i.slot === targetSlot
      }

      if (!slotMatches(slot, item)) return false

      // Filters logic
      const weaponFilterMatches = (targetSlot: GearSlot, i: GearItem, s: GearSetup) => {
        if ((targetSlot === GearSlot.MainHand || targetSlot === GearSlot.OffHand) && s.weaponFilters.length > 0) {
          return s.weaponFilters.some((w) => {
            const weaponPart = w.toLowerCase()
            return (
              i.name.toLowerCase().includes(weaponPart) ||
              i.type.toLowerCase().includes(weaponPart) ||
              (weaponPart === 'handwraps' && i.type === 'Gloves')
            )
          })
        }
        return true
      }

      const armorFilterMatches = (targetSlot: GearSlot, i: GearItem, s: GearSetup) => {
        if (targetSlot === GearSlot.Armor && s.armorFilters.length > 0) {
          const isClothFilter = s.armorFilters.includes('Cloth Armor')
          const matchesCloth = isClothFilter && (i.type === 'Robe' || i.type === 'Outfit')
          const matchesOther = s.armorFilters.includes(i.type)
          return matchesCloth || matchesOther
        }
        return true
      }

      const otherFilterMatches = (targetSlot: GearSlot, i: GearItem, s: GearSetup) => {
        // Shield Filter
        if (targetSlot === GearSlot.OffHand && s.shieldFilters.length > 0) {
          if (!s.shieldFilters.includes(i.type)) return false
        }

        // Druid Metal Filter
        const isDruid = s.classes.includes('Druid')
        if (isDruid && !s.allowMetalWithDruid) {
          if (isMetal(i.material)) return false
        }

        // Set Bonus Filter
        if (!ignoreSetFilter && setBonusFilter) {
          const indexedItems = setBonusIndex[setBonusFilter]
          return indexedItems?.some((ii) => ii.name === i.name && ii.minLevel === Number(i.minLevel)) ?? false
        }
        return true
      }

      return (
        weaponFilterMatches(slot, item, setup) &&
        armorFilterMatches(slot, item, setup) &&
        otherFilterMatches(slot, item, setup)
      )
    },
    [showConflicts, isItemConflicting, isMetal, setBonusFilter, setBonusIndex]
  )

  const filteredSets = useMemo(() => {
    if (!activeSetup) return []
    const { minLevel: min, maxLevel: max } = activeSetup

    // Pre-calculate visible items for current setup in level range
    const visibleItemNames = new Set<string>()
    // If browsingSlot is set, we also want to know which sets are available for THAT slot.
    const setsWithItemsInSlot = new Set<string>()

    for (const i of allItems) {
      const level = Number(i.minLevel)
      if (level >= min && level <= max && isItemVisibleForClasses(i, activeSetup)) {
        const key = `${i.name}|${level.toString()}`
        visibleItemNames.add(key)

        // If we are browsing a slot, check if this item matches that slot (ignoring set filter)
        if (browsingSlot && shouldShowItem(i, browsingSlot, activeSetup, true)) {
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
            if (visibleItemNames.has(`${item.name}|${item.minLevel.toString()}`)) {
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
  }, [setBonusIndex, activeSetup, allItems, isItemVisibleForClasses, browsingSlot, shouldShowItem, itemToSetsMap])

  const filteredItems = useMemo(() => {
    if (!activeSetup || !browsingSlot) return []
    return allItems
      .filter((i) => shouldShowItem(i, browsingSlot, activeSetup))
      .sort((a, b) => {
        // Priority 1: Trove ownership
        const isOwnedA = troveData?.[normItem(a.name)] ? 1 : 0
        const isOwnedB = troveData?.[normItem(b.name)] ? 1 : 0
        if (isOwnedA !== isOwnedB) return isOwnedB - isOwnedA

        // Priority 2: Min Level (desc)
        const levelA = parseInt(a.minLevel, 10) || 0
        const levelB = parseInt(b.minLevel, 10) || 0
        if (levelB !== levelA) return levelB - levelA

        // Priority 3: Name (asc)
        return a.name.localeCompare(b.name)
      })
  }, [activeSetup, browsingSlot, allItems, shouldShowItem, troveData])

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
          if (indexedItems.some((ii) => ii.name === item.name && ii.minLevel === Number(item.minLevel))) {
            matchesSetName = true
            break
          }
        }
      }

      return (
        normalizeString(item.name).includes(searchLower) ||
        item.enchantments?.some((ench) => normalizeString(ench.name).includes(searchLower)) ||
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
        const levelA = parseInt(a.minLevel, 10) || 0
        const levelB = parseInt(b.minLevel, 10) || 0
        if (levelB !== levelA) return levelB - levelA

        // Priority 3: Name (asc)
        return a.name.localeCompare(b.name)
      })
      .reduce<Record<string, GearItem[]>>((acc, item) => {
        if (!acc[item.slot]) acc[item.slot] = []
        acc[item.slot].push(item)
        return acc
      }, {})
  }, [enchantmentSearch, allItems, shouldShowItem, setBonusIndex, activeSetup, isItemVisibleForClasses, troveData])

  const updateClassProficiencies = (setup: GearSetup, oldClasses: (string | null)[], newClasses: (string | null)[]) => {
    // 1. Identify what filters are granted by OLD classes
    const oldWeaponProficiencies = new Set<string>()
    const oldArmorProficiencies = new Set<string>()
    const oldShieldProficiencies = new Set<string>()
    oldClasses.forEach((cls) => {
      if (cls && CLASS_PROFICIENCIES[cls]) {
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
      if (cls && CLASS_PROFICIENCIES[cls]) {
        CLASS_PROFICIENCIES[cls].weapons.forEach((w) => newWeaponProficiencies.add(w))
        CLASS_PROFICIENCIES[cls].armor.forEach((a) => newArmorProficiencies.add(a))
        CLASS_PROFICIENCIES[cls].shields.forEach((s) => newShieldProficiencies.add(s))
      }
    })

    // 3. Remove filters that were granted by old classes but NOT by new classes
    const weaponsToRemove = [...oldWeaponProficiencies].filter((w) => !newWeaponProficiencies.has(w))
    const armorToRemove = [...oldArmorProficiencies].filter((a) => !newArmorProficiencies.has(a))
    const shieldsToRemove = [...oldShieldProficiencies].filter((s) => !newShieldProficiencies.has(s))

    const updatedWeaponFilters = setup.weaponFilters.filter((w) => !weaponsToRemove.includes(w))
    const updatedArmorFilters = setup.armorFilters.filter((a) => !armorToRemove.includes(a))
    const updatedShieldFilters = setup.shieldFilters.filter((s) => !shieldsToRemove.includes(s))

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

  const openSetBrowser = useCallback((setName: string) => {
    setBrowsingSet(setName)
    setShowSetBonusBrowser(true)
  }, [])

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

  const deleteSetup = (id: string) => {
    dispatch(removeSetupAction(id))
  }

  const selectItem = (slot: GearSlot, item: GearItem | null) => {
    dispatch(equipItemAction({ slot, item }))
    openSlotBrowser(null)
  }

  const setSlottedAugment = (itemId: string, slotIndex: number, augment: GearAugment | null, slot?: GearSlot) => {
    dispatch(setAugmentAction({ itemId, slotIndex, augment, slot }))
  }

  const setSlottedCurse = (itemId: string, curse: Curse | null, slot?: GearSlot) => {
    dispatch(setCurseAction({ itemId, curse, slot }))
  }

  const getApplicableAugments = (slotType: string, itemMinLevel: number) => {
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

    const allowedTypes = colorMap[slotType] || [slotType]

    const filtered = allAugments.filter((aug) => {
      if (!allowedTypes.includes(aug.augmentType)) return false

      return aug.minimumLevel <= levelLimit
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

        if (b.minimumLevel !== a.minimumLevel) return b.minimumLevel - a.minimumLevel
        return a.name.localeCompare(b.name)
      })
    })

    // Sort group names ascending
    const sortedGroupNames = Object.keys(groups).sort((a, b) => a.localeCompare(b))

    return { groups, sortedGroupNames }
  }

  const renderSlot = (slot: GearSlot, setup: GearSetup) => {
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
        <Card className={`h-100 shadow-sm ${selectedItem ? 'border-primary' : ''} position-relative`}>
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
                    <Badge bg='primary' className='shadow-sm' style={{ fontSize: '0.6rem' }}>
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
                <div className='fw-bold small text-dark mb-1'>{selectedItem.name}</div>
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

                {selectedItem.enchantments && selectedItem.enchantments.length > 0 && (
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
                      const slotted = currentSlottedAugments[selectedItem.id]?.[idx]
                      const itemMinLevel = parseInt(selectedItem.minLevel, 10) || 1
                      const applicable = getApplicableAugments(augSlot.augmentType, itemMinLevel)

                      return (
                        <AugmentSlotItem
                          key={idx}
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
                  const ineligibleTypes = ['Augment', 'Cosmetic', 'Wand', 'Scroll', 'Quiver', 'Ammunition']
                  if (ineligibleTypes.includes(selectedItem.type)) return null

                  const slottedCurse = activeSetup.slottedCurses[selectedItem.id]

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
              <div className='text-center italic small text-secondary'>No Item Selected</div>
            )}
          </Card.Body>
        </Card>
      </Col>
    )
  }

  if (loading) {
    return (
      <Container className='py-4 text-center'>
        <div className='spinner-border text-primary' role='status'>
          <span className='visually-hidden'>Loading Gear Data...</span>
        </div>
        <p className='mt-2'>Loading Gear Data...</p>
      </Container>
    )
  }

  if (!activeSetup) {
    return (
      <Container className='py-4'>
        <Card className='shadow'>
          <Card.Body className='text-center py-5'>
            <h4 className='text-muted'>No gear setups available.</h4>
            <Button variant='primary' className='mt-3' onClick={addSetup}>
              Create Default Setup
            </Button>
          </Card.Body>
        </Card>
      </Container>
    )
  }

  return (
    <div className='gear-planner-container'>
      <Button
        variant='primary'
        className='gear-planner-sidebar-toggle shadow-sm'
        onClick={() => {
          setShowSidebar(!showSidebar)
        }}
        title='Toggle Settings Sidebar'
      >
        <FaChevronRight className={showSidebar ? 'rotate-180' : ''} style={{ transition: 'transform 0.3s' }} />
      </Button>

      <CharacterSettingsSidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} activeSetup={activeSetup} />

      <Container fluid='lg' className='py-4'>
        <Card className='shadow'>
          <Card.Header className='bg-primary text-white py-3'>
            <Row className='align-items-center g-3'>
              <Col xs={12} md='auto'>
                <h2 className='mb-0'>Gear Planner</h2>
              </Col>
              <Col xs={12} md className='ms-md-auto'>
                <div className='d-flex justify-content-md-end gap-2'>
                  <Button
                    variant='light'
                    size='sm'
                    className='d-flex align-items-center gap-2'
                    onClick={() => {
                      setShowSetBonusBrowser(true)
                    }}
                  >
                    <FaLayerGroup /> Browse Set Bonuses
                  </Button>
                  <Button
                    variant='light'
                    size='sm'
                    className='d-flex align-items-center gap-2'
                    onClick={() => {
                      setShowEnchantmentSearch(true)
                    }}
                  >
                    <FaMagnifyingGlass /> Search Enchantments/Sets
                  </Button>
                </div>
              </Col>
              <Col xs={12} md='auto' className='d-flex gap-2 justify-content-md-end'>
                <Button
                  variant='outline-light'
                  size='sm'
                  className='d-flex align-items-center gap-2'
                  onClick={() => {
                    setShowSettings(true)
                  }}
                >
                  <FaGear /> Setup Settings
                </Button>
                <Button variant='outline-light' size='sm' onClick={addSetup}>
                  Add Setup
                </Button>
              </Col>
            </Row>
          </Card.Header>
          <Card.Body>
            <Tabs
              id='gear-setup-tabs'
              activeKey={activeSetupId}
              onSelect={(k) => {
                if (k) {
                  dispatch(setActiveSetupAction(k))
                }
              }}
              className='mb-4'
            >
              {setups.map((setup) => (
                <Tab
                  key={setup.id}
                  eventKey={setup.id}
                  title={
                    <Stack direction='horizontal' gap={2}>
                      <span>{setup.name}</span>
                      {setups.length > 1 && (
                        <Button
                          variant='link'
                          className='p-0 text-danger'
                          size='sm'
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteSetup(setup.id)
                          }}
                        >
                          <FaXmark />
                        </Button>
                      )}
                    </Stack>
                  }
                >
                  <div className='mt-3'>
                    <h5 className='mb-3 border-bottom pb-2'>Equipped Items</h5>
                    <Row>{GEAR_SLOTS.map((slot) => renderSlot(slot, setup))}</Row>
                    <SetBonusesSummary
                      equippedItems={characterEquipped}
                      slottedAugments={activeSetup.slottedAugments}
                      onSetClick={openSetBrowser}
                    />

                    <EnchantmentsSummary
                      equippedItems={characterEquipped}
                      slottedAugments={activeSetup.slottedAugments}
                    />

                    {setup.classes?.includes('Artificer') && setup.classes?.includes('Druid') && (
                      <div className='mt-4 p-2 bg-warning-subtle text-warning-emphasis border border-warning rounded small text-center fw-bold'>
                        Note: Only one pet may be active at a time.
                      </div>
                    )}

                    {setup.classes?.includes('Artificer') && (
                      <div className='mt-4 p-3 border border-info rounded bg-dark-subtle'>
                        <h5 className='mb-3 text-info border-bottom border-info pb-2'>Iron Defender (Artificer Pet)</h5>
                        <Row>{ARTIFICER_PET_SLOTS.map((slot) => renderSlot(slot, setup))}</Row>
                        <SetBonusesSummary
                          equippedItems={artificerEquipped}
                          slottedAugments={artificerPet.slottedAugments}
                          onSetClick={openSetBrowser}
                        />
                        <EnchantmentsSummary
                          equippedItems={artificerEquipped}
                          slottedAugments={artificerPet.slottedAugments}
                        />
                      </div>
                    )}

                    {setup.classes?.includes('Druid') && (
                      <div className='mt-4 p-3 border border-success rounded bg-dark-subtle'>
                        <h5 className='mb-3 text-success border-bottom border-success pb-2'>
                          Wolf Companion (Druid Pet)
                        </h5>
                        <Row>{DRUID_PET_SLOTS.map((slot) => renderSlot(slot, setup))}</Row>
                        <SetBonusesSummary
                          equippedItems={druidEquipped}
                          slottedAugments={druidPet.slottedAugments}
                          onSetClick={openSetBrowser}
                        />
                        <EnchantmentsSummary equippedItems={druidEquipped} slottedAugments={druidPet.slottedAugments} />
                      </div>
                    )}
                  </div>
                </Tab>
              ))}
            </Tabs>
          </Card.Body>
        </Card>

        <Modal
          show={showSettings}
          onHide={() => {
            setShowSettings(false)
          }}
          centered
          size='xl'
        >
          <Modal.Header closeButton className='bg-primary text-white'>
            <Modal.Title>Gear Setup Settings</Modal.Title>
          </Modal.Header>
          <Modal.Body className='bg-dark text-white p-4'>
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className='mb-4'>
                    <Form.Label className='fw-bold text-info'>Setup Name</Form.Label>
                    <Form.Control
                      type='text'
                      value={activeSetup.name}
                      className='bg-light text-dark'
                      onChange={(e) => {
                        dispatch(updateSetupAction({ id: activeSetup.id, name: e.target.value }))
                      }}
                    />
                  </Form.Group>

                  <Row className='mb-4'>
                    <Col xs={6}>
                      <Form.Group>
                        <Form.Label className='fw-bold text-info'>Min Level</Form.Label>
                        <Form.Control
                          type='number'
                          min={1}
                          max={34}
                          value={activeSetup.minLevel}
                          className='bg-light text-dark'
                          onChange={(e) => {
                            dispatch(updateSetupAction({ id: activeSetup.id, minLevel: Number(e.target.value) }))
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={6}>
                      <Form.Group>
                        <Form.Label className='fw-bold text-info'>Max Level</Form.Label>
                        <Form.Control
                          type='number'
                          min={1}
                          max={34}
                          value={activeSetup.maxLevel}
                          className='bg-light text-dark'
                          onChange={(e) => {
                            dispatch(updateSetupAction({ id: activeSetup.id, maxLevel: Number(e.target.value) }))
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className='mb-3'>
                    <Form.Label className='fw-bold text-info'>Classes (Up to 3)</Form.Label>
                    <Stack gap={2}>
                      {[0, 1, 2].map((idx) => (
                        <Form.Select
                          key={idx}
                          value={activeSetup.classes[idx] ?? ''}
                          className='bg-light text-dark'
                          onChange={(e) => {
                            const newClasses = [...activeSetup.classes]
                            newClasses[idx] = e.target.value || null

                            const setupUpdate: Partial<GearSetup> = {
                              id: activeSetup.id,
                              classes: newClasses
                            }

                            // Helper to calculate proficiencies
                            const tempSetup = { ...activeSetup, classes: newClasses }
                            updateClassProficiencies(tempSetup, activeSetup.classes, newClasses)
                            setupUpdate.weaponFilters = tempSetup.weaponFilters
                            setupUpdate.armorFilters = tempSetup.armorFilters
                            setupUpdate.shieldFilters = tempSetup.shieldFilters

                            dispatch(updateSetupAction(setupUpdate as GearSetup))
                          }}
                        >
                          <option value=''>Select Class...</option>
                          {GEAR_CLASSES.map((cls) => (
                            <option key={cls} value={cls}>
                              {cls}
                            </option>
                          ))}
                        </Form.Select>
                      ))}
                    </Stack>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className='mb-3'>
                    <Form.Label className='fw-bold text-info d-block'>Weapon Type Filters</Form.Label>
                    <Accordion data-bs-theme='dark' className='border border-secondary rounded overflow-hidden'>
                      {Object.entries(WEAPON_TYPES).map(([category, types]) => (
                        <WeaponCategory
                          key={category}
                          category={category}
                          types={types}
                          activeSetup={activeSetup}
                          dispatch={dispatch}
                        />
                      ))}
                    </Accordion>
                  </Form.Group>

                  <Form.Group className='mb-3'>
                    <Form.Label className='fw-bold text-info d-block'>Armor Type Filters</Form.Label>
                    <div className='p-2 border border-secondary rounded mb-3'>
                      <Row>
                        {ARMOR_TYPES.map((type) => (
                          <Col xs={12} md={6} key={type}>
                            <Form.Check
                              type='checkbox'
                              id={`armor-${type}`}
                              label={type}
                              checked={activeSetup.armorFilters.includes(type)}
                              onChange={(e) => {
                                const updated = e.target.checked
                                  ? [...activeSetup.armorFilters, type]
                                  : activeSetup.armorFilters.filter((t) => t !== type)
                                dispatch(updateSetupAction({ id: activeSetup.id, armorFilters: updated }))
                              }}
                            />
                          </Col>
                        ))}
                      </Row>
                    </div>

                    <Form.Label className='fw-bold text-info d-block'>Shield Type Filters</Form.Label>
                    <div className='p-2 border border-secondary rounded mb-3'>
                      <Row>
                        {SHIELD_TYPES.map((type) => (
                          <Col xs={12} md={6} key={type}>
                            <Form.Check
                              type='checkbox'
                              id={`shield-${type}`}
                              label={type}
                              checked={activeSetup.shieldFilters.includes(type)}
                              onChange={(e) => {
                                const updated = e.target.checked
                                  ? [...activeSetup.shieldFilters, type]
                                  : activeSetup.shieldFilters.filter((t) => t !== type)
                                dispatch(updateSetupAction({ id: activeSetup.id, shieldFilters: updated }))
                              }}
                            />
                          </Col>
                        ))}
                      </Row>
                    </div>

                    <Form.Label className='fw-bold text-info d-block'>Character Settings</Form.Label>
                    <div className='p-2 border border-secondary rounded'>
                      <Form.Check
                        type='checkbox'
                        id='druid-metal-override'
                        label='Allow Metal (Druidic Oath Override)'
                        checked={activeSetup.allowMetalWithDruid}
                        disabled={!activeSetup.classes.includes('Druid')}
                        onChange={(e) => {
                          dispatch(updateSetupAction({ id: activeSetup.id, allowMetalWithDruid: e.target.checked }))
                        }}
                      />
                      {!activeSetup.classes.includes('Druid') && (
                        <div className='text-muted small mt-0'>
                          <small>Only applicable if Druid class is selected.</small>
                        </div>
                      )}
                    </div>
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Modal.Body>
          <Modal.Footer className='bg-primary border-top-0'>
            <Button
              variant='light'
              onClick={() => {
                setShowSettings(false)
              }}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        <EnchantmentSearchOffcanvas
          showEnchantmentSearch={showEnchantmentSearch}
          setShowEnchantmentSearch={setShowEnchantmentSearch}
          enchantmentSearch={enchantmentSearch}
          setEnchantmentSearch={setEnchantmentSearch}
          showConflicts={showConflicts}
          setShowConflicts={setShowConflicts}
          searchResultsBySlot={searchResultsBySlot}
          getContextInfo={getContextInfo}
          selectItem={selectItem}
          openSetBonusBrowser={openSetBonusBrowser}
          troveData={troveData}
        />

        <SetBonusBrowserOffcanvas
          showSetBonusBrowser={showSetBonusBrowser}
          setShowSetBonusBrowser={setShowSetBonusBrowser}
          browsingSet={browsingSet}
          setBrowsingSet={setBrowsingSet}
          filteredSets={filteredSets}
          setBonusIndex={setBonusIndex}
          activeSetup={activeSetup}
          allItems={allItems}
          isItemVisibleForClasses={isItemVisibleForClasses}
          getContextInfo={getContextInfo}
          selectItem={selectItem}
          openSetBonusBrowser={openSetBonusBrowser}
          troveData={troveData}
        />

        <ItemBrowserOffcanvas
          browsingSlot={browsingSlot}
          openSlotBrowser={openSlotBrowser}
          itemsToShow={itemsToShow}
          filteredItems={filteredItems}
          activeSetup={activeSetup}
          showConflicts={showConflicts}
          setShowConflicts={setShowConflicts}
          setBonusFilter={setBonusFilter}
          setSetBonusFilter={setSetBonusFilter}
          filteredSets={filteredSets}
          getContextInfo={getContextInfo}
          selectItem={selectItem}
          isMetal={isMetal}
          openSetBonusBrowser={openSetBonusBrowser}
          observerTarget={observerTarget}
        />
      </Container>
    </div>
  )
}

export default GearPlanner
