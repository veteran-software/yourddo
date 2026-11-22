import { loadDatasetFile } from '../../shared/data/loadDataset'
import type { CauldronRecipe, CauldronRequirement } from './recipes'

type Tier = 'heroic' | 'legendary'
interface RawRecipe {
  id: number
  category: 'setAugment' | 'weapon'
  description: string
  device: string
  outputItemId: number
  quantity: number
  ingredients: { ingredientId: number; quantity: number; excludeGift?: boolean }[]
}
interface Output {
  id: number
  recipeId: number
  name: string
  tier: Tier
}
interface Augment extends Output {
  setId: number
  slotTypes: string[]
  minimumLevel: number
  boundOnAcquire: boolean
  boundToAccount: boolean
}
interface Weapon extends Output {
  baseLevel: number
  description: string
  effectIds: number[]
}
interface Enchantment {
  name: string
  displayName: string
  value: number
  bonusType?: string
  unit?: string
}
interface Effect {
  id: number
  displayName: string
  enchantments: Enchantment[]
  knownDiscrepancies?: { stat: string; stated: number; mechanical: number; unit: string }[]
}
interface Resources {
  recipes: RawRecipe[]
  ingredients: { id: number; name: string; kind: string }[]
  augments: Augment[]
  weapons: Weapon[]
  equipmentSets: { id: number; name: string; thresholds: { pieces: number; effectId: number }[] }[]
  heroicEffects: Effect[]
  legendaryEffects: Effect[]
}
interface Manifest {
  system: string
  devices: Record<string, { name: string }>
  recipeRequirements: { excludeGlameredItems: boolean }
  resources: Record<keyof Resources, string>
}
export interface WeaponRecipe {
  id: number
  name: string
  minimumLevel: number
  tier: Tier
  description: string
  effects: string[]
  requirements: CauldronRequirement[]
}
export interface CauldronCatalog {
  augments: CauldronRecipe[]
  weapons: WeaponRecipe[]
}
export class InvalidCauldronRecipesError extends Error {
  constructor(detail = 'Invalid recipe data') {
    super('Invalid Cauldron of Cadence data: ' + detail)
  }
}

function lookup<T extends { id: number }>(rows: T[]) {
  const index = new Map(rows.map((row) => [row.id, row]))
  if (index.size !== rows.length) throw new InvalidCauldronRecipesError('duplicate resource ID')
  return (id: number) => {
    const row = index.get(id)
    if (!row) throw new InvalidCauldronRecipesError('missing resource ' + String(id))
    return row
  }
}

function modifier(effect: Enchantment) {
  if (!Number.isFinite(effect.value)) throw new InvalidCauldronRecipesError(effect.displayName)
  if (effect.unit !== 'coefficient') return effect.unit === 'percent' ? String(effect.value) + '%' : effect.value
  const value = Number((effect.value * 100).toFixed(8))
  // Power coefficients add points. All other coefficient stats on Cauldron sets add percentage points.
  return effect.displayName.endsWith('Power') ? value : String(value) + '%'
}

export function buildCauldronCatalog(manifest: Manifest, data: Resources): CauldronCatalog {
  const catalog: CauldronCatalog = { augments: [], weapons: [] }
  const ingredient = lookup(data.ingredients)
  const augment = lookup(data.augments)
  const weapon = lookup(data.weapons)
  const set = lookup(data.equipmentSets)
  const effects = { heroic: lookup(data.heroicEffects), legendary: lookup(data.legendaryEffects) }
  for (const recipe of data.recipes) {
    const required = recipe.ingredients.map((input) => ({ ...ingredient(input.ingredientId), ...input }))
    const requirements = required.map(({ name, quantity }) => ({ name, quantity }))
    if (recipe.category === 'weapon') {
      const output = weapon(recipe.outputItemId)
      if (output.recipeId !== recipe.id) throw new InvalidCauldronRecipesError(output.name)
      catalog.weapons.push({
        id: output.id,
        name: output.name,
        tier: output.tier,
        minimumLevel: output.baseLevel,
        description: output.description,
        requirements,
        effects: output.effectIds.map((id) => effects[output.tier](id).displayName)
      })
      continue
    }
    if (recipe.category !== 'setAugment') throw new InvalidCauldronRecipesError('unknown recipe category')
    const output = augment(recipe.outputItemId)
    const equipment = required.filter((input) => input.kind === 'equipment')
    if (output.recipeId !== recipe.id || equipment.length !== 1) throw new InvalidCauldronRecipesError(output.name)
    const bonus = set(output.setId)
    const excluded = [
      equipment[0].excludeGift && 'gift',
      manifest.recipeRequirements.excludeGlameredItems && 'glamered'
    ].filter(Boolean)
    catalog.augments.push({
      name: output.name,
      quantity: recipe.quantity,
      description: recipe.description,
      augmentType: output.slotTypes.join(', '),
      minimumLevel: output.minimumLevel,
      craftedIn: manifest.devices[recipe.device].name,
      binding: {
        type: 'Bound',
        to: output.boundToAccount ? 'Account' : 'Character',
        from: output.boundOnAcquire ? 'Acquisition' : 'Equip'
      },
      requiredItem: equipment[0].name,
      requirements,
      restrictions: excluded.length ? 'The named item cannot be a ' + excluded.join(' or ') + ' version.' : undefined,
      setBonus: bonus.thresholds.map((threshold) => {
        const effect = effects[output.tier](threshold.effectId)
        return {
          name: bonus.name,
          numPiecesEquipped: threshold.pieces,
          enhancements: effect.enchantments.map((entry) => ({
            name: entry.displayName,
            bonus: entry.bonusType,
            modifier: modifier(entry)
          })),
          discrepancies: effect.knownDiscrepancies?.map((note) => {
            const label = effect.enchantments.find((entry) => entry.name === note.stat)?.displayName ?? note.stat
            const unit = note.unit === 'percent' ? '%' : ''
            return label + ': stated ' + String(note.stated) + unit + ', actual ' + String(note.mechanical) + unit + '.'
          })
        }
      })
    })
  }
  return catalog
}

export async function loadCauldronRecipes(): Promise<CauldronCatalog> {
  const directory = 'cauldron-of-cadence/'
  const manifest = await loadDatasetFile<Manifest>(directory + 'manifest.json')
  if (manifest?.system !== 'cauldron-of-cadence' || !manifest.resources)
    throw new InvalidCauldronRecipesError('manifest')
  const read = <K extends keyof Resources>(key: K) => {
    const path = manifest.resources[key]
    if (!path) throw new InvalidCauldronRecipesError(key)
    return loadDatasetFile<Resources[K]>(directory + path)
  }
  const [recipes, ingredients, augments, weapons, equipmentSets, heroicEffects, legendaryEffects] = await Promise.all([
    read('recipes'),
    read('ingredients'),
    read('augments'),
    read('weapons'),
    read('equipmentSets'),
    read('heroicEffects'),
    read('legendaryEffects')
  ])
  try {
    return buildCauldronCatalog(manifest, {
      recipes,
      ingredients,
      augments,
      weapons,
      equipmentSets,
      heroicEffects,
      legendaryEffects
    })
  } catch (error) {
    if (error instanceof InvalidCauldronRecipesError) throw error
    throw new InvalidCauldronRecipesError('malformed resource')
  }
}
