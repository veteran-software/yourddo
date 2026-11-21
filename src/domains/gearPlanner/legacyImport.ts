import type { EssenceCraftingData } from '../essenceCrafting/essenceCrafting.types'
import { gearPlannerAugmentIdentity } from './augments'
import { gearCraftGroups } from './crafting'
import { getEssenceCraftedGearPlannerItems } from './essenceCrafting'
import { classNames, changeClasses, defaultCharacter, proficiencyOptions, slotOwner } from './character'
import { allGearPlannerSlots, type GearPlannerData } from './gearPlanner.types'
import { gearPlannerMaximumLevel, gearPlannerMinimumLevel } from './setups'
import type { PersistedGearPlannerSetupV1, GearPlannerRestoreIssue } from './plannerStorage'
import { gearPlannerReforgingRecipeForStage, type GearPlannerItemReforgingState } from './reforging'

type Row = Record<string, unknown>
const object = (v: unknown): v is Row => !!v && typeof v === 'object' && !Array.isArray(v)
const field = (v: unknown, key: string): unknown => (object(v) && Object.hasOwn(v, key) ? v[key] : undefined)
const nameOf = (v: unknown) => {
  const name = typeof v === 'string' ? v : field(v, 'name')
  return typeof name === 'string' ? name : ''
}
const scalar = (value: unknown) => (typeof value === 'string' || typeof value === 'number' ? String(value) : '')
const entries = (v: unknown): [string, unknown][] => {
  if (v == null) return []
  if (!object(v) && !Array.isArray(v)) throw new Error('Invalid legacy Gear Planner selection list.')
  return Object.entries(v)
}

const crafts = {
  nearlyComplete: 'nearly-complete',
  fountainOfNecroticMight: 'fountain',
  stormreaverUpgrade: 'stormreaver',
  zhentarimAttuned: 'zhentarim',
  mythicBoost: 'mythic',
  reaperForge: 'reaper-forge',
  ritualTable: 'ritual-table',
  traceOfMadness: 'trace-of-madness',
  lostPurpose: 'lost-purpose'
}
const stages = {
  nearlyFinished: 'nearly-finished',
  almostThere: 'almost-there',
  finishingTouch: 'finishing-touch'
} as const

export function convertLegacyGearSave(value: unknown, data: GearPlannerData, essence?: EssenceCraftingData) {
  // Redux browser saves use characterSetups. Older snapshots can omit an empty slots map.
  const browserSetups = field(value, 'characterSetups')
  const setups: unknown = Array.isArray(browserSetups)
    ? browserSetups.map((s: unknown) =>
        object(s) && typeof s.id === 'string' && s.slots == null ? { ...s, slots: {} } : s
      )
    : Array.isArray(value)
      ? value
      : field(value, 'setups')
  // Both file formats use version 1. Only legacy exports store item objects in "slots".
  if (!Array.isArray(setups) || !setups.some((s: unknown) => object(s) && 'slots' in s)) return null
  if (object(value) && value.version !== undefined && value.version !== 1)
    throw new Error('Unsupported legacy Gear Planner save version.')
  const issues: GearPlannerRestoreIssue[] = []
  const converted = setups.map((raw: unknown, index: number) => {
    if (!object(raw) || !object(raw.slots) || 'equipment' in raw) throw new Error('Invalid legacy Gear Planner setup.')
    const name = typeof raw.name === 'string' ? raw.name : `Imported Setup ${String(index + 1)}`
    const warn = (message: string) => {
      issues.push({ kind: 'legacy-selection', message: `${name}: ${message}` })
    }
    const equipment = {} as PersistedGearPlannerSetupV1['equipment']
    type List<K extends keyof PersistedGearPlannerSetupV1> =
      NonNullable<PersistedGearPlannerSetupV1[K]> extends readonly (infer E)[] ? E[] : never
    const selectedAugments: List<'selectedAugments'> = [],
      selectedCurses: List<'selectedCurses'> = [],
      selectedFiligrees: List<'selectedFiligrees'> = [],
      unlockedFiligreeSlots: List<'unlockedFiligreeSlots'> = []
    const selectedCrafts: List<'selectedCrafts'> = [],
      selectedReforging: List<'selectedReforging'> = [],
      selectedEssenceCrafting: List<'selectedEssenceCrafting'> = []
    const classes = Array.isArray(raw.classes)
      ? [
          ...new Set(raw.classes.filter((c: unknown): c is string => typeof c === 'string' && classNames.includes(c)))
        ].slice(0, 3)
      : []
    if (
      Array.isArray(raw.classes) &&
      raw.classes.some((c: unknown) => c != null && (typeof c !== 'string' || !classes.includes(c)))
    )
      warn('Unrecognized or excess character classes were skipped.')
    const character = changeClasses(defaultCharacter(), classes)
    for (const [key, legacyKey] of [
      ['weapons', 'weaponFilters'],
      ['armor', 'armorFilters'],
      ['shields', 'shieldFilters']
    ] as const) {
      const values = raw[legacyKey]
      if (!Array.isArray(values)) continue
      const options = proficiencyOptions[key]
      const normalized = values.map((v: unknown) => {
        if (v === 'Longsword') {
          return 'Long Sword'
        }
        if (v === 'Handaxe') {
          return 'Hand Axe'
        }
        return v
      })
      character[key] = [
        ...new Set(normalized.filter((v: unknown): v is string => typeof v === 'string' && options.includes(v)))
      ]
      if (normalized.some((v) => typeof v !== 'string' || !character[key].includes(v)))
        warn('Unrecognized ' + key + ' filters were skipped.')
    }
    character.allowMetalWithDruid = raw.allowMetalWithDruid === true || raw.allowMetalWithDruid === 1
    for (const entity of [raw, raw.artificerPet, raw.druidPet]) {
      for (const [slot, v] of entries(field(entity, 'slots'))) {
        if (v != null && !allGearPlannerSlots.some((s) => s === slot)) warn('Unsupported slot: ' + slot + '.')
      }
    }
    for (const slot of allGearPlannerSlots) {
      equipment[slot] = null
      const owner = slotOwner(slot)
      const pet = owner === 'Iron Defender' ? raw.artificerPet : owner === 'Wolf Companion' ? raw.druidPet : undefined
      const entity = field(field(pet, 'slots'), slot) != null && object(pet) ? pet : raw
      const source = field(entity.slots, slot)
      if (source == null) continue
      if (!object(source) || !nameOf(source)) throw new Error(`Invalid legacy equipment in ${slot}.`)
      const level = Number(source.minLevel === '' ? 1 : (source.minLevel ?? raw.minLevel ?? 1))
      const candidates = [...data.itemsBySlot[slot], ...getEssenceCraftedGearPlannerItems(slot, level)].filter(
        (i) => i.source.name === source.name && (!source.minLevel || i.minimumLevel === level)
      )
      const byPage = candidates.filter((i) => source.pageTitle && i.source.pageTitle === source.pageTitle)
      const matches = byPage.length ? byPage : candidates
      const byId = matches.filter(
        (i) => source.id === i.id || source.id === `${slot}|${i.source.name}|${String(i.minimumLevel)}|${i.sourceFile}`
      )
      const item = byId.length === 1 ? byId[0] : matches.length === 1 ? matches[0] : undefined
      if (!item) {
        warn(`${slot}: could not uniquely match ${nameOf(source)}.`)
        continue
      }
      const itemId = item.id
      equipment[slot] = itemId
      const selected = (key: string) => field(entity[key], scalar(source.id))
      const upgrades = selected('itemUpgrades')
      const upgrade = (key: string) =>
        object(upgrades) && Object.hasOwn(upgrades, key)
          ? upgrades[key]
          : selected('slotted' + key[0].toUpperCase() + key.slice(1))
      for (const [idx, a] of entries(selected('slottedAugments'))) {
        if (a == null) continue
        const same = data.augments.filter((x) => x.name === nameOf(a))
        const match = same.filter(
          (x) =>
            (!field(a, 'augmentType') || x.augmentType === field(a, 'augmentType')) &&
            (!field(a, 'minLevel') || x.minLevel === Number(field(a, 'minLevel')))
        )
        if (match.length === 1)
          selectedAugments.push({ itemId, slotIndex: Number(idx), augmentId: gearPlannerAugmentIdentity(match[0]) })
        else warn(`${slot}: unmatched augment ${nameOf(a)}.`)
      }
      const curse = selected('slottedCurses')
      if (curse) {
        const found = data.curses.find((c) => c.name === nameOf(curse))
        if (found) selectedCurses.push({ itemId, curseId: found.id })
        else warn(`${slot}: unmatched curse ${nameOf(curse)}.`)
      }
      const count = selected('unlockedFiligreeSlots')
      if (typeof count === 'number') unlockedFiligreeSlots.push({ itemId, count })
      for (const [idx, f] of entries(selected('slottedFiligrees'))) {
        if (!f) continue
        const filigrees = data.filigrees.filter((x) => x.name === nameOf(f))
        const found =
          filigrees.find((x) => x.source.pageTitle === field(f, 'pageTitle') && field(f, 'pageTitle')) ??
          (filigrees.length === 1 ? filigrees[0] : undefined)
        if (found) selectedFiligrees.push({ itemId, slotIndex: Number(idx), filigreeId: found.id })
        else warn(`${slot}: unmatched filigree ${nameOf(f)}.`)
      }
      if (item.essenceCrafting) {
        const affixes = selected('slottedEssenceEnchantments')
        const affixId = (pos: string) => {
          const old = field(affixes, pos)
          if (!old) return null
          const found = essence?.enhancements.find(
            (e) =>
              (e.id === old || e.displayName === old) &&
              e.placements.some(
                (p) => p.itemCategoryIds.some((id) => id === item.essenceCrafting?.itemCategoryId) && p.position === pos
              )
          )
          if (!found) warn(`${slot}: unmatched ${pos} ${scalar(old)}.`)
          return found?.id ?? null
        }
        selectedEssenceCrafting.push({
          itemId,
          minimumLevel: level,
          material: typeof source.material === 'string' ? source.material : '',
          prefixId: affixId('prefix'),
          suffixId: affixId('suffix'),
          extraId: affixId('extra')
        })
      }
      const groups = gearCraftGroups(item, data.crafting)
      const addCraft = (system: string, selection: unknown) => {
        if (!selection) return
        const target = nameOf(selection)
        const choices = groups.find((g) => g.system === system)?.choices ?? []
        const exact = choices.find((c) => c.id === target || c.label === target)
        const legacyMatches = choices.filter(
          (c) =>
            (system === 'mythic' && c.id === scalar(field(selection, 'modifier'))) ||
            (selection === true && c.id === 'applied') ||
            c.effects?.some(
              (e) =>
                e.name === target &&
                (field(selection, 'modifier') == null || scalar(e.modifier) === scalar(field(selection, 'modifier'))) &&
                (field(selection, 'bonus') == null ||
                  scalar(e.bonus ?? 'Enhancement') === scalar(field(selection, 'bonus')))
            )
        )
        const choice = exact ?? (legacyMatches.length === 1 ? legacyMatches[0] : undefined)
        if (choice) selectedCrafts.push({ itemId, system, choiceId: choice.id })
        else warn(`${slot}: unmatched ${system} upgrade ${target}.`)
      }
      for (const [key, system] of Object.entries(crafts)) addCraft(system, upgrade(key))
      for (const [idx, v] of entries(selected('slottedGemSetBonuses')))
        addCraft('gem-set-' + String(Number(idx) + 1), v)
      const restoredStages: Record<string, GearPlannerItemReforgingState[keyof GearPlannerItemReforgingState]> = {}
      for (const [key, stage] of Object.entries(stages)) {
        const sel = upgrade(key)
        if (!sel) continue
        const recipe = gearPlannerReforgingRecipeForStage(item, stage, data.reforging)
        const choice = recipe?.choices.find(
          (c) =>
            c.label === nameOf(sel) ||
            (c.effect.name === nameOf(sel) &&
              String(c.effect.modifier ?? '') === scalar(field(sel, 'modifier')) &&
              String(c.effect.bonus ?? '') === scalar(field(sel, 'bonus')))
        )
        if (recipe?.kind === 'toggle' && nameOf(sel) === '__active__') restoredStages[stage] = { kind: 'active' }
        else if (choice) restoredStages[stage] = { kind: 'choice', choiceId: choice.id }
        else warn(`${slot}: unmatched ${stage} upgrade.`)
      }
      if (Object.keys(restoredStages).length) selectedReforging.push({ itemId, stages: restoredStages })
    }
    return {
      id: raw.id ?? `imported-${String(index + 1)}`,
      name,
      minimumLevel: raw.minLevel ?? gearPlannerMinimumLevel,
      maximumLevel: raw.maxLevel ?? gearPlannerMaximumLevel,
      character,
      equipment,
      selectedAugments,
      selectedCurses,
      selectedFiligrees,
      unlockedFiligreeSlots,
      selectedEssenceCrafting,
      selectedReforging,
      selectedCrafts
    }
  })
  return {
    payload: { version: 1, activeSetupId: field(value, 'activeSetupId') ?? converted[0].id, setups: converted },
    issues
  }
}
