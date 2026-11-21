import { SAVE_FILE_VERSION, SaveFileSchema } from '../../schemas'
import { createDefaultSetup, initialPetState } from './initialState'
import type { GearSetup } from './types'
import { createEmptyItemUpgrades, migrateLegacyItemUpgrades } from './upgradeState'

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const getImportedString = (value: unknown, fallback: string): string => {
  return typeof value === 'string' && value.trim() ? value : fallback
}

const getImportedNumber = (value: unknown, fallback: number): number => {
  return typeof value === 'number' ? value : fallback
}

const getImportedBoolean = (value: unknown, fallback: boolean): boolean => {
  return typeof value === 'boolean' ? value : fallback
}

const getImportedRecord = <T extends Record<string, unknown>>(value: unknown, fallback: T): T => {
  return isRecord(value) ? (value as T) : fallback
}

const normalizeImportedPetState = (value: unknown): GearSetup['artificerPet'] => {
  const base = initialPetState()
  if (!isRecord(value)) return base

  const petState: GearSetup['artificerPet'] = {
    ...base,
    slots: getImportedRecord(value.slots, base.slots),
    slottedAugments: getImportedRecord(value.slottedAugments, base.slottedAugments),
    slottedCurses: getImportedRecord(value.slottedCurses, base.slottedCurses),
    slottedFiligrees: getImportedRecord(value.slottedFiligrees, base.slottedFiligrees),
    unlockedFiligreeSlots: getImportedRecord(value.unlockedFiligreeSlots, base.unlockedFiligreeSlots),
    slottedGemSetBonuses: getImportedRecord(value.slottedGemSetBonuses, base.slottedGemSetBonuses),
    slottedEssenceEnchantments: getImportedRecord(value.slottedEssenceEnchantments, base.slottedEssenceEnchantments),
    itemUpgrades: getImportedRecord(value.itemUpgrades, {})
  }

  migrateLegacyItemUpgrades(petState, petState.itemUpgrades)

  return petState
}

const normalizeImportedSetup = (value: unknown, index: number): GearSetup => {
  const base = createDefaultSetup(`imported-${String(index + 1)}`, `Imported Setup ${String(index + 1)}`)
  if (!isRecord(value)) return base

  const setup: GearSetup = {
    ...base,
    id: getImportedString(value.id, base.id),
    name: getImportedString(value.name, base.name),
    minLevel: getImportedNumber(value.minLevel, base.minLevel),
    maxLevel: getImportedNumber(value.maxLevel, base.maxLevel),
    classes: Array.isArray(value.classes) ? (value.classes as GearSetup['classes']) : base.classes,
    weaponFilters: Array.isArray(value.weaponFilters)
      ? (value.weaponFilters as GearSetup['weaponFilters'])
      : base.weaponFilters,
    armorFilters: Array.isArray(value.armorFilters)
      ? (value.armorFilters as GearSetup['armorFilters'])
      : base.armorFilters,
    shieldFilters: Array.isArray(value.shieldFilters)
      ? (value.shieldFilters as GearSetup['shieldFilters'])
      : base.shieldFilters,
    allowMetalWithDruid: getImportedBoolean(value.allowMetalWithDruid, base.allowMetalWithDruid),
    slots: getImportedRecord(value.slots, base.slots),
    slottedAugments: getImportedRecord(value.slottedAugments, base.slottedAugments),
    slottedCurses: getImportedRecord(value.slottedCurses, base.slottedCurses),
    slottedFiligrees: getImportedRecord(value.slottedFiligrees, base.slottedFiligrees),
    unlockedFiligreeSlots: getImportedRecord(value.unlockedFiligreeSlots, base.unlockedFiligreeSlots),
    slottedGemSetBonuses: getImportedRecord(value.slottedGemSetBonuses, base.slottedGemSetBonuses),
    slottedEssenceEnchantments: getImportedRecord(value.slottedEssenceEnchantments, base.slottedEssenceEnchantments),
    itemUpgrades: getImportedRecord(value.itemUpgrades, createEmptyItemUpgrades()),
    artificerPet: normalizeImportedPetState(value.artificerPet),
    druidPet: normalizeImportedPetState(value.druidPet)
  }

  migrateLegacyItemUpgrades(setup, setup.itemUpgrades)

  return setup
}

const extractLegacySetups = (payload: unknown): readonly unknown[] | null => {
  if (Array.isArray(payload)) return payload as readonly unknown[]
  if (isRecord(payload) && Array.isArray(payload.setups)) return payload.setups as readonly unknown[]
  return null
}

export const exportSetupsToJson = (setups: GearSetup[]): void => {
  const payload = {
    version: SAVE_FILE_VERSION,
    exportedAt: new Date().toISOString(),
    setups
  }

  const validation = SaveFileSchema.safeParse(payload)
  if (!validation.success) {
    console.error('Export validation error:', validation.error)
    throw new Error('Failed to save: current gear data failed validation.')
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'gear-planner-save.json'
  anchor.click()
  URL.revokeObjectURL(url)
}

export const importSetupsFromJson = async (file: File): Promise<GearSetup[]> => {
  const text = await file.text()
  const parsed = JSON.parse(text) as unknown
  const result = SaveFileSchema.safeParse(parsed)
  if (result.success) {
    return result.data.setups as GearSetup[]
  }

  const legacySetups = extractLegacySetups(parsed)
  if (!legacySetups) {
    console.error('Import validation error:', result.error)
    throw new Error('The selected file is not a valid gear planner save file.')
  }

  return legacySetups.map((setup, index): GearSetup => normalizeImportedSetup(setup, index))
}
