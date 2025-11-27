import type { ReactElement } from 'react'
import { useEffect, useMemo, useState } from 'react'
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
import { shallowEqual } from 'react-redux'
import AugmentSlotFilterableDropdown
  from '../../components/common/AugmentSlotFilterableDropdown.tsx'
import FallbackImage from '../../components/common/FallbackImage.tsx'
import {
  filterIngredientsMap
} from '../../components/filters/helpers/filterUtils.ts'
import cannithPhase1
  from '../../data/cannithCrafting/cannithEnhancements.phase1.json'
import { useAppSelector } from '../../redux/hooks.ts'
import type { AugmentItem } from '../../types/augmentItem.ts'
import type { Ingredient } from '../../types/ingredients.ts'
import { findAugmentsForSlot } from '../../utils/augmentUtils.ts'
import { getOwnedIngredients, toSingularName } from '../../utils/jsxUtils.tsx'

type CoreChoice = string | null

// ----- Strict types for Cannith Phase 1 dataset -----
interface Phase1CollectibleRow {
  name: string
  qty: number
}

interface Phase1Materials {
  level?: number | null
  essence?: number | null
  purified?: number | null
  collectible?: Phase1CollectibleRow[] | null
}

interface Phase1EnchantmentMeta {
  name?: string
  statModified?: string
  bonusType?: string
}

type Phase1MinLevelIncrease =
  | number
  | {
      noMinimumLevel?: number
      minimumLevel?: number
    }
  | null

type TAffix = string[] | string | null

interface CannithPhase1Entry {
  name: string
  enchantments?: Phase1EnchantmentMeta[]
  bound?: Phase1Materials | null
  unbound?: Phase1Materials | null
  prefixTitle?: string | null
  suffixTitle?: string | null
  // Although normalized to arrays, keep a tolerant type for safety
  prefix?: TAffix
  suffix?: TAffix
  extra?: TAffix
  group?: string | null
  minLevelIncrease?: Phase1MinLevelIncrease
  stat?: (number | string)[]
}

const DATASET = cannithPhase1 as unknown as CannithPhase1Entry[]

interface ItemAugmentSlotState {
  id: string
  slotType: string // e.g., 'red', 'blue', 'colorless', 'sun', 'moon', 'lamordia: ...'
  selectedAugment: AugmentItem | null
  // Per-slot augment filters
  filters: string[]
  filterMode: 'OR' | 'AND'
}

interface ItemState {
  slotKey: string
  prefix: CoreChoice
  suffix: CoreChoice
  extra: CoreChoice
  hasCannithMark: boolean
  augmentSlots: ItemAugmentSlotState[]
  minLevelOverride?: number | null
  // If null/undefined => inherit from master binding; otherwise true=Bound, false=Unbound
  bindingOverride?: boolean | null
}

// Utility: map UI slot keys to dataset item tokens used in the phase1 JSON
const SLOT_KEY_TO_DATA_TOKENS: Record<string, string[]> = {
  mainHand: ['Weapon (Melee)', 'Weapon (Ranged)', 'Weapon'],
  offHand: ['Weapon (Melee)', 'Weapon (Ranged)', 'Weapon', 'Off-hand Weapon'],
  runeArm: ['Runearm', 'Rune Arm'],
  orb: ['Orb'],
  armor: ['Armor'],
  belt: ['Belt'],
  boots: ['Boots'],
  bracers: ['Bracers'],
  cloak: ['Cloak'],
  gloves: ['Gloves'],
  goggles: ['Goggles'],
  helmet: ['Helm', 'Helmet', 'Head'],
  necklace: ['Necklace', 'Neck'],
  ring1: ['Ring'],
  ring2: ['Ring'],
  trinket: ['Trinket'],
  shield: ['Shield']
}

type AffixKind = 'prefix' | 'suffix' | 'extra'

// Extract per-affix options from the dataset for a given slot key
const getAffixOptions = (slotKey: string, affix: AffixKind): string[] => {
  const dataTokensForSlot = SLOT_KEY_TO_DATA_TOKENS[slotKey] ?? []

  if (dataTokensForSlot.length === 0) return []

  const fieldName = affix as 'prefix' | 'suffix' | 'extra'

  const options = new Set<string>()

  DATASET.forEach((entry) => {
    const raw = entry?.[fieldName]
    if (raw == null) return

    let allowed: string[] = []

    if (Array.isArray(raw)) {
      allowed = raw.map((value) => value.trim()).filter(Boolean)
    } else {
      allowed = raw
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
    }

    // if any token matches our slot tokens, include this enhancement
    const matches = allowed.some((token) => dataTokensForSlot.includes(token))
    if (matches) {
      if (typeof entry?.name === 'string' && entry.name) options.add(entry.name)
    }
  })

  return Array.from(options).sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }))
}

const ALL_SLOT_KEYS: { key: string; label: string }[] = [
  { key: 'mainHand', label: 'Weapon (Main Hand)' },
  { key: 'offHand', label: 'Weapon (Off Hand)' },
  { key: 'runeArm', label: 'Rune Arm' },
  { key: 'orb', label: 'Orb' },
  { key: 'armor', label: 'Armor' },
  { key: 'belt', label: 'Belt' },
  { key: 'boots', label: 'Boots' },
  { key: 'bracers', label: 'Bracers' },
  { key: 'cloak', label: 'Cloak' },
  { key: 'gloves', label: 'Gloves' },
  { key: 'goggles', label: 'Goggles' },
  { key: 'helmet', label: 'Head' },
  { key: 'necklace', label: 'Neck' },
  { key: 'ring1', label: 'Ring 1' },
  { key: 'ring2', label: 'Ring 2' },
  { key: 'trinket', label: 'Trinket' },
  { key: 'shield', label: 'Shield' }
]

// Only colorized slots are eligible for the augment list.
const AVAILABLE_AUGMENT_TYPES: { key: string; label: string }[] = [
  { key: 'red', label: 'Red' },
  { key: 'blue', label: 'Blue' },
  { key: 'yellow', label: 'Yellow' },
  { key: 'purple', label: 'Purple' },
  { key: 'orange', label: 'Orange' },
  { key: 'green', label: 'Green' },
  { key: 'colorless', label: 'Colorless' }
]

const ALLOWED_AUGMENT_KEYS = new Set(AVAILABLE_AUGMENT_TYPES.map((t) => t.key))

// Certain augment slot colors only appear in
// certain item categories. This function expresses that availability per UI slot key.
// Notes (from the screenshot text "Found in:"):
// - Red: Weapons, Shields, or other hand-held items
// - Blue: Armor/Robes/Outfits, Shields, or other off-hand items (e.g., Orbs, Runearms)
// - Yellow: Accessory items (Ring, Neck, Boots, Belt, Gloves, Goggles, Helmet, Bracers, Cloak, Trinket)
// - Purple: Named Weapons, Shields, or other hand-held items
// - Orange: Named Weapons, Shields, or other hand-held items
// - Green: Accessory items (and named Armor/Robes/Outfits — omitted here for crafted generics)
// - Colorless: Any type of item
const ACCESSORY_SLOT_KEYS = new Set<string>([
  'belt',
  'boots',
  'bracers',
  'cloak',
  'gloves',
  'goggles',
  'helmet',
  'necklace',
  'ring1',
  'ring2',
  'trinket'
])

const isHandHeld = (slotKey: string) => ['mainHand', 'offHand', 'shield', 'orb', 'runeArm'].includes(slotKey)
const isShield = (slotKey: string) => slotKey === 'shield'
const isArmor = (slotKey: string) => slotKey === 'armor'
const isOffHandNonWeapon = (slotKey: string) => slotKey === 'orb' || slotKey === 'runeArm' || slotKey === 'shield'

const allowedAugmentColorsForSlot = (slotKey: string): string[] => {
  const allowed = new Set<string>()

  // Colorless always allowed
  allowed.add('colorless')

  // Red: weapons, shields, other hand-held items
  if (isHandHeld(slotKey)) {
    allowed.add('red')
  }

  // Blue: armor/robes/outfits, shields, or other off-hand items (orbs, runearms)
  if (isArmor(slotKey) || isShield(slotKey) || isOffHandNonWeapon(slotKey)) allowed.add('blue')

  // Yellow: accessories only
  if (ACCESSORY_SLOT_KEYS.has(slotKey)) allowed.add('yellow')

  // Purple/Orange: named hand-held items — include hand-held categories
  if (isHandHeld(slotKey)) {
    allowed.add('purple')
    allowed.add('orange')
  }

  // Green: accessories (omit armor named special-case for now)
  if (ACCESSORY_SLOT_KEYS.has(slotKey)) allowed.add('green')

  return Array.from(allowed)
}

const STORAGE_KEY = 'cannithCraftingState'

const CannithCrafting = () => {
  // Trove integration: get uploaded inventory from a localStorage-backed Redux slice
  const { troveData } = useAppSelector((state) => state.app, shallowEqual)
  const [items, setItems] = useState<Record<string, ItemState>>({})
  const [activeKeys, setActiveKeys] = useState<string[]>([])
  const [masterMinLevel, setMasterMinLevel] = useState<number>(1)
  // Binding master toggle: true = Bound, false = Unbound
  const [masterBindingBound, setMasterBindingBound] = useState<boolean>(true)
  // track which item cards are collapsed (default open -> not present in this set)
  const [collapsedKeys, setCollapsedKeys] = useState<string[]>([])

  const ML_OPTIONS: number[] = Array.from({ length: 32 }, (_, i) => i + 1)

  // ----- Augment color ML floor rules -----
  const AUGMENT_COLOR_FLOOR: Record<string, number> = {
    colorless: 1,
    red: 2,
    blue: 2,
    yellow: 3,
    green: 5,
    purple: 8,
    orange: 8
  }

  function computeAugmentMinLevelFloor(item: ItemState | undefined): number {
    if (!item) return 1
    let floor = 1

    for (const s of item.augmentSlots) {
      const f = AUGMENT_COLOR_FLOOR[s.slotType]
      if (typeof f === 'number') floor = Math.max(floor, f)
    }

    return floor
  }

  // Load from sessionStorage once
  useEffect(() => {
    try {
      const text = sessionStorage.getItem(STORAGE_KEY)
      if (text) {
        const parsed = JSON.parse(text) as {
          items: Record<string, ItemState>
          activeKeys: string[]
          masterMinLevel?: number
          masterBindingBound?: boolean
          collapsedKeys?: string[]
        }

        // sanitize any previously saved augment slots that are no longer supported
        const sanitizedItems: Record<string, ItemState> = {}
        Object.entries(parsed.items ?? {}).forEach(([savedSlotKey, savedItem]) => {
          // Sanitize augment slots and per-slot filters without using any
          const sanitizedAugmentSlots: ItemAugmentSlotState[] = (savedItem.augmentSlots ?? [])
            .filter((slot) => ALLOWED_AUGMENT_KEYS.has(slot.slotType))
            .filter((slot) => allowedAugmentColorsForSlot(savedSlotKey).includes(slot.slotType))
            .map((slot: Partial<ItemAugmentSlotState>): ItemAugmentSlotState => {
              const id: string = typeof slot.id === 'string' ? slot.id : crypto.randomUUID()
              const slotType: string = typeof slot.slotType === 'string' ? slot.slotType : 'colorless'

              // selectedAugment is optional; keep it only if it is an object with a name string
              const selectedAugment =
                slot.selectedAugment && typeof (slot.selectedAugment as unknown) === 'object'
                  ? slot.selectedAugment
                  : null

              const filters: string[] = Array.isArray((slot as { filters?: unknown }).filters)
                ? ((slot as { filters?: unknown }).filters as unknown[]).filter(
                    (v): v is string => typeof v === 'string'
                  )
                : []

              const filterMode: 'OR' | 'AND' = ((): 'OR' | 'AND' => {
                const maybe = (slot as { filterMode?: unknown }).filterMode
                return maybe === 'AND' || maybe === 'OR' ? maybe : 'OR'
              })()

              return { id, slotType, selectedAugment, filters, filterMode }
            })

          sanitizedItems[savedSlotKey] = {
            ...savedItem,
            augmentSlots: sanitizedAugmentSlots,
            // ensure the new field exists; keep the existing value if present
            minLevelOverride: savedItem.minLevelOverride ?? null,
            bindingOverride: typeof savedItem.bindingOverride === 'boolean' ? savedItem.bindingOverride : null
          }
        })

        setItems(sanitizedItems)
        setActiveKeys(parsed.activeKeys ?? [])
        setMasterMinLevel(typeof parsed.masterMinLevel === 'number' ? parsed.masterMinLevel : 1)
        setMasterBindingBound(typeof parsed.masterBindingBound === 'boolean' ? parsed.masterBindingBound : true)
        setCollapsedKeys(Array.isArray(parsed.collapsedKeys) ? parsed.collapsedKeys : [])
      }
    } catch (err) {
      // Log and continue on corrupt or unparsable storage (do not throw in UI thread)

      console.warn('CannithCrafting: failed to load session state – resetting to defaults.', err)
    }
  }, [])

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
    for (const key of Object.keys(items)) {
      const currentItem = items[key]
      const effectiveML = currentItem.minLevelOverride ?? masterMinLevel
      if (effectiveML >= 10) {
        nextItems[key] = currentItem
        continue
      }
      let prefix = currentItem.prefix
      let suffix = currentItem.suffix
      let extra = currentItem.extra
      if (prefix && !isEnhancementAllowedAtML(prefix, effectiveML)) prefix = null
      if (suffix && !isEnhancementAllowedAtML(suffix, effectiveML)) suffix = null
      if (extra && !isEnhancementAllowedAtML(extra, effectiveML)) extra = null
      if (prefix !== currentItem.prefix || suffix !== currentItem.suffix || extra !== currentItem.extra) {
        changed = true
        nextItems[key] = { ...currentItem, prefix, suffix, extra }
      } else {
        nextItems[key] = currentItem
      }
    }
    if (changed) setItems(nextItems)
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

        const { [slotKey]: _removed, ...rest } = prev

        return rest
      }
      // Selecting: initialize item state if missing
      if (prev[slotKey]) {
        return prev
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

    updateItem(slotKey, (item) => {
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
          const requiredFloor = AUGMENT_COLOR_FLOOR[augmentSlot.slotType]
          if (typeof requiredFloor === 'number') {
            minLevelFloor = Math.max(minLevelFloor, requiredFloor)
          }
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
    updateItem(slotKey, (item) => ({
      ...item,
      augmentSlots: item.augmentSlots.map((augmentSlot) =>
        augmentSlot.id === augmentSlotId ? { ...augmentSlot, selectedAugment: null } : augmentSlot
      )
    }))
  }

  // ----- Augment filtering helpers -----
  const filterAugmentOptions = (
    options: Record<string, Ingredient[]>,
    filters: string[],
    mode: 'OR' | 'AND'
  ): Record<string, Ingredient[]> => {
    if (!filters.length) {
      return options
    }

    if (mode === 'OR') {
      return filterIngredientsMap(filters, options)
    }

    // AND mode: ingredient must contain ALL selected effects
    const andFiltered: Record<string, Ingredient[]> = {}

    Object.entries(options).forEach(([slot, list]) => {
      andFiltered[slot] = list.filter((ingredient) => {
        const maybe = ingredient as unknown as { effectsAdded?: unknown }

        const effects = Array.isArray(maybe.effectsAdded)
          ? (maybe.effectsAdded as unknown[]).filter(
              (e): e is { name?: string } =>
                typeof (e as { name?: unknown }).name === 'string' || (e as { name?: unknown }).name == null
            )
          : undefined

        if (!effects || effects.length === 0) {
          return false
        }

        const names = new Set<string>(effects.map((e) => e.name ?? ''))

        return filters.every((f) => names.has(f))
      })
    })

    return andFiltered
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

  // Build a lookup map for dataset entries by name for quick access when rendering scaled values
  const enhancementByName = useMemo(() => {
    const enhancementMap = new Map<string, CannithPhase1Entry>()
    DATASET.forEach((entry) => {
      if (entry && typeof entry.name === 'string') enhancementMap.set(entry.name, entry)
    })
    return enhancementMap
  }, [])

  // ----- Affix select renderer to reduce duplication -----
  const renderAffixSelect = (
    slotKey: string,
    item: ItemState,
    affix: AffixKind,
    label: string,
    disabled: boolean
  ): ReactElement => {
    const effectiveML = item.minLevelOverride ?? masterMinLevel
    const baseOptions = affixOptionsBySlot[slotKey]?.[affix] ?? []
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

  // Helper: determine if an enhancement is "Insightful" for ML gating
  const isInsightfulEnhancement = (name: string | null): boolean => {
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
          (enchantMeta: Phase1EnchantmentMeta) => (enchantMeta.bonusType ?? '').toLowerCase() === 'insight'
        )
      : false

    return nameSuggestsInsight || enchantmentSuggestsInsight || isParrying
  }

  // Rule: Insightful effects (including Parrying) cannot be applied if effective ML < 10
  function isEnhancementAllowedAtML(name: string | null, effectiveML: number): boolean {
    if (!name) return true
    if (isInsightfulEnhancement(name) && (effectiveML || 1) < 10) return false
    return true
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

  // Build rows data (icon | name | qty) and shard level for a given enhancement name
  const buildMaterials = (
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

    if (essenceQty != null && essenceQty > 0) rows.push({ name: toSingularName('Cannith Essences'), qty: essenceQty })
    if (purifiedQty != null && purifiedQty > 0) {
      rows.push({ name: toSingularName('Purified Eberron Dragonshard Fragments'), qty: purifiedQty })
    }

    collectibles.forEach((collectible) => {
      if (
        collectible &&
        typeof collectible.qty === 'number' &&
        collectible.qty > 0 &&
        typeof collectible.name === 'string' &&
        collectible.name
      )
        rows.push({ name: toSingularName(collectible.name), qty: collectible.qty })
    })

    if (rows.length === 0) {
      return null
    }

    return { shardLevel, rows }
  }

  // Renders a full-width stacked Accordion of requirement cards (default closed)
  function renderMaterialsAccordion(slotKey: string, item: ItemState): ReactElement | null {
    const boundEffective = items[slotKey]?.bindingOverride ?? masterBindingBound
    const effectiveML = items[slotKey]?.minLevelOverride ?? masterMinLevel

    const selections: { key: string; label: string; name: string | null }[] = [
      {
        key: 'prefix',
        label: 'Prefix',
        name: item.prefix && affixOptionsBySlot[slotKey]?.prefix.includes(item.prefix) ? item.prefix : null
      },
      {
        key: 'suffix',
        label: 'Suffix',
        name: item.suffix && affixOptionsBySlot[slotKey]?.suffix.includes(item.suffix) ? item.suffix : null
      },
      {
        key: 'extra',
        label: 'Extra',
        name:
          item.hasCannithMark && item.extra && affixOptionsBySlot[slotKey]?.extra.includes(item.extra)
            ? item.extra
            : null
      }
    ]

    // Build list of accordion items to render
    const itemsToRender = selections
      .map((selection) => ({
        ...selection,
        data: buildMaterials(selection.name, boundEffective),
        valueOnly: getEnhancementValueOnly(selection.name, effectiveML),
        display: getEnhancementDisplay(selection.name, effectiveML)
      }))
      // Apply ML gating: hide Insightful effects when effective ML < 10
      .filter((entry) => entry.name && isEnhancementAllowedAtML(entry.name, effectiveML) && entry.data) as {
      key: string
      label: string
      name: string
      data: { shardLevel: number | null; rows: { name: string; qty: number }[] }
      valueOnly: string | null
      display: string | null
    }[]

    if (itemsToRender.length === 0) {
      return null
    }

    const materialImageSrc = (materialName: string): string => {
      const slug = materialName
        .toLowerCase()
        .replaceAll(/[^a-z0-9]+/g, '-')
        // eslint-disable-next-line sonarjs/slow-regex,sonarjs/anchor-precedence
        .replaceAll(/^-+|-+$/g, '')

      return `/images/collectibles/${slug}.png`
    }

    return (
      <Accordion defaultActiveKey={[]} alwaysOpen className='mt-2'>
        {itemsToRender.map((accordionEntry) => (
          <Accordion.Item eventKey={accordionEntry.key} key={accordionEntry.key}>
            <Accordion.Header>
              <div className='d-flex w-100 align-items-center justify-content-between gap-2'>
                <strong>{accordionEntry.display ?? ''}</strong>
                {accordionEntry.data.shardLevel != null && (
                  <small className='text-muted'>{`Shard Level ${String(accordionEntry.data.shardLevel)}`}</small>
                )}
              </div>
            </Accordion.Header>
            <Accordion.Body className='p-0'>
              <Table size='sm' responsive className='mb-0 align-middle'>
                <colgroup>
                  <col style={{ width: '36px' }} />
                  <col />
                  <col style={{ width: '1%', whiteSpace: 'nowrap' }} />
                </colgroup>
                <tbody>
                  {accordionEntry.data.rows.map((row) => (
                    <tr key={`${row.name}-${String(row.qty)}`}>
                      <td className='text-center'>
                        <FallbackImage src={materialImageSrc(row.name)} alt={row.name} width='28px' />
                      </td>
                      <td className='text-truncate' title={row.name}>
                        {row.name}
                      </td>
                      <td className='text-end'>
                        {getOwnedIngredients({ name: row.name } as unknown as Ingredient, row.qty, troveData)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
    )
  }

  // Extracted to reduce nesting/cognitive complexity inside render
  function renderMinLevelOverride(slotKey: string, item: ItemState): ReactElement {
    const augmentFloor = computeAugmentMinLevelFloor(item)
    const effectiveML = item.minLevelOverride ?? masterMinLevel

    // Collect ML increase messages for selected affixes
    const incPairs: { name: string; inc: number }[] = []
    const pushIncreaseIfAny = (effectName: string | null) => {
      if (!effectName) return
      const inc = getEnhancementMinIncrease(effectName)
      if (inc > 0) incPairs.push({ name: effectName, inc })
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
          {ML_OPTIONS.map((lvl) => (
            <option key={lvl} value={lvl} disabled={lvl < augmentFloor}>{`ML ${String(lvl)}`}</option>
          ))}
        </Form.Select>

        {incPairs.length > 0 && (
          <div className='invalid-feedback d-block mt-1'>
            {incPairs.map((pair) => (
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
        <Card.Header className='text-center'>
          <h4 className='mb-0'>Cannith Crafting</h4>
          <Card.Subtitle>
            <small>
              Build a gear set with Prefix, Suffix, Extra, and Augment slots. Data persists for this session.
            </small>
          </Card.Subtitle>
        </Card.Header>

        <Card.Body>
          <Row>
            <Col lg={3} className='mb-3'>
              <Form.Group className='mb-3' controlId='master-binding'>
                <Form.Label>Binding</Form.Label>
                <Form.Select
                  value={masterBindingBound ? 'bound' : 'unbound'}
                  onChange={(event) => {
                    setMasterBindingBound(event.target.value === 'bound')
                  }}
                >
                  <option value='bound'>Bound</option>
                  <option value='unbound'>Unbound</option>
                </Form.Select>
              </Form.Group>
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
                {ALL_SLOT_KEYS.map((slotDef) => {
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
                    const item = items[slotKey]
                    if (!item) {
                      return null
                    }

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
                            <Form.Select
                              size='sm'
                              value={
                                items[slotKey]?.bindingOverride == null
                                  ? 'inherit'
                                  : items[slotKey]?.bindingOverride
                                    ? 'bound'
                                    : 'unbound'
                              }
                              onChange={(event) => {
                                const value = event.target.value
                                updateItem(slotKey, (currentItem) => ({
                                  ...currentItem,
                                  bindingOverride: value === 'inherit' ? null : value === 'bound'
                                }))
                              }}
                              title='Binding (override)'
                            >
                              <option value='inherit'>{`Inherit (${masterBindingBound ? 'Bound' : 'Unbound'})`}</option>
                              <option value='bound'>Bound</option>
                              <option value='unbound'>Unbound</option>
                            </Form.Select>
                            <Badge
                              bg='secondary'
                              title='Effective Minimum Level'
                            >{`ML ${String(items[slotKey]?.minLevelOverride ?? masterMinLevel)}`}</Badge>
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
    </Container>
  )
}

export default CannithCrafting
