import type { ReactElement } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Accordion,
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
import { useAppSelector } from '../../redux/hooks.ts'
import type { AugmentItem } from '../../types/augmentItem.ts'
import type { Ingredient } from '../../types/ingredients.ts'
import { findAugmentsForSlot } from '../../utils/augmentUtils.ts'
import { getOwnedIngredients, toSingularName } from '../../utils/jsxUtils.tsx'
import {
  buildPermalinkUrl,
  encodeCannithPermalink,
  readCcFromUrl,
  removeCcFromUrl,
  tryDecodeCannithPermalink
} from './permalink.ts'
import {
  type AffixKind,
  ALL_SLOT_KEYS,
  ALLOWED_AUGMENT_KEYS,
  AVAILABLE_AUGMENT_TYPES,
  type CannithPhase1Entry,
  DATASET,
  type ItemAugmentSlotState,
  type ItemState,
  type Phase1EnchantmentMeta
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

const CannithCrafting = () => {
  // Router utilities (work for both BrowserRouter and HashRouter)
  const location = useLocation()
  const navigate = useNavigate()
  // Trove integration: get uploaded inventory from a localStorage-backed Redux slice
  const { troveData } = useAppSelector((state) => state.app, shallowEqual)
  const [items, setItems] = useState<Record<string, ItemState>>({})
  const [activeKeys, setActiveKeys] = useState<string[]>([])
  const [masterMinLevel, setMasterMinLevel] = useState<number>(1)
  // Binding selection removed from UI; keep state for backward-compatible permalink/session payloads (unused in logic)
  const [masterBindingBound, setMasterBindingBound] = useState<boolean>(true)
  // track which item cards are collapsed (default open -> not present in this set)
  const [collapsedKeys, setCollapsedKeys] = useState<string[]>([])
  // Permalink modal visibility
  const [showPermalink, setShowPermalink] = useState<boolean>(false)
  // Shopping List drawer visibility and plan (Bound/Unbound)
  const [showShoppingList, setShowShoppingList] = useState<boolean>(false)
  const [shoppingListPlanBound, setShoppingListPlanBound] = useState<boolean>(true)

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

  // ----- Permalink encoding/decoding moved to ./permalink.ts -----

  // Build a lookup map for dataset entries by name for quick access when rendering scaled values
  const enhancementByName = useMemo(() => {
    const enhancementMap = new Map<string, CannithPhase1Entry>()

    DATASET.forEach((entry: CannithPhase1Entry) => {
      enhancementMap.set(entry.name, entry)
    })

    return enhancementMap
  }, [])

  // Helper: determine if an enhancement is "Insightful" for ML gating
  const isInsightfulEnhancement = useCallback(
    (name: string | null): boolean => {
      if (!name) {
        return false
      }

      const entry = enhancementByName.get(name)
      const nameLower = name.toLowerCase()
      const nameSuggestsInsight = nameLower.startsWith('insightful ')

      // Parrying is explicitly included in this restriction
      const isParrying = nameLower.includes('parrying')
      const enchantmentSuggestsInsight = Array.isArray(entry?.enchantments)
        ? entry.enchantments.some(
            (enchantMeta: Phase1EnchantmentMeta) => (enchantMeta.bonus ?? '').toLowerCase() === 'insight'
          )
        : false

      return nameSuggestsInsight || enchantmentSuggestsInsight || isParrying
    },
    [enhancementByName]
  )

  // Rule: Insightful effects (including Parrying) cannot be applied if effective ML < 10
  const isEnhancementAllowedAtML = useCallback(
    (name: string | null, effectiveML: number): boolean => {
      if (!name) {
        return true
      }

      return !(isInsightfulEnhancement(name) && (effectiveML || 1) < 10)
    },
    [isInsightfulEnhancement]
  )

  // Load from permalink (if present) or sessionStorage once
  const didLoadRef = useRef(false)

  useEffect(() => {
    try {
      if (didLoadRef.current) return
      const { cc, source } = readCcFromUrl(location)
      if (cc) {
        // Try compact v2 first
        const v2 = tryDecodeCannithPermalink(cc)

        if (v2.ok) {
          const data = v2.data
          setItems(sanitizeAugmentsOnItems(data))
          setActiveKeys(data.activeKeys)
          setMasterMinLevel(typeof data.masterMinLevel === 'number' ? data.masterMinLevel : 1)
          setCollapsedKeys(Array.isArray(data.collapsedKeys) ? data.collapsedKeys : [])
          Promise.resolve(removeCcFromUrl(navigate, location, source)).catch(console.error)
          didLoadRef.current = true

          return
        }
      }

      const loadedText = sessionStorage.getItem(STORAGE_KEY)
      if (loadedText) {
        const parsed = JSON.parse(loadedText) as {
          items: Record<string, ItemState>
          activeKeys: string[]
          masterMinLevel?: number
          masterBindingBound?: boolean
          collapsedKeys?: string[]
        }
        setItems(sanitizeAugmentsOnItems(parsed))
        setActiveKeys(parsed.activeKeys)
        setMasterMinLevel(typeof parsed.masterMinLevel === 'number' ? parsed.masterMinLevel : 1)
        setMasterBindingBound(typeof parsed.masterBindingBound === 'boolean' ? parsed.masterBindingBound : true)
        setCollapsedKeys(Array.isArray(parsed.collapsedKeys) ? parsed.collapsedKeys : [])
        didLoadRef.current = true
      }
    } catch (err) {
      console.warn('CannithCrafting: failed to load session state – resetting to defaults.', err)
    }
  }, [location, navigate])

  // Persist on change
  useEffect(() => {
    const payload = JSON.stringify({
      items,
      activeKeys,
      masterMinLevel,
      masterBindingBound,
      collapsedKeys
    })

    sessionStorage.setItem(STORAGE_KEY, payload)
  }, [items, activeKeys, masterMinLevel, masterBindingBound, collapsedKeys])

  // Enforce the rule dynamically: if effective ML for an item drops below 10,
  // clear any selected Insightful effects (prefix/suffix/extra cannot be applied)
  useEffect(() => {
    const nextItems: Record<string, ItemState> = {}
    let changed = false

    changed = iterateItemsOnLevelChange(items, masterMinLevel, nextItems, isEnhancementAllowedAtML, changed)
    if (changed) {
      setItems(nextItems)
    }
  }, [masterMinLevel, items, isEnhancementAllowedAtML])

  // Auto-raise per-item ML override to satisfy augment color ML floors.
  // This runs after load and whenever items/master ML change. It will only ever raise
  // an item's ML override; it will not automatically lower if the floor decreases.
  useEffect(() => {
    const nextItems: Record<string, ItemState> = {}

    let changed = false

    for (const key of Object.keys(items)) {
      const currentItem = items[key]
      const floorForAugments = computeAugmentMinLevelFloor(currentItem)
      const effectiveML = currentItem.minLevelOverride ?? masterMinLevel

      if (effectiveML < floorForAugments) {
        changed = true
        nextItems[key] = { ...currentItem, minLevelOverride: floorForAugments }
      } else {
        nextItems[key] = currentItem
      }
    }
    if (changed) {
      setItems(nextItems)
    }
  }, [computeAugmentMinLevelFloor, items, masterMinLevel])

  const toggleSlot = (slotKey: string) => {
    // Determine the current state synchronously for this toggle action
    const wasActive = activeKeys.includes(slotKey)

    setActiveKeys((prev) => {
      if (prev.includes(slotKey)) {
        // also clear any collapsed state so it defaults open next time
        setCollapsedKeys((prevCollapsedKeys) => prevCollapsedKeys.filter((key) => key !== slotKey))
        return prev.filter((key) => key !== slotKey)
      }
      return [...prev, slotKey]
    })

    setItems((prev) => {
      if (wasActive) {
        // Deselecting: remove this item's state entirely to clear all data
        if (!(slotKey in prev)) {
          return prev
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars,sonarjs/no-unused-vars
        const { [slotKey]: _removed, ...rest } = prev

        return rest
      }

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
        { id, slotType: augmentType, selectedAugment: null, filters: [], filterMode: 'OR' as const }
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
    updateItem(slotKey, (item) => ({ ...item, [which]: value === 'None' ? null : value }))
  }

  const setHasMark = (slotKey: string, checked: boolean) => {
    updateItem(slotKey, (item) => ({ ...item, hasCannithMark: checked, extra: checked ? item.extra : null }))
  }

  const handleSelectAugment = (slotKey: string, augmentSlotId: string, _slotType: string, aug: Ingredient) => {
    updateItem(slotKey, (item) => ({
      ...item,
      augmentSlots: item.augmentSlots.map((augmentSlot) =>
        augmentSlot.id === augmentSlotId ? { ...augmentSlot, selectedAugment: aug as AugmentItem } : augmentSlot
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

  const slotLabel = (key: string) => ALL_SLOT_KEYS.find((slotDef) => slotDef.key === key)?.label ?? key

  // Memoize computed options per render based on current active slots
  const affixOptionsBySlot = useMemo(() => {
    const optionsBySlot: Record<string, { prefix: string[]; suffix: string[]; extra: string[] }> = {}

    ALL_SLOT_KEYS.forEach((slotDef) => {
      const slotKeyForOptions = slotDef.key

      optionsBySlot[slotKeyForOptions] = {
        prefix: getAffixOptions(slotKeyForOptions, 'prefix'),
        suffix: getAffixOptions(slotKeyForOptions, 'suffix'),
        extra: getAffixOptions(slotKeyForOptions, 'extra')
      }
    })

    return optionsBySlot
  }, [])

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

    const stats = Array.isArray(entry.stat) ? entry.stat : []

    if (stats.length === 0) {
      return null
    }

    // ML is 1-based; array index is 0-based; clamp to available range
    const idx = Math.max(0, Math.min(stats.length - 1, (effectiveML || 1) - 1))
    const value = stats[idx]

    const isStatic = (entry.group ?? '').toLowerCase() === 'static' || stats.length === 1

    // Format logic:
    // - numeric values: show as +N
    // - string values (e.g., "1d10" or description): show as raw text following the name
    if (isStatic) {
      if (typeof value === 'number') return `${name} +${String(value)}`
      return `${name}: ${value}`
    }

    if (typeof value === 'number') return `${name} +${String(value)}`

    return `${name} ${value}`
  }

  // Returns the numeric ML increase for a given enhancement selection
  const getEnhancementMinIncrease = (name: string | null): number => {
    if (!name) {
      return 0
    }

    const entry = enhancementByName.get(name)

    if (!entry) {
      return 0
    }

    const inc = entry.minLevelIncrease

    if (typeof inc === 'number') {
      return inc
    }

    if (inc && typeof inc === 'object') {
      // If dataset uses an object form, try to infer an increase relative to base ML.
      // Prefer explicit minimumLevel over noMinimumLevel as a conservative requirement.
      const min = Number(inc.minimumLevel ?? inc.noMinimumLevel)
      return Number.isFinite(min) ? Math.max(0, min - 1) : 0
    }

    return 0
  }

  // Helper to compute only the value portion (e.g., "+3" or "1d10" or description) for headers
  const getEnhancementValueOnly = (name: string | null, effectiveML: number): string | null => {
    if (!name) {
      return null
    }

    const entry = enhancementByName.get(name)

    if (!entry) {
      return null
    }

    const stats = Array.isArray(entry.stat) ? entry.stat : []

    if (stats.length === 0) {
      return null
    }

    const idx = Math.max(0, Math.min(stats.length - 1, (effectiveML || 1) - 1))
    const value = stats[idx]
    const isStatic = (entry.group ?? '').toLowerCase() === 'static' || stats.length === 1

    if (isStatic) {
      if (typeof value === 'number') {
        return `+${String(value)}`
      }

      return value
    }

    if (typeof value === 'number') {
      return `+${String(value)}`
    }

    return value
  }

  // ----- Combined shard helpers -----
  // Certain shard names represent a combination of two effects. When one of these shards is selected,
  // we should display both effects with their ML-scaled values in the accordion header.
  const COMBINED_SHARDS: Record<string, [string, string]> = {
    "Champion's": ['Speed (Striding)', 'Combat Mastery'],
    "Initiate's": ['Spell Penetration', 'Wizardry'],
    Warded: ['Curse Resistance', 'Protection from Evil']
    // Note: "Sabotaging", "Silver Flame's", and "Watchful" can be added here once their effect pairs are defined
  }

  const isCombinedShard = (name: string | null): name is keyof typeof COMBINED_SHARDS => {
    if (!name) {
      return false
    }

    return Object.prototype.hasOwnProperty.call(COMBINED_SHARDS, name)
  }

  // Detect if a selected dataset entry represents a combined shard based on its own metadata
  const isCombinedEntry = (name: string | null): boolean => {
    if (!name) {
      return false
    }

    const entry = enhancementByName.get(name)

    if (!entry || !Array.isArray(entry.enchantments)) {
      return false
    }

    // A combined shard will list multiple component effects under `enchantments`
    return entry.enchantments.length >= 2
  }

  // Build a combined header string using the component effect names found in the selected entry's `enchantments` array.
  // For each component name, we pull the ML-scaled stat from the single-effect dataset entry via getEnhancementDisplay.
  const getCombinedDisplayFromEntry = (name: string, effectiveML: number): string => {
    const entry = enhancementByName.get(name)

    if (!entry || !Array.isArray(entry.enchantments) || entry.enchantments.length === 0) {
      return name
    }

    // Take the first two components if more are present
    const componentNames: string[] = entry.enchantments
      .map((meta: Phase1EnchantmentMeta) => meta.name)
      .filter((n): n is string => typeof n === 'string' && !!n)
      .slice(0, 2)

    const parts: string[] = []

    for (const compName of componentNames) {
      const enhancementDisplay: string | null = getEnhancementDisplay(compName, effectiveML)
      if (enhancementDisplay) {
        parts.push(enhancementDisplay)
      }
    }

    return parts.length ? parts.join('; ') : name
  }

  const getCombinedDisplay = (name: string, effectiveML: number): string => {
    const pair = COMBINED_SHARDS[name]

    const [a, b] = pair
    const aDisplay = getEnhancementDisplay(a, effectiveML)
    const bDisplay = getEnhancementDisplay(b, effectiveML)
    const parts: string[] = []

    if (aDisplay) {
      parts.push(aDisplay)
    }

    if (bDisplay) {
      parts.push(bDisplay)
    }

    // Fallback to shard name if neither part resolved
    return parts.length ? parts.join('; ') : name
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

      if (!materialsForBinding) {
        return null
      }

      const shardLevel: number | null = typeof materialsForBinding.level === 'number' ? materialsForBinding.level : null
      const essenceQty: number | null =
        typeof materialsForBinding.essence === 'number' ? materialsForBinding.essence : null
      const purifiedQty: number | null = materialsForBinding.purified ?? null
      const collectibles: { name: string; qty: number }[] = Array.isArray(materialsForBinding.collectible)
        ? materialsForBinding.collectible
        : []

      const rows: { name: string; qty: number }[] = []

      if (essenceQty != null && essenceQty > 0) {
        rows.push({ name: toSingularName('Cannith Essences'), qty: essenceQty })
      }

      if (purifiedQty != null && purifiedQty > 0) {
        rows.push({ name: toSingularName('Purified Eberron Dragonshard Fragments'), qty: purifiedQty })
      }

      collectibles.forEach((collectible) => {
        if (collectible.qty > 0 && collectible.name)
          rows.push({ name: toSingularName(collectible.name), qty: collectible.qty })
      })

      if (rows.length === 0) {
        return null
      }

      return { shardLevel, rows }
    },
    [enhancementByName]
  )

  // Renders a full-width stacked Accordion of requirement cards (default closed)
  function renderMaterialsAccordion(slotKey: string, item: ItemState): ReactElement | null {
    const effectiveML: number = items[slotKey].minLevelOverride ?? masterMinLevel

    const selections: { key: string; label: string; name: string | null }[] = [
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
        // Combined detection prefers dataset metadata, falls back to short-name mapping
        const combinedByEntry = isCombinedEntry(selection.name)
        const combinedByShortName = isCombinedShard(selection.name)
        const combined = combinedByEntry || combinedByShortName

        let display: string | null
        if (combinedByEntry) {
          display = getCombinedDisplayFromEntry(selection.name ?? '', effectiveML)
        } else if (combinedByShortName) {
          display = getCombinedDisplay(selection.name ?? '', effectiveML)
        } else {
          display = getEnhancementDisplay(selection.name, effectiveML)
        }

        return {
          ...selection,
          isCombined: combined,
          // build both material sets; body will render both
          boundData: buildMaterials(selection.name, true),
          unboundData: buildMaterials(selection.name, false),
          valueOnly: getEnhancementValueOnly(selection.name, effectiveML),
          display: display
        }
      })
      // Apply ML gating: hide Insightful effects when effective ML < 10
      .filter((entry) => entry.name && isEnhancementAllowedAtML(entry.name, effectiveML)) as {
      key: string
      label: string
      name: string
      isCombined: boolean
      boundData: { shardLevel: number | null; rows: { name: string; qty: number }[] } | null
      unboundData: { shardLevel: number | null; rows: { name: string; qty: number }[] } | null
      valueOnly: string | null
      display: string | null
    }[]

    if (itemsToRender.length === 0) {
      return null
    }

    // Build unified material rows combining Bound and Unbound into a single table with two quantity columns
    const renderUnifiedMaterials = (
      boundData: { shardLevel: number | null; rows: { name: string; qty: number }[] } | null,
      unboundData: { shardLevel: number | null; rows: { name: string; qty: number }[] } | null
    ): ReactElement => {
      // If neither exists, show a compact empty state
      if (!boundData && !unboundData) {
        return <div className='p-2 text-muted'>No Bound or Unbound version exists for this shard.</div>
      }

      const boundMap = new Map<string, number>((boundData?.rows ?? []).map((r) => [r.name, r.qty]))
      const unboundMap = new Map<string, number>((unboundData?.rows ?? []).map((r) => [r.name, r.qty]))

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
          return left.name.localeCompare(right.name, 'en', { sensitivity: 'base' })
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
                    getOwnedIngredients({ name } as unknown as Ingredient, bQty, troveData)
                  ) : (
                    <span className='text-muted'>N/A</span>
                  )}
                </td>
                <td className='text-end'>
                  {typeof uQty === 'number' ? (
                    getOwnedIngredients({ name } as unknown as Ingredient, uQty, troveData)
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
                  {(() => {
                    const boundLv = accordionEntry.boundData?.shardLevel
                    const unboundLv = accordionEntry.unboundData?.shardLevel
                    if (boundLv != null && unboundLv != null)
                      return `Shard Level (Bound ${String(boundLv)} / Unbound ${String(unboundLv)})`
                    if (boundLv != null) return `Shard Level (Bound ${String(boundLv)})`
                    if (unboundLv != null) return `Shard Level (Unbound ${String(unboundLv)})`
                    return ''
                  })()}
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

  // ----- Shopping List aggregation (reused by the ShoppingListDrawer component) -----
  const aggregateShoppingList = useMemo(() => {
    const effectiveMLBySlot = new Map<string, number>()
    Object.keys(items).forEach((k) => {
      effectiveMLBySlot.set(k, items[k].minLevelOverride ?? masterMinLevel)
    })

    const compute = (bound: boolean): ShoppingListTotals => {
      const totalsMap = new Map<string, number>()
      let essenceTotal = 0
      let purifiedTotal = 0
      let markCount = 0

      // Maintain canonical order and include only active keys
      const orderedActive = ALL_SLOT_KEYS.map((s) => s.key).filter((k) => activeKeys.includes(k))
      for (const slotKey of orderedActive) {
        const item = items[slotKey]
        if (!item) {
          continue
        }

        const effectiveML = effectiveMLBySlot.get(slotKey) ?? masterMinLevel

        // Count Mark of House Cannith selections (each selected item requires one Mark)
        if (item.hasCannithMark) {
          markCount += 1
        }

        // Helper to include a selection if allowed and has materials for chosen binding
        const include = (name: string | null) => {
          if (!name) {
            return
          }

          if (!isEnhancementAllowedAtML(name, effectiveML)) {
            return
          }

          const data = buildMaterials(name, bound)
          if (!data) {
            return
          }

          // Sum essence/purified specially
          essenceTotal += data.rows.find((r) => r.name === toSingularName('Cannith Essences'))?.qty ?? 0
          purifiedTotal +=
            data.rows.find((r) => r.name === toSingularName('Purified Eberron Dragonshard Fragments'))?.qty ?? 0

          for (const r of data.rows) {
            const key = r.name
            const prev = totalsMap.get(key) ?? 0

            totalsMap.set(key, prev + r.qty)
          }
        }

        include(item.prefix)
        include(item.suffix)
        include(item.hasCannithMark ? item.extra : null)
      }

      // Include Mark of House Cannith itself as a required material when selected
      if (markCount > 0) {
        const key = 'Mark of House Cannith'
        const prev = totalsMap.get(key) ?? 0
        totalsMap.set(key, prev + markCount)
      }

      // Build rows, sort alphabetically A→Z
      const rows = Array.from(totalsMap.entries())
        .map(([name, qty]) => ({ name, qty }))
        .sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }))

      return { essence: essenceTotal, purified: purifiedTotal, rows }
    }

    return {
      compute
    }
  }, [items, masterMinLevel, activeKeys, isEnhancementAllowedAtML, buildMaterials])

  // Extracted to reduce nesting/cognitive complexity
  const renderMinLevelOverride = (slotKey: string, item: ItemState): ReactElement => {
    const augmentFloor = computeAugmentMinLevelFloor(item)
    const effectiveML = item.minLevelOverride ?? masterMinLevel

    // Collect ML increase messages for selected affixes
    const incPairs: { name: string; inc: number }[] = []
    const pushIncreaseIfAny = (effectName: string | null) => {
      if (!effectName) {
        return
      }

      const inc: number = getEnhancementMinIncrease(effectName)
      if (inc > 0) {
        incPairs.push({ name: effectName, inc })
      }
    }

    pushIncreaseIfAny(item.prefix)
    pushIncreaseIfAny(item.suffix)
    pushIncreaseIfAny(item.hasCannithMark ? item.extra : null)

    const selectIsInvalid = incPairs.length > 0 || effectiveML < augmentFloor

    return (
      <>
        <Form.Select
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

        {incPairs.length > 0 && (
          <div className='invalid-feedback d-block mt-1'>
            {incPairs.map((pair: { name: string; inc: number }) => (
              <div
                key={pair.name}
              >{`Adding the ${pair.name} effect will raise the minimum level of this item by ${String(pair.inc)}.`}</div>
            ))}
          </div>
        )}

        {effectiveML < augmentFloor && (
          <div className='invalid-feedback d-block mt-1'>
            {`Augments on this item require minimum level ${String(augmentFloor)} or higher.`}
          </div>
        )}
      </>
    )
  }

  return (
    <Container className='px-0'>
      <Card>
        <Card.Header className='position-relative py-3'>
          <div className='d-flex align-items-center'>
            <div className='position-absolute top-50 start-50 translate-middle text-center px-3 z-0'>
              <h4 className='mb-0'>Cannith Crafting</h4>
              <small>
                <a
                  href='https://github.com/veteran-software/yourddo/issues?q=state%3Aopen%20label%3A%22Cannith%20Crafting%22'
                  target='_blank'
                  rel='noreferrer'
                  title='Cannith Crafting Known Issues & Bug Reports'
                >
                  Known Issues / Bug Reports <FaArrowUpRightFromSquare size={10} />
                </a>
              </small>
            </div>
            <div className='ms-auto ms-2 d-flex align-items-center gap-2 position-relative z-1'>
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
                      className='d-flex justify-content-between align-items-center'
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
                {activeKeys.length === 0 && <p className='text-muted'>Select a slot on the left to begin crafting.</p>}

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
                                {(() => {
                                  const used = new Set(item.augmentSlots.map((augmentSlot) => augmentSlot.slotType))
                                  const allowedForThisItem = new Set(allowedAugmentColorsForSlot(slotKey))
                                  const remaining = AVAILABLE_AUGMENT_TYPES.filter(
                                    (colorOption) =>
                                      allowedForThisItem.has(colorOption.key) && !used.has(colorOption.key)
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
                                      <option value=''>
                                        {noneLeft
                                          ? 'No more augment colors available for this item'
                                          : 'Add Augment Slot...'}
                                      </option>
                                      {remaining.map((colorOption) => (
                                        <option key={colorOption.key} value={colorOption.key}>
                                          {colorOption.label}
                                        </option>
                                      ))}
                                    </Form.Select>
                                  )
                                })()}
                              </Stack>

                              {item.augmentSlots.length === 0 ? (
                                <p className='text-muted mb-0 mt-2 mt-sm-2'>
                                  No augment slots added. Use the selector above to add one.
                                </p>
                              ) : (
                                // Tighten vertical spacing on mobile while keeping comfortable spacing on desktop
                                <div className='d-flex flex-column gap-2 gap-sm-3 mt-2 mt-sm-3'>
                                  {item.augmentSlots.map((augmentSlot) => (
                                    <Card key={augmentSlot.id} className='border-0 bg-light-subtle'>
                                      <Card.Body>
                                        <div className='d-flex flex-column flex-sm-row align-items-end gap-2 flex-wrap'>
                                          <div className='flex-grow-1 min-w-0 w-100 w-sm-auto align-self-start align-self-sm-auto'>
                                            {(() => {
                                              const groupedByDisplay = findAugmentsForSlot(augmentSlot.slotType)
                                              const flatForSlot = Object.values(
                                                groupedByDisplay
                                              ).flat() as unknown as Ingredient[]
                                              const augmentOptions = { [augmentSlot.slotType]: flatForSlot } as Record<
                                                string,
                                                Ingredient[]
                                              >
                                              const filteredAugmentOptions = filterAugmentOptions(
                                                augmentOptions,
                                                augmentSlot.filters,
                                                augmentSlot.filterMode
                                              )
                                              const selectedAugments: Record<string, AugmentItem | null> = {
                                                [augmentSlot.slotType]: augmentSlot.selectedAugment
                                              }
                                              return (
                                                <AugmentSlotFilterableDropdown
                                                  availableAugmentSlots={[augmentSlot.slotType]}
                                                  augmentOptions={augmentOptions}
                                                  filteredAugmentOptions={filteredAugmentOptions}
                                                  selectedAugments={selectedAugments}
                                                  augmentFilters={augmentSlot.filters}
                                                  augmentFilterMode={augmentSlot.filterMode}
                                                  handleSelectAugment={(_slot: string, aug: Ingredient) => {
                                                    handleSelectAugment(
                                                      slotKey,
                                                      augmentSlot.id,
                                                      augmentSlot.slotType,
                                                      aug
                                                    )
                                                  }}
                                                  handleResetAugment={() => {
                                                    handleResetAugment(slotKey, augmentSlot.id)
                                                  }}
                                                  handleFilterModeChange={(mode: 'OR' | 'AND') => {
                                                    updateItem(slotKey, (currentItem) => ({
                                                      ...currentItem,
                                                      augmentSlots: currentItem.augmentSlots.map((s) =>
                                                        s.id === augmentSlot.id ? { ...s, filterMode: mode } : s
                                                      )
                                                    }))
                                                  }}
                                                  handleFiltersChange={(filters: string[]) => {
                                                    updateItem(slotKey, (currentItem) => ({
                                                      ...currentItem,
                                                      augmentSlots: currentItem.augmentSlots.map((s) =>
                                                        s.id === augmentSlot.id ? { ...s, filters } : s
                                                      )
                                                    }))
                                                  }}
                                                />
                                              )
                                            })()}
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
                                  ))}
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
          buildPermalinkUrl(encodeCannithPermalink({ items, activeKeys, collapsedKeys, masterMinLevel }), location)
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

export default CannithCrafting
