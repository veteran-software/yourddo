import { filterIngredientsMap } from '../../components/filters/helpers/filterUtils.ts'
import type { Ingredient } from '../../types/ingredients.ts'
import {
  ACCESSORY_SLOT_KEYS,
  type AffixKind,
  ALLOWED_AUGMENT_KEYS,
  type CannithPhase1Entry,
  type CoreChoice,
  DATASET,
  type ItemAugmentSlotState,
  type ItemState,
  SLOT_KEY_TO_DATA_TOKENS
} from './types.ts'

export const getAffixOptions = (slotKey: string, affix: AffixKind): string[] => {
  const dataTokensForSlot = SLOT_KEY_TO_DATA_TOKENS[slotKey] ?? []

  if (dataTokensForSlot.length === 0) return []

  const fieldName = affix as 'prefix' | 'suffix' | 'extra'

  const options = new Set<string>()

  DATASET.forEach((entry: CannithPhase1Entry) => {
    const raw = entry[fieldName]
    if (raw == null) {
      return
    }

    let allowed: string[]

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
      if (entry.name) {
        options.add(entry.name)
      }
    }
  })

  return Array.from(options).sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }))
}

export const isHandHeld = (slotKey: string) => ['mainHand', 'offHand', 'shield', 'orb', 'runeArm'].includes(slotKey)
export const isShield = (slotKey: string) => slotKey === 'shield'
export const isArmor = (slotKey: string) => slotKey === 'armor'
export const isOffHandNonWeapon = (slotKey: string) =>
  slotKey === 'orb' || slotKey === 'runeArm' || slotKey === 'shield'

export const allowedAugmentColorsForSlot = (slotKey: string): string[] => {
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

export const STORAGE_KEY = 'cannithCraftingState'

export const ML_OPTIONS: number[] = Array.from({ length: 32 }, (_, i) => i + 1)

export const filterAugmentOptions = (
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

export const iterateItemsOnLevelChange = (
  items: Record<string, ItemState>,
  masterMinLevel: number,
  nextItems: Record<string, ItemState>,
  isEnhancementAllowedAtML: (name: string | null, effectiveML: number) => boolean,
  changed: boolean
) => {
  for (const key of Object.keys(items)) {
    const currentItem = items[key]
    const effectiveML = currentItem.minLevelOverride ?? masterMinLevel

    if (effectiveML >= 10) {
      nextItems[key] = currentItem

      continue
    }

    let prefix: CoreChoice = currentItem.prefix
    let suffix: CoreChoice = currentItem.suffix
    let extra: CoreChoice = currentItem.extra

    if (prefix && !isEnhancementAllowedAtML(prefix, effectiveML)) {
      prefix = null
    }

    if (suffix && !isEnhancementAllowedAtML(suffix, effectiveML)) {
      suffix = null
    }

    if (extra && !isEnhancementAllowedAtML(extra, effectiveML)) {
      extra = null
    }

    if (prefix !== currentItem.prefix || suffix !== currentItem.suffix || extra !== currentItem.extra) {
      changed = true
      nextItems[key] = {
        ...currentItem,
        prefix,
        suffix,
        extra
      }
    } else {
      nextItems[key] = currentItem
    }
  }

  return changed
}

export const sanitizeAugmentsOnItems = (parsed: {
  items: Record<string, ItemState>
  activeKeys: string[]
  masterMinLevel?: number
  masterBindingBound?: boolean
  collapsedKeys?: string[]
}) => {
  const sanitizedItems: Record<string, ItemState> = {}

  Object.entries(parsed.items).forEach(([savedSlotKey, savedItem]) => {
    // Sanitize augment slots and per-slot filters without using any
    const sanitizedAugmentSlots: ItemAugmentSlotState[] = savedItem.augmentSlots
      .filter((slot: ItemAugmentSlotState) => ALLOWED_AUGMENT_KEYS.has(slot.slotType))
      .filter((slot: ItemAugmentSlotState) => allowedAugmentColorsForSlot(savedSlotKey).includes(slot.slotType))
      .map((slot: Partial<ItemAugmentSlotState>): ItemAugmentSlotState => {
        const id: string = typeof slot.id === 'string' ? slot.id : crypto.randomUUID()
        const slotType: string = typeof slot.slotType === 'string' ? slot.slotType : 'colorless'

        // selectedAugment is optional; keep it only if it is an object with a name string
        const selectedAugment =
          slot.selectedAugment && typeof (slot.selectedAugment as unknown) === 'object' ? slot.selectedAugment : null

        const filters: string[] = Array.isArray(
          (
            slot as {
              filters?: unknown
            }
          ).filters
        )
          ? (
              (
                slot as {
                  filters?: unknown
                }
              ).filters as unknown[]
            ).filter((v): v is string => typeof v === 'string')
          : []

        const filterMode: 'OR' | 'AND' = ((): 'OR' | 'AND' => {
          const maybe = (
            slot as {
              filterMode?: unknown
            }
          ).filterMode

          return maybe === 'AND' || maybe === 'OR' ? maybe : 'OR'
        })()

        return {
          id,
          slotType,
          selectedAugment,
          filters,
          filterMode
        }
      })

    sanitizedItems[savedSlotKey] = {
      ...savedItem,
      augmentSlots: sanitizedAugmentSlots,
      // ensure the new field exists; keep the existing value if present
      minLevelOverride: savedItem.minLevelOverride ?? null,
      bindingOverride: typeof savedItem.bindingOverride === 'boolean' ? savedItem.bindingOverride : null
    }
  })

  return sanitizedItems
}
