import type { SelectedAugments, ViktraniumData, ViktraniumItem } from './viktranium.types'

const encoder = new TextEncoder()

// The generated catalogs used the first twelve bytes of a SHA-256 digest for identity.
async function historicalId(kind: string, ...parts: (number | string)[]) {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(parts.join('\0')))
  return kind + '-' + Array.from(new Uint8Array(digest, 0, 12), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

// Name and minimum-level corrections prevent these historical augment IDs from being regenerated.
const changedAugments: Record<string, string> = {
  'augment-04f2199399d4e483d124c267': 'augment-1879278551', // Emerald of Eldritch Empowerment
  'augment-17f3c754faca0c66c7f460c7': 'augment-1879293277', // Solar Gem of Spell Critical Chance (Epic)
  'augment-18b547189e93ca5c8d7a7ce6': 'augment-1879265832', // Ruby of The Quori
  'augment-286f0813acaba418310e9cf4': 'augment-1879170179', // Ruby of Flame (5d6)
  'augment-29ab6f346e7a6220077683c3': 'augment-1879299466', // Solar Gem of Illusion  (Legendary)
  'augment-2abb79565ba13bdd741467e9': 'augment-1879170187', // Ruby of Frost (5d6)
  'augment-3a534322f16d906950693633': 'augment-1879267212', // Ruby of the Iron Hand
  'augment-4863a15fb93d092c10a6e518': 'augment-1879278551', // Emerald of Vile Empowerment
  'augment-4a746707cc9df0e5fb804f70': 'augment-1879299378', // Lunar Gem of Peace (Legendary)
  'augment-4be9ded50feaa6aa1800f144': 'augment-1879307362', // Topaz of Wizardry +327
  'augment-60d431b75a4af8e3e6056a8c': 'augment-1879299476', // Solar Gem of Illusion  (Heroic)
  'augment-6bbad4f4cf976a56d607cc0a': 'augment-1879305300', // Ruby of Radiance 66
  'augment-79669d83076f389df694d68b': 'augment-1879299373', // Lunar Gem of Peace (Heroic)
  'augment-7ab412c13bdbb496d9aa2727': 'augment-1879170197', // Ruby of Acid (5d6)
  'augment-7b99fc784c92bfa99f602cb5': 'augment-1879171547', // Ruby of The Gatekeepers
  'augment-80b0d0109fbe09b67fee870c': 'augment-1879299403', // Solar Gem of Enchantment (Legendary)
  'augment-8ef0b11b9d7b23ae874cf442': 'augment-1879299354', // Solar Gem of Arcane Endurance (Heroic)
  'augment-99d952f5363c50bd88045774': 'augment-1879265846', // Topaz of Spell Penetration +5
  'augment-9a6be4d9f1755772542864f9': 'augment-1879171673', // Topaz of Proof Against Disease +6
  'augment-acf716572ebd9610eeb54796': 'augment-1879293336', // Solar Gem of Arcane Layers (Legendary)
  'augment-b2c20d51346140af409a8844': 'augment-1879293337', // Solar Gem of Arcane Layers (Heroic)
  'augment-b5a9a09158f736be6db4ee46': 'augment-1879265828', // Topaz of Spell Penetration +3
  'augment-b941ce97a2a670954d198cd9': 'augment-1879299410', // Lunar Gem of Evocation (Legendary)
  'augment-c9c272e171a5599f3b065bc4': 'augment-1879288748', // Globe of Cursed Blood
  'augment-cb3a95ef5a14b6d08107c9eb': 'augment-1879171630', // Topaz of Proof Against Poison +6
  'augment-ccb82caa8178d61b32de4202': 'augment-1879265478', // Topaz of Augment Summoning
  'augment-f2ed2ec17ca575766a52ad36': 'augment-1879170181', // Ruby of Shock (5d6)
  'augment-f4a2d8d17294a07cf9a6e402': 'augment-1879270658' // Clearwater Diamond
}

// The generated feed ordered sockets alphabetically. These items also changed which socket types they contain.
const previousTypes: Readonly<Record<string, readonly string[]>> = {
  'Legendary Experimental Rocket Boots': [
    'Blue',
    'Green',
    'Lamordia: Dolorous (Accessory)',
    'Lamordia: Melancholic (Accessory)',
    'Moon',
    'Yellow'
  ],
  'Gloves of the Graverobber': ['Blue', 'Lamordia: Dolorous (Accessory)', 'Lamordia: Melancholic (Accessory)', 'Sun'],
  'The Final Climb': [
    'Blue',
    'Green',
    'Lamordia: Dolorous (Accessory)',
    'Lamordia: Melancholic (Accessory)',
    'Lamordia: Miserable (Accessory)',
    'Lamordia: Woeful (Accessory)',
    'Sun'
  ],
  'The Wicked Spines': [
    'Blue',
    'Green',
    'Lamordia: Dolorous (Accessory)',
    'Lamordia: Melancholic (Weapon)',
    'Lamordia: Miserable (Accessory)',
    'Lamordia: Woeful (Accessory)',
    'Moon'
  ],
  'Legendary Gloves of the Graverobber': [
    'Colorless',
    'Green',
    'Lamordia: Dolorous (Accessory)',
    'Lamordia: Melancholic (Accessory)',
    'Sun'
  ]
}

const historicalSlots = new WeakMap<ViktraniumItem, ReadonlyMap<string, string>>()

export function restoreNativeSlotSelections(
  item: ViktraniumItem | undefined,
  selected: SelectedAugments
): SelectedAugments {
  const aliases = item && historicalSlots.get(item)
  if (!aliases) return selected
  const restored = { ...selected }
  for (const [id, value] of Object.entries(selected)) {
    const current = aliases.get(id)
    if (current && !Object.hasOwn(restored, current)) restored[current] = value
  }
  return restored
}

export async function addNativeSelectionAliases(data: ViktraniumData): Promise<ViktraniumData> {
  const itemById = new Map(data.indexes.itemById)
  const augmentById = new Map(data.indexes.augmentById)
  await Promise.all(
    data.items.map(async (item) => {
      const title = item.name.replace(/^(Legendary )?Calamitous Sceptre$/, '$1Calamitous Burning Sceptre')
      itemById.set(await historicalId('item', title), item)
      const previous =
        previousTypes[title] ?? item.slots.map((slot) => slot.augmentType).sort((a, b) => a.localeCompare(b, 'en'))
      const slots = new Map<string, string>()
      await Promise.all(
        item.slots.map(async (slot) => {
          const order = previous.indexOf(slot.augmentType)
          if (order >= 0) slots.set(await historicalId('slot', title, order, slot.augmentType), slot.id)
        })
      )
      historicalSlots.set(item, slots)
    })
  )
  const historicalAugments = await Promise.all(
    data.augments.map(
      async (augment) =>
        [await historicalId('augment', '', augment.name, augment.augmentType, augment.minimumLevel), augment] as const
    )
  )
  for (const [id, augment] of historicalAugments) {
    if (!augmentById.has(id)) augmentById.set(id, augment)
  }
  for (const [previous, current] of Object.entries(changedAugments)) {
    const augment = augmentById.get(current)
    if (augment) augmentById.set(previous, augment)
  }
  return { ...data, indexes: { ...data.indexes, itemById, augmentById } }
}
