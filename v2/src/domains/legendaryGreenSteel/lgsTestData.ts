const weaponSlots = ['tier1Weapon', 'tier2Weapon', 'tier3Weapon', 'active']
const equipmentSlots = ['tier1Equipment', 'tier2Equipment', 'tier3Equipment', 'active', 'taint']
const base = (id: number, name: string, type: string, types: string[]) => ({
  id,
  name,
  type,
  slots: types.map((slot) => ({ types: [slot] })),
  effectIds: [],
  recipeId: id + 1000
})
const effect = (id: number, displayName: string) => ({ id, displayName, description: displayName })
const tier = (augmentId: number, name: string, slot: string, effectId: number) => ({
  id: augmentId + 1000,
  recipeId: augmentId + 1000,
  augmentId,
  name,
  slotTypes: [slot],
  type: slot.endsWith('Weapon') ? 'weapon' : 'equipment',
  focus: 'Air',
  gem: 'Dominion',
  essence: 'Ethereal',
  effectIds: [effectId]
})
const recipe = (outputItemId: number, device: string, ingredientId: number, quantity: number) => ({
  id: outputItemId + 1000,
  outputItemId,
  device,
  quantity: 1,
  ingredients: [{ ingredientId, quantity }]
})
const active = (id: number, spell: string, description: string) => ({
  id,
  recipeId: id + 1000,
  name: `Legendary Green Steel Augment: ${spell}`,
  slotTypes: ['active'],
  spellId: id + 100,
  description,
  casterLevel: 10,
  charges: 1,
  rechargeCount: 1,
  effectIds: []
})
export const devices = Object.fromEntries(
  ['base', 'tier1', 'tier2', 'tier3', 'active'].map((k) => [k, { name: `${k} Altar` }])
)
export const files = {
  baseItems: [base(1, 'Weapon Base', 'weapon', weaponSlots), base(2, 'Accessory Base', 'equipment', equipmentSlots)],
  tier1: [tier(3, 'Tier 1 Weapon', 'tier1Weapon', 101), tier(4, 'Tier 1 Equipment', 'tier1Equipment', 102)],
  tier2: [tier(5, 'Tier 2 Weapon', 'tier2Weapon', 103)],
  tier3: [{ ...tier(6, 'Tier 3 Weapon Air Fire', 'tier3Weapon', 104), focuses: ['Air', 'Fire'] }],
  activeAugments: [active(7, 'Animal Growth', 'Animal spell.'), active(8, 'Cometfall', 'Falling comet.')],
  effects: [
    effect(101, 'Electric Spell Power +139 (Equipment)'),
    effect(102, 'Good-aligned Weapon'),
    effect(103, 'Electric Lore +29 (Equipment)'),
    effect(104, 'Electric Critical Damage +6')
  ],
  spells: [
    { id: 107, name: 'Animal Growth', description: 'Animal spell.', cooldownSeconds: 3.5 },
    { id: 108, name: 'Cometfall', description: 'Falling comet.', cooldownSeconds: 2 }
  ],
  weaponBonuses: [
    {
      id: 201,
      name: 'Air Fire Bonus',
      effectIds: [101],
      activationStatus: 'configured',
      requiredFocuses: { tier1And2: ['Air', 'Air'], tier3: ['Fire', 'Air'] }
    }
  ],
  equipmentSets: [
    {
      id: 202,
      name: 'Dominion',
      effectIds: [102],
      activationStatus: 'unresolved',
      activationReason: 'Piece threshold is unverified.'
    }
  ],
  ingredients: [
    { id: 21, name: 'Weapon Raw' },
    { id: 22, name: 'Accessory Raw' },
    { id: 23, name: 'Component Raw' },
    { id: 24, name: 'Tier 2 Raw' },
    { id: 25, name: 'Tier 3 Raw' },
    { id: 26, name: 'Active Raw' },
    { id: 27, name: 'Codex Rune' },
    { id: 31, name: 'Weapon Component', recipeId: 1031 },
    { id: 32, name: 'Tier 3 Component', recipeId: 1032 }
  ],
  baseRecipes: [recipe(1, 'base', 21, 1), recipe(2, 'base', 22, 1)],
  tier1Recipes: [recipe(3, 'tier1', 31, 1), recipe(4, 'tier1', 31, 2), recipe(31, 'tier1', 23, 2)],
  tier2Recipes: [recipe(5, 'tier2', 24, 2)],
  tier3Recipes: [recipe(6, 'tier3', 32, 3), recipe(32, 'tier3', 25, 3), recipe(9, 'tier3', 27, 2500)],
  activeRecipes: [recipe(7, 'active', 26, 1), recipe(8, 'active', 26, 1)],
  immortalsHeart: { id: 9, name: "Immortal's Heart", slotTypes: ['taint'], recipeId: 1009 }
}
