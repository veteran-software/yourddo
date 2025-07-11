const armor: string[] = ['Docent', 'Heavy Armor', 'Light Armor', 'Medium Armor', 'Outfit', 'Robe'] as const

const shields: string[] = ['Buckler', 'Large Shield', 'Orb', 'Small Shield', 'Tower Shield'] as const

const clothing: string[] = ['Belt', 'Boots', 'Cloak', 'Helmet', 'Gloves'] as const

const jewelry: string[] = ['Bracers', 'Goggles', 'Necklace', 'Ring', 'Trinket'] as const

export const armorList = armor
export const shieldList = shields

export const clothingList = clothing
export const jewelryList = jewelry

export const accessoryList = [...clothing, ...jewelry]
