import type { ReactElement } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Accordion,
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Collapse,
  Container,
  Form,
  ListGroup,
  Row,
  Stack,
  Table
} from 'react-bootstrap'
import { FaArrowUpRightFromSquare } from 'react-icons/fa6'
import { shallowEqual } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import AugmentSlotFilterableDropdown from '../../components/common/AugmentSlotFilterableDropdown.tsx'
import PermalinkModal from '../../components/common/PermalinkModal.tsx'
import type { ShoppingListTotals } from '../../components/common/ShoppingListDrawer.tsx'
import ShoppingListDrawer from '../../components/common/ShoppingListDrawer.tsx'
import { loadEssenceCraftingData } from '../../data/releaseClient.ts'
import { useAppSelector } from '../../redux/hooks.ts'
import type { AugmentItem } from '../../types/augmentItem.ts'
import type { Ingredient } from '../../types/ingredients.ts'
import { findAugmentsForSlot } from '../../utils/augmentUtils.ts'
import { getOwnedIngredients } from '../../utils/jsxUtils.tsx'
import { toSingularName } from '../../utils/stringUtils.ts'
import {
  buildPermalinkUrl,
  encodeEssencePermalink,
  type PermalinkStatePayload,
  readCcFromUrl,
  removeCcFromUrl,
  tryDecodeEssencePermalink
} from './permalink.ts'
import {
  type AffixKind,
  ALL_SLOT_KEYS,
  ALLOWED_AUGMENT_KEYS,
  AVAILABLE_AUGMENT_TYPES,
  type EssenceCraftingEntry,
  type ItemAugmentSlotState,
  type ItemState
} from './types.ts'
import {
  allowedAugmentColorsForSlot,
  filterAugmentOptions,
  getAffixOptions,
  iterateItemsOnLevelChange,
  ML_OPTIONS,
  sanitizeAugmentsOnItems,
  STORAGE_KEY
} from './utils.ts'

const readSessionStorageItem = (key: string): string | null => {
  if (typeof sessionStorage === 'undefined') return null

  try {
    return sessionStorage.getItem(key)
  } catch {
    return null
  }
}

const getShardLevelLabel = (boundLv: number | undefined, unboundLv: number | undefined): string => {
  if (boundLv != null && unboundLv != null)
    return `Shard Level (Bound ${String(boundLv)} / Unbound ${String(unboundLv)})`
  if (boundLv != null) return `Shard Level (Bound ${String(boundLv)})`
  if (unboundLv != null) return `Shard Level (Unbound ${String(unboundLv)})`
  return ''
}

interface InitialEssenceCraftingState {
  items: Record<string, ItemState>
  activeKeys: string[]
  masterMinLevel: number
  masterBindingBound: boolean
  collapsedKeys: string[]
}

const readInitialState = (
  location: Parameters<typeof readCcFromUrl>[0],
  dataset: EssenceCraftingEntry[]
): InitialEssenceCraftingState => {
  const emptyState: InitialEssenceCraftingState = {
    items: {},
    activeKeys: [],
    masterMinLevel: 1,
    masterBindingBound: true,
    collapsedKeys: []
  }
  const { cc } = readCcFromUrl(location)

  if (cc) {
    const decoded = tryDecodeEssencePermalink(cc, dataset)

    if (decoded.ok) {
      return {
        ...emptyState,
        ...decoded.data,
        items: sanitizeAugmentsOnItems(decoded.data, dataset),
        masterMinLevel: decoded.data.masterMinLevel ?? 1
      }
    }
  }

  const loadedText = readSessionStorageItem(STORAGE_KEY)
  if (!loadedText) {
    return emptyState
  }

  try {
    const parsed = JSON.parse(loadedText) as Omit<PermalinkStatePayload, 'collapsedKeys'> & {
      collapsedKeys?: string[]
      masterBindingBound?: boolean
    }

    return {
      items: sanitizeAugmentsOnItems(parsed, dataset),
      activeKeys: parsed.activeKeys,
      masterMinLevel: parsed.masterMinLevel ?? 1,
      masterBindingBound: parsed.masterBindingBound ?? true,
      collapsedKeys: parsed.collapsedKeys ?? []
    }
  } catch (err) {
    console.warn('EssenceCrafting: failed to load initial state.', err)
    return emptyState
  }
}

const EssenceCrafting = () => {
  // Router utilities (work for both BrowserRouter and HashRouter)
  const location = useLocation()
  const navigate = useNavigate()
  // Trove integration: get uploaded inventory from a localStorage-backed Redux slice
  const { troveData } = useAppSelector((state) => state.app, shallowEqual)
  const [dataset, setDataset] = useState<EssenceCraftingEntry[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)
  const [items, setItems] = useState<Record<string, ItemState>>({})
  const [activeKeys, setActiveKeys] = useState<string[]>([])
  const [masterMinLevel, setMasterMinLevel] = useState(1)
  const [masterBindingBound, setMasterBindingBound] = useState(true)
  const [collapsedKeys, setCollapsedKeys] = useState<string[]>([])
  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current) {
      return
    }

    let cancelled = false

    void loadEssenceCraftingData<EssenceCraftingEntry[]>()
      .then((loadedDataset) => {
        if (cancelled) return

        const initialState = readInitialState(location, loadedDataset)
        initializedRef.current = true
        setDataset(loadedDataset)
        setItems(initialState.items)
        setActiveKeys(initialState.activeKeys)
        setMasterMinLevel(initialState.masterMinLevel)
        setMasterBindingBound(initialState.masterBindingBound)
        setCollapsedKeys(initialState.collapsedKeys)
        setDataLoading(false)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        console.error('Error loading essence crafting data:', err)
        setDataError('Production data could not be loaded. Please try again later.')
        setDataLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [location])

  // Permalink modal visibility
  const [showPermalink, setShowPermalink] = useState(false)

  // Shopping List drawer visibility and plan (Bound/Unbound)
  const [showShoppingList, setShowShoppingList] = useState(false)
  const [shoppingListPlanBound, setShoppingListPlanBound] = useState(true)

  // ----- Augment color ML floor rules -----
  const AUGMENT_COLOR_FLOOR: Record<string, number> = useMemo(
    () => ({
      colorless: 1,
      red: 2,
      blue: 2,
      yellow: 3,
      green: 5,
      purple: 8,
      orange: 8
    }),
    []
  )

  const computeAugmentMinLevelFloor = useCallback(
    (item: ItemState | undefined): number => {
      if (!item) return 1
      let floor = 1

      for (const s of item.augmentSlots) {
        const f = AUGMENT_COLOR_FLOOR[s.slotType]

        floor = Math.max(floor, f)
      }

      return floor
    },
    [AUGMENT_COLOR_FLOOR]
  )

  // Build a lookup map for dataset entries by name for quick access when rendering scaled values
  const enhancementByName = useMemo(() => {
    const enhancementMap = new Map<string, EssenceCraftingEntry>()

    dataset.forEach((entry: EssenceCraftingEntry) => {
      enhancementMap.set(entry.name, entry)
    })

    return enhancementMap
  }, [dataset])

  // The dataset's minItemLevel is authoritative even when a modifier is absent for the current level.
  const isEnhancementAllowedAtML = useCallback(
    (name: string | null, effectiveML: number): boolean => {
      if (!name) {
        return true
      }

      const entry = enhancementByName.get(name)
      return entry != null && effectiveML >= entry.minItemLevel
    },
    [enhancementByName]
  )

  // Load from permalink (if present) or sessionStorage once
  const didLoadRef = useRef(false)

  useEffect(() => {
    if (dataLoading || dataError || didLoadRef.current) {
      return
    }

    const { cc, source } = readCcFromUrl(location)

    if (cc) {
      didLoadRef.current = true
      removeCcFromUrl(navigate, location, source).catch(console.error)
    }
  }, [dataError, dataLoading, location, navigate])

  // Persist on change
  useEffect(() => {
    if (dataLoading || dataError) {
      return
    }

    const payload = JSON.stringify({
      items,
      activeKeys,
      masterMinLevel,
      masterBindingBound,
      collapsedKeys
    })

    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY, payload)
    }
  }, [items, activeKeys, masterMinLevel, masterBindingBound, collapsedKeys, dataLoading, dataError])

  // Enforce item constraints (dataset minimum levels and Augment color ML floors)
  // We do this during render phase to avoid multiple re-renders and ESLint warnings.
  const { constrainedItems, needsFix } = useMemo(() => {
    let current = items
    let anyChanged = false

    // 1. Augment color ML floors: raise per-item ML override if needed
    const nextAfterAugments: Record<string, ItemState> = {}
    let augmentChanged = false
    for (const key of Object.keys(current)) {
      const currentItem = current[key]
      const floorForAugments = computeAugmentMinLevelFloor(currentItem)
      const effectiveML = currentItem.minLevelOverride ?? masterMinLevel

      if (effectiveML < floorForAugments) {
        augmentChanged = true
        nextAfterAugments[key] = { ...currentItem, minLevelOverride: floorForAugments }
      } else {
        nextAfterAugments[key] = currentItem
      }
    }
    if (augmentChanged) {
      anyChanged = true
      current = nextAfterAugments
    }

    // 2. Clear effects below their dataset minimum level
    const nextAfterMinLevel: Record<string, ItemState> = {}
    const minLevelChanged = iterateItemsOnLevelChange(
      current,
      masterMinLevel,
      nextAfterMinLevel,
      isEnhancementAllowedAtML,
      false
    )
    if (minLevelChanged) {
      anyChanged = true
      current = nextAfterMinLevel
    }

    return { constrainedItems: anyChanged ? current : items, needsFix: anyChanged }
  }, [items, masterMinLevel, computeAugmentMinLevelFloor, isEnhancementAllowedAtML])

  if (needsFix) {
    setItems(constrainedItems)
  }

  const toggleSlot = (slotKey: string) => {
    const wasActive = activeKeys.includes(slotKey)

    if (wasActive) {
      // Remove from active and clear collapsed state for this slot
      setActiveKeys((prev) => prev.filter((key) => key !== slotKey))
      setCollapsedKeys((prevCollapsedKeys) => prevCollapsedKeys.filter((key) => key !== slotKey))

      // Deselecting: remove this item's state entirely to clear all data
      setItems((prev) => {
        if (!(slotKey in prev)) return prev
        const nextItems: Record<string, ItemState> = Object.fromEntries(
          Object.entries(prev).filter(([key]) => key !== slotKey)
        )
        return nextItems
      })

      return
    }

    // Activating: add to active and initialize item state
    setActiveKeys((prev) => [...prev, slotKey])
    setItems((prev) => {
      const next: ItemState = {
        slotKey,
        prefix: null,
        suffix: null,
        extra: null,
        hasCannithMark: false,
        augmentSlots: [],
        minLevelOverride: null,
        bindingOverride: null
      }

      return { ...prev, [slotKey]: next }
    })
  }

  const isCollapsed = (slotKey: string) => collapsedKeys.includes(slotKey)

  const toggleCollapsed = (slotKey: string) => {
    setCollapsedKeys((prev) => (prev.includes(slotKey) ? prev.filter((key) => key !== slotKey) : [...prev, slotKey]))
  }

  const updateItem = (slotKey: string, updater: (item: ItemState) => ItemState) => {
    setItems((prev) => ({ ...prev, [slotKey]: updater(prev[slotKey]) }))
  }

  const addAugmentSlot = (slotKey: string, augmentType: string) => {
    if (!ALLOWED_AUGMENT_KEYS.has(augmentType)) {
      return
    }

    // Prevent adding colors that aren't valid for this item type
    const allowedForItem = new Set(allowedAugmentColorsForSlot(slotKey))

    if (!allowedForItem.has(augmentType)) {
      return
    }

    const id = crypto.randomUUID()

    updateItem(slotKey, (item: ItemState) => {
      // Disallow adding duplicate color slot types on the same item
      if (item.augmentSlots.some((augmentSlot) => augmentSlot.slotType === augmentType)) {
        return item
      }

      const nextAugmentSlots = [
        ...item.augmentSlots,
        {
          id,
          slotType: augmentType,
          selectedAugment: null,
          filters: [],
          filterMode: 'OR' as const
        }
      ]

      // Auto-raise item ML override if the new augment color imposes a higher floor
      const nextFloor = (() => {
        let minLevelFloor = 1

        for (const augmentSlot of nextAugmentSlots) {
          const requiredFloor: number = AUGMENT_COLOR_FLOOR[augmentSlot.slotType]

          minLevelFloor = Math.max(minLevelFloor, requiredFloor)
        }

        return minLevelFloor
      })()

      const effectiveBefore = item.minLevelOverride ?? masterMinLevel
      const nextMinLevelOverride = effectiveBefore < nextFloor ? nextFloor : (item.minLevelOverride ?? null)

      return {
        ...item,
        augmentSlots: nextAugmentSlots,
        // Only raise; never lower automatically
        minLevelOverride: nextMinLevelOverride
      }
    })
  }

  const removeAugmentSlot = (slotKey: string, id: string) => {
    updateItem(slotKey, (item) => ({
      ...item,
      augmentSlots: item.augmentSlots.filter((augmentSlot) => augmentSlot.id !== id)
    }))
  }

  const coreSelect = (slotKey: string, which: 'prefix' | 'suffix' | 'extra', value: string) => {
    updateItem(slotKey, (item) => ({
      ...item,
      [which]: value === 'None' ? null : value
    }))
  }

  const setHasMark = (slotKey: string, checked: boolean) => {
    updateItem(slotKey, (item) => ({
      ...item,
      hasCannithMark: checked,
      extra: checked ? item.extra : null
    }))
  }

  const handleSelectAugment = (slotKey: string, augmentSlotId: string, _slotType: string, aug: Ingredient) => {
    updateItem(slotKey, (item) => ({
      ...item,
      augmentSlots: item.augmentSlots.map((augmentSlot) =>
        augmentSlot.id === augmentSlotId ? { ...augmentSlot, selectedAugment: aug } : augmentSlot
      )
    }))
  }

  const handleResetAugment = (slotKey: string, augmentSlotId: string) => {
    updateItem(slotKey, (item: ItemState) => ({
      ...item,
      augmentSlots: item.augmentSlots.map((augmentSlot: ItemAugmentSlotState) =>
        augmentSlot.id === augmentSlotId ? { ...augmentSlot, selectedAugment: null } : augmentSlot
      )
    }))
  }

  const handleFilterModeChange = (slotKey: string, augmentId: string, mode: 'OR' | 'AND') => {
    updateItem(slotKey, (currentItem) => ({
      ...currentItem,
      augmentSlots: currentItem.augmentSlots.map((s) => (s.id === augmentId ? { ...s, filterMode: mode } : s))
    }))
  }

  const handleFiltersChange = (slotKey: string, augmentId: string, filters: string[]) => {
    updateItem(slotKey, (currentItem) => ({
      ...currentItem,
      augmentSlots: currentItem.augmentSlots.map((s) => (s.id === augmentId ? { ...s, filters } : s))
    }))
  }

  const slotLabel = (key: string) => ALL_SLOT_KEYS.find((slotDef) => slotDef.key === key)?.label ?? key

  // Memoize computed options per render based on current active slots
  const affixOptionsBySlot = useMemo(() => {
    const optionsBySlot: Record<string, { prefix: string[]; suffix: string[]; extra: string[] }> = {}

    ALL_SLOT_KEYS.forEach((slotDef) => {
      const slotKeyForOptions = slotDef.key

      optionsBySlot[slotKeyForOptions] = {
        prefix: getAffixOptions(slotKeyForOptions, 'prefix', dataset),
        suffix: getAffixOptions(slotKeyForOptions, 'suffix', dataset),
        extra: getAffixOptions(slotKeyForOptions, 'extra', dataset)
      }
    })

    return optionsBySlot
  }, [dataset])

  const renderAffixSelect = (
    slotKey: string,
    item: ItemState,
    affix: AffixKind,
    label: string,
    disabled: boolean
  ): ReactElement => {
    const effectiveML = item.minLevelOverride ?? masterMinLevel
    const baseOptions = affixOptionsBySlot[slotKey][affix]
    const filteredOptions = baseOptions.filter((opt) => isEnhancementAllowedAtML(opt, effectiveML))
    const currentValue = item[affix]
    const value = currentValue && filteredOptions.includes(currentValue) ? currentValue : 'None'

    return (
      <Form.Group controlId={`${slotKey}-${affix}`}>
        <Form.Label>{label}</Form.Label>
        <Form.Select
          size='sm'
          value={value}
          disabled={disabled}
          onChange={(event) => {
            coreSelect(slotKey, affix, event.target.value)
          }}
        >
          <option key='None' value='None'>
            None
          </option>
          {filteredOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
    )
  }

  // Helper to compute a human-readable display for a selected enhancement at a given effective ML
  const getEnhancementDisplay = (name: string | null, effectiveML: number): string | null => {
    if (!name) {
      return null
    }

    const entry = enhancementByName.get(name)

    if (!entry) {
      return null
    }

    const effects = entry.enchantments.flatMap((enchantment) => {
      const modifier = enchantment.modifiers?.find((candidate) => candidate.level === effectiveML)
      if (!modifier) {
        return []
      }

      const value = modifier.value
      let displayValue: string
      if (enchantment.modifierDice) {
        displayValue = `${String(value)}${enchantment.modifierDice}`
      } else if (value !== 0 && Math.abs(value) < 1) {
        displayValue = `${String(Number((value * 100).toFixed(10)))}%`
      } else {
        displayValue = value > 0 ? `+${String(value)}` : String(value)
      }

      return [{ name: enchantment.name, value: displayValue }]
    })

    if (effects.length === 0) {
      return name
    }

    if (entry.enchantments.length === 1) {
      return `${name} ${effects[0].value}`
    }

    return effects.map((effect) => `${effect.name} ${effect.value}`).join('; ')
  }

  // Build rows data (icon | name | qty) and shard level for a given enhancement name
  const buildMaterials = useCallback(
    (
      name: string | null,
      bound: boolean | null
    ): {
      shardLevel: number | null
      rows: { name: string; qty: number }[]
    } | null => {
      if (!name) {
        return null
      }

      const entry = enhancementByName.get(name)

      if (!entry) {
        return null
      }

      const materialsForBinding = bound ? entry.bound : entry.unbound

      const shardLevel = materialsForBinding.level
      const essenceQty = materialsForBinding.essence
      const collectibles = materialsForBinding.collectible

      const rows: { name: string; qty: number }[] = []

      if (essenceQty > 0) {
        rows.push({
          name: toSingularName('Magic Item Essences'),
          qty: essenceQty
        })
      }

      collectibles.forEach((collectible) => {
        if (collectible.quantity > 0 && collectible.name)
          rows.push({
            name: toSingularName(collectible.name),
            qty: collectible.quantity
          })
      })

      if (rows.length === 0) {
        return null
      }

      return { shardLevel, rows }
    },
    [enhancementByName]
  )

  const calculateBoundShardStats = (level: number) => {
    let shardLevel: number
    if (level === 1) {
      shardLevel = 1
    } else {
      shardLevel = 20 + (level - 2) * 10
    }
    const essenceQty = level * 10
    return { shardLevel, essenceQty }
  }

  const calculateUnboundShardStats = (level: number) => {
    let shardLevel: number
    if (level === 1) {
      shardLevel = 50
    } else {
      shardLevel = 70 + (level - 2) * 10
    }

    let essenceQty: number
    if (level === 1) {
      essenceQty = 100
    } else {
      essenceQty = 140 + (level - 2) * 20
    }

    let purifiedQty = 0
    if (level >= 31) {
      purifiedQty = 15
    } else if (level >= 26) {
      purifiedQty = 10
    } else if (level >= 21) {
      purifiedQty = 5
    }

    return { shardLevel, essenceQty, purifiedQty }
  }

  const buildMinLevelMaterials = useCallback(
    (
      level: number,
      bound: boolean
    ): {
      shardLevel: number | null
      rows: { name: string; qty: number }[]
    } | null => {
      const rows: { name: string; qty: number }[] = []
      const ESSENCE_NAME = toSingularName('Magic Item Essences')
      const PURIFIED_NAME = toSingularName('Purified Eberron Dragonshard Fragments')

      let shardLevel: number
      let essenceQty: number
      let purifiedQty = 0

      if (bound) {
        const stats = calculateBoundShardStats(level)
        shardLevel = stats.shardLevel
        essenceQty = stats.essenceQty
      } else {
        const stats = calculateUnboundShardStats(level)
        shardLevel = stats.shardLevel
        essenceQty = stats.essenceQty
        purifiedQty = stats.purifiedQty
      }

      if (essenceQty > 0) {
        rows.push({ name: ESSENCE_NAME, qty: essenceQty })
      }

      if (purifiedQty > 0) {
        rows.push({ name: PURIFIED_NAME, qty: purifiedQty })
      }

      if (rows.length === 0) {
        return null
      }

      return { shardLevel, rows }
    },
    []
  )

  // Extracted to avoid deeply nested functions in JSX
  const renderAugmentSlot = (slotKey: string, augmentSlot: ItemAugmentSlotState): ReactElement => {
    const groupedByDisplay = findAugmentsForSlot(augmentSlot.slotType)
    const flatForSlot = Object.values(groupedByDisplay).flat() as unknown as Ingredient[]
    const augmentOptions = { [augmentSlot.slotType]: flatForSlot }
    const filteredAugmentOptions = filterAugmentOptions(augmentOptions, augmentSlot.filters, augmentSlot.filterMode)
    const selectedAugments: Record<string, AugmentItem | null> = {
      [augmentSlot.slotType]: augmentSlot.selectedAugment
    }

    return (
      <Card key={augmentSlot.id} className='border-0 bg-light-subtle'>
        <Card.Body>
          <div className='d-flex flex-column flex-sm-row align-items-end gap-2 flex-wrap'>
            <div className='flex-grow-1 min-w-0 w-100 w-sm-auto align-self-start align-self-sm-auto'>
              <AugmentSlotFilterableDropdown
                availableAugmentSlots={[augmentSlot.slotType]}
                augmentOptions={augmentOptions}
                filteredAugmentOptions={filteredAugmentOptions}
                selectedAugments={selectedAugments}
                augmentFilters={augmentSlot.filters}
                augmentFilterMode={augmentSlot.filterMode}
                handleSelectAugment={(_slot, aug) => {
                  handleSelectAugment(slotKey, augmentSlot.id, augmentSlot.slotType, aug)
                }}
                handleResetAugment={() => {
                  handleResetAugment(slotKey, augmentSlot.id)
                }}
                handleFilterModeChange={(mode) => {
                  handleFilterModeChange(slotKey, augmentSlot.id, mode)
                }}
                handleFiltersChange={(filters) => {
                  handleFiltersChange(slotKey, augmentSlot.id, filters)
                }}
              />
            </div>

            <div className='d-flex'>
              <Button
                variant='outline-danger'
                size='sm'
                onClick={() => {
                  removeAugmentSlot(slotKey, augmentSlot.id)
                }}
              >
                Remove
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    )
  }

  // Renders a full-width stacked Accordion of requirement cards (default closed)
  const renderMaterialsAccordion = (slotKey: string, item: ItemState): ReactElement | null => {
    const effectiveML: number = items[slotKey].minLevelOverride ?? masterMinLevel

    const selections: {
      key: string
      label: string
      name: string | null
      isMinLevel?: boolean
    }[] = [
      {
        key: 'minLevel',
        label: 'Minimum Level',
        name: `Minimum Level ${String(effectiveML)}`,
        isMinLevel: true
      },
      {
        key: 'prefix',
        label: 'Prefix',
        name:
          item.prefix && affixOptionsBySlot[slotKey].prefix.includes(item.prefix) && item.prefix ? item.prefix : null
      },
      {
        key: 'suffix',
        label: 'Suffix',
        name:
          item.suffix && affixOptionsBySlot[slotKey].suffix.includes(item.suffix) && item.suffix ? item.suffix : null
      },
      {
        key: 'extra',
        label: 'Extra',
        name:
          item.hasCannithMark && item.extra && affixOptionsBySlot[slotKey].extra.includes(item.extra) && item.extra
            ? item.extra
            : null
      }
    ]

    // Build list of accordion items to render
    const itemsToRender = selections
      .map((selection) => {
        return {
          ...selection,
          // build both material sets; body will render both
          boundData: selection.isMinLevel
            ? buildMinLevelMaterials(effectiveML, true)
            : buildMaterials(selection.name, true),
          unboundData: selection.isMinLevel
            ? buildMinLevelMaterials(effectiveML, false)
            : buildMaterials(selection.name, false),
          display: selection.isMinLevel
            ? `Minimum Level ${String(effectiveML)} Shard`
            : getEnhancementDisplay(selection.name, effectiveML)
        }
      })
      // Apply the dataset's minimum item level.
      .filter(
        (entry) =>
          (entry.isMinLevel ?? entry.name) && (entry.isMinLevel ?? isEnhancementAllowedAtML(entry.name, effectiveML))
      ) as {
      key: string
      label: string
      name: string
      isMinLevel?: boolean
      boundData: {
        shardLevel: number
        rows: { name: string; qty: number }[]
      }
      unboundData: {
        shardLevel: number
        rows: { name: string; qty: number }[]
      }
      display: string | null
    }[]

    if (itemsToRender.length === 0) {
      return null
    }

    // Build unified material rows combining Bound and Unbound into a single table with two quantity columns
    const renderUnifiedMaterials = (
      boundData: {
        shardLevel: number
        rows: { name: string; qty: number }[]
      },
      unboundData: {
        shardLevel: number
        rows: { name: string; qty: number }[]
      }
    ): ReactElement => {
      // If neither exists, show a compact empty state
      if (boundData.rows.length === 0 && unboundData.rows.length === 0) {
        return <div className='p-2 text-muted'>No Bound or Unbound version exists for this shard.</div>
      }

      const boundMap = new Map<string, number>(boundData.rows.map((r) => [r.name, r.qty]))
      const unboundMap = new Map<string, number>(unboundData.rows.map((r) => [r.name, r.qty]))

      // Build unified rows and sort so any N/A entries (missing Bound or Unbound) are pushed to the bottom.
      // Within each group (complete vs. N/A), keep alphabetical order by ingredient name.
      const unifiedRows = Array.from(new Set<string>([...boundMap.keys(), ...unboundMap.keys()]))
        .map((name) => {
          const bQty = boundMap.get(name)
          const uQty = unboundMap.get(name)
          const hasNA = typeof bQty !== 'number' || typeof uQty !== 'number'

          return { name, bQty, uQty, hasNA }
        })
        .sort((left, right) => {
          if (left.hasNA !== right.hasNA) return left.hasNA ? 1 : -1
          return left.name.localeCompare(right.name, 'en', {
            sensitivity: 'base'
          })
        })

      return (
        <Table size='sm' responsive className='mb-0 align-middle'>
          <colgroup>
            <col />
            <col style={{ width: '1%', whiteSpace: 'nowrap' }} />
            <col style={{ width: '1%', whiteSpace: 'nowrap' }} />
          </colgroup>
          <thead>
            <tr>
              <th className='ps-2'>Ingredient</th>
              <th className='text-end'>Bound</th>
              <th className='text-end'>Unbound</th>
            </tr>
          </thead>
          <tbody>
            {unifiedRows.map(({ name, bQty, uQty }) => (
              <tr key={`${name}-${String(bQty ?? 'na')}-${String(uQty ?? 'na')}`}>
                <td className='text-truncate' title={name}>
                  {name}
                </td>
                <td className='text-end'>
                  {typeof bQty === 'number' ? (
                    getOwnedIngredients({ name }, bQty, troveData)
                  ) : (
                    <span className='text-muted'>N/A</span>
                  )}
                </td>
                <td className='text-end'>
                  {typeof uQty === 'number' ? (
                    getOwnedIngredients({ name }, uQty, troveData)
                  ) : (
                    <span className='text-muted'>N/A</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )
    }

    return (
      <Accordion defaultActiveKey={[]} alwaysOpen className='mt-2'>
        {itemsToRender.map((accordionEntry) => (
          <Accordion.Item eventKey={accordionEntry.key} key={accordionEntry.key}>
            <Accordion.Header>
              <div className='d-flex w-100 align-items-center justify-content-between gap-2'>
                <strong>{accordionEntry.display ?? ''}</strong>
                <small className='text-muted'>
                  {getShardLevelLabel(accordionEntry.boundData.shardLevel, accordionEntry.unboundData.shardLevel)}
                </small>
              </div>
            </Accordion.Header>

            <Accordion.Body className='p-0'>
              {renderUnifiedMaterials(accordionEntry.boundData, accordionEntry.unboundData)}
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
    )
  }

  const renderAugmentAdder = (slotKey: string, item: ItemState) => {
    const used = new Set(item.augmentSlots.map((augmentSlot) => augmentSlot.slotType))
    const allowedForThisItem = new Set(allowedAugmentColorsForSlot(slotKey))
    const remaining = AVAILABLE_AUGMENT_TYPES.filter(
      (colorOption) => allowedForThisItem.has(colorOption.key) && !used.has(colorOption.key)
    )

    const noneLeft = remaining.length === 0

    return (
      <Form.Select
        size='sm'
        disabled={noneLeft}
        onChange={(event) => {
          const value = event.target.value
          if (value) {
            addAugmentSlot(slotKey, value)
          }

          // reset select to placeholder
          event.currentTarget.selectedIndex = 0
        }}
      >
        <option value=''>{noneLeft ? 'No more augment colors available for this item' : 'Add Augment Slot...'}</option>
        {remaining.map((colorOption) => (
          <option key={colorOption.key} value={colorOption.key}>
            {colorOption.label}
          </option>
        ))}
      </Form.Select>
    )
  }

  // ----- Shopping List aggregation (reused by the ShoppingListDrawer component) -----
  const aggregateShoppingList = useMemo(() => {
    const effectiveMLBySlot = new Map<string, number>()
    Object.keys(items).forEach((k) => {
      effectiveMLBySlot.set(k, items[k].minLevelOverride ?? masterMinLevel)
    })

    const ESSENCE_NAME = toSingularName('Magic Item Essences')
    const PURIFIED_NAME = toSingularName('Purified Eberron Dragonshard Fragments')

    const processItemAffixes = (
      item: ItemState,
      effectiveML: number,
      bound: boolean,
      totalsMap: Map<string, number>
    ) => {
      const affixes = [item.prefix, item.suffix, item.hasCannithMark ? item.extra : null]
      for (const name of affixes) {
        if (!name || !isEnhancementAllowedAtML(name, effectiveML)) continue
        const data = buildMaterials(name, bound)
        if (!data) continue

        for (const r of data.rows) {
          totalsMap.set(r.name, (totalsMap.get(r.name) ?? 0) + r.qty)
        }
      }
    }

    const getTotalsForItems = (bound: boolean): { totalsMap: Map<string, number>; markCount: number } => {
      const totalsMap = new Map<string, number>()
      let markCount = 0

      const orderedActiveKeys: string[] = ALL_SLOT_KEYS.map((slot: { key: string; label: string }) => slot.key).filter(
        (key: string) => activeKeys.includes(key)
      )

      for (const slotKey of orderedActiveKeys) {
        if (!(slotKey in items)) {
          continue
        }

        const item: ItemState | undefined = items[slotKey]
        const effectiveML = effectiveMLBySlot.get(slotKey) ?? masterMinLevel

        if (item.hasCannithMark) {
          markCount += 1
        }

        // Add materials for Minimum Level shard
        const mlData = buildMinLevelMaterials(effectiveML, bound)

        if (mlData) {
          for (const r of mlData.rows) {
            totalsMap.set(r.name, (totalsMap.get(r.name) ?? 0) + r.qty)
          }
        }

        processItemAffixes(item, effectiveML, bound, totalsMap)
      }
      return { totalsMap, markCount }
    }

    const compute = (bound: boolean): ShoppingListTotals => {
      const { totalsMap, markCount } = getTotalsForItems(bound)

      if (markCount > 0) {
        const key = 'Mark of House Cannith'
        totalsMap.set(key, (totalsMap.get(key) ?? 0) + markCount)
      }

      const rows = Array.from(totalsMap.entries())
        .map(([name, qty]) => ({ name, qty }))
        .sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }))

      return {
        essence: totalsMap.get(ESSENCE_NAME) ?? 0,
        purified: totalsMap.get(PURIFIED_NAME) ?? 0,
        rows
      }
    }

    return {
      compute
    }
  }, [items, masterMinLevel, isEnhancementAllowedAtML, buildMaterials, activeKeys, buildMinLevelMaterials])

  // Extracted to reduce nesting/cognitive complexity
  const renderMinLevelOverride = (slotKey: string, item: ItemState): ReactElement => {
    const augmentFloor = computeAugmentMinLevelFloor(item)
    const effectiveML = item.minLevelOverride ?? masterMinLevel

    const selectIsInvalid = effectiveML < augmentFloor

    return (
      <>
        <Form.Select
          size='sm'
          className={selectIsInvalid ? 'is-invalid' : undefined}
          value={item.minLevelOverride ?? 0}
          onChange={(event) => {
            const valueNum = Number(event.target.value)

            updateItem(slotKey, (currentItem) => ({
              ...currentItem,
              minLevelOverride: valueNum === 0 ? null : valueNum
            }))
          }}
        >
          <option value={0}>{`Inherit (ML ${String(masterMinLevel)})`}</option>
          {ML_OPTIONS.map((lvl: number) => (
            <option key={lvl} value={lvl} disabled={lvl < augmentFloor}>
              {`ML ${String(lvl)}`}
            </option>
          ))}
        </Form.Select>

        {effectiveML < augmentFloor && (
          <div className='invalid-feedback d-block mt-1'>
            {`Augments on this item require minimum level ${String(augmentFloor)} or higher.`}
          </div>
        )}
      </>
    )
  }

  if (dataError) {
    return <Alert variant='danger'>{dataError}</Alert>
  }

  if (dataLoading) {
    return (
      <Container className='py-4 text-center'>
        <output className='spinner-border text-primary'>
          <span className='visually-hidden'>Loading Essence Crafting Data...</span>
        </output>
        <p className='mt-2' aria-hidden='true'>
          Loading Essence Crafting Data...
        </p>
      </Container>
    )
  }

  return (
    <Container className='px-0'>
      <Card>
        <Card.Header className='py-3 position-relative'>
          <div className='d-flex flex-column align-items-center justify-content-center gap-3'>
            <div className='text-center w-100'>
              <h1 className='mb-0 h4'>Essence Crafting</h1>
              <small>
                <a
                  href='https://github.com/veteran-software/yourddo/issues?q=state%3Aopen%20label%3A%22Essence%20Crafting%22'
                  target='_blank'
                  rel='noreferrer'
                  title='Essence Crafting Known Issues & Bug Reports'
                >
                  Known Issues / Bug Reports <FaArrowUpRightFromSquare size={10} />
                </a>
              </small>
              <small className='d-block opacity-75'>
                Crafting data assistance provided by{' '}
                <a href='https://dungeonhelper.com' target='_blank' rel='noreferrer'>
                  Dungeon Helper
                </a>
                .
              </small>
            </div>
            <div className='d-flex align-items-center justify-content-center gap-2 position-md-absolute end-0 me-3'>
              <Button
                variant='outline-light'
                size='sm'
                onClick={() => {
                  setShowShoppingList(true)
                }}
                title='View aggregated required materials'
              >
                Shopping List
              </Button>
              <Button
                variant='outline-light'
                size='sm'
                onClick={() => {
                  setShowPermalink(true)
                }}
                title='Create a permalink'
              >
                Permalink
              </Button>
            </div>
          </div>
        </Card.Header>

        <Card.Body>
          <Row>
            <Col lg={3} className='mb-3'>
              <Form.Group className='mb-3' controlId='master-min-level'>
                <Form.Label>Minimum Level</Form.Label>
                <Form.Select
                  size='sm'
                  value={masterMinLevel}
                  onChange={(event) => {
                    setMasterMinLevel(Number(event.target.value) || 1)
                  }}
                >
                  {ML_OPTIONS.map((lvl) => (
                    <option key={lvl} value={lvl}>{`ML ${String(lvl)}`}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <h6 className='mb-2'>Item Slots</h6>
              <ListGroup>
                {ALL_SLOT_KEYS.map((slotDef: { key: string; label: string }) => {
                  const active = activeKeys.includes(slotDef.key)

                  return (
                    <ListGroup.Item
                      key={slotDef.key}
                      action
                      active={active}
                      onClick={() => {
                        toggleSlot(slotDef.key)
                      }}
                      className='d-flex justify-content-between align-items-center p-1 px-2'
                    >
                      <span>{slotDef.label}</span>
                      {active && (
                        <Badge bg='light' text='dark'>
                          Added
                        </Badge>
                      )}
                    </ListGroup.Item>
                  )
                })}
              </ListGroup>
            </Col>

            <Col lg={9}>
              <Stack gap={3}>
                {activeKeys.length === 0 && (
                  <p className='text-center text-muted'>Select a slot on the left to begin crafting.</p>
                )}

                {/* Maintain the same order as the sidebar list */}
                {ALL_SLOT_KEYS.map((slotDef) => slotDef.key)
                  .filter((key) => activeKeys.includes(key))
                  .map((slotKey) => {
                    const item: ItemState = items[slotKey]

                    return (
                      <Card key={slotKey} className='shadow-sm'>
                        <Card.Header className='d-flex justify-content-between align-items-center'>
                          <div className='d-flex align-items-center gap-2'>
                            <Button
                              variant='link'
                              className='p-0 text-decoration-none'
                              aria-expanded={!isCollapsed(slotKey)}
                              aria-controls={`cc-body-${slotKey}`}
                              onClick={() => {
                                toggleCollapsed(slotKey)
                              }}
                              title={isCollapsed(slotKey) ? 'Expand' : 'Collapse'}
                            >
                              <span style={{ display: 'inline-block', width: 16 }}>
                                {isCollapsed(slotKey) ? '▸' : '▾'}
                              </span>
                            </Button>

                            <strong>{slotLabel(slotKey)}</strong>
                          </div>

                          <div className='d-flex align-items-center gap-2'>
                            <Badge bg='secondary' title='Effective Minimum Level'>
                              {`ML ${String(items[slotKey].minLevelOverride ?? masterMinLevel)}`}
                            </Badge>
                          </div>
                        </Card.Header>

                        <Collapse in={!isCollapsed(slotKey)}>
                          <div id={`cc-body-${slotKey}`}>
                            <Card.Body>
                              <Row className='g-3'>
                                <Col md={4}>{renderAffixSelect(slotKey, item, 'prefix', 'Prefix', false)}</Col>

                                <Col md={4}>{renderAffixSelect(slotKey, item, 'suffix', 'Suffix', false)}</Col>

                                <Col md={4}>
                                  {renderAffixSelect(slotKey, item, 'extra', 'Extra', !item.hasCannithMark)}
                                  <Form.Check
                                    type='switch'
                                    label='Mark of House Cannith'
                                    checked={item.hasCannithMark}
                                    onChange={(event) => {
                                      setHasMark(slotKey, event.target.checked)
                                    }}
                                  />
                                </Col>
                              </Row>

                              {/* Full-width stacked materials accordion (default closed) placed above ML override */}
                              {renderMaterialsAccordion(slotKey, item)}

                              <Row className='g-3 mt-2'>
                                <Col md={4}>
                                  <Form.Group controlId={`${slotKey}-ml`}>
                                    <Form.Label>Min Level (Override)</Form.Label>
                                    {renderMinLevelOverride(slotKey, item)}
                                  </Form.Group>
                                </Col>
                              </Row>

                              <hr />

                              <Stack direction='horizontal' gap={2} className='flex-wrap'>
                                {renderAugmentAdder(slotKey, item)}
                              </Stack>

                              {item.augmentSlots.length === 0 ? (
                                <p className='text-muted mb-0 mt-2 mt-sm-2'>
                                  No augment slots added. Use the selector above to add one.
                                </p>
                              ) : (
                                <div className='d-flex flex-column gap-2 gap-sm-3 mt-2 mt-sm-3'>
                                  {item.augmentSlots.map((augmentSlot) => renderAugmentSlot(slotKey, augmentSlot))}
                                </div>
                              )}
                            </Card.Body>
                          </div>
                        </Collapse>
                      </Card>
                    )
                  })}
              </Stack>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Permalink Modal for sharing current setup */}
      <PermalinkModal
        show={showPermalink}
        onHide={() => {
          setShowPermalink(false)
        }}
        buildUrl={() =>
          buildPermalinkUrl(
            encodeEssencePermalink(
              {
                items,
                activeKeys,
                collapsedKeys,
                masterMinLevel
              },
              dataset
            ),
            location
          )
        }
      />

      {/* Shopping List Drawer (reusable component) */}
      <ShoppingListDrawer
        show={showShoppingList}
        onHide={() => {
          setShowShoppingList(false)
        }}
        planBound={shoppingListPlanBound}
        onPlanChange={setShoppingListPlanBound}
        totals={aggregateShoppingList.compute(shoppingListPlanBound)}
        troveData={troveData}
      />
    </Container>
  )
}

export default EssenceCrafting
