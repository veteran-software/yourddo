export interface ElementalList {
  name: string
  elements: string[]
}

export const baseElemental: ElementalList[] = [
  { name: 'Air', elements: ['Air', 'Air'] },
  { name: 'Earth', elements: ['Earth', 'Earth'] },
  { name: 'Fire', elements: ['Fire', 'Fire'] },
  { name: 'Water', elements: ['Water', 'Water'] },
  { name: 'Negative', elements: ['Negative', 'Negative'] },
  { name: 'Positive', elements: ['Positive', 'Positive'] }
] as ElementalList[]

export const subjugationElementalList: ElementalList[] = [
  ...baseElemental,
  { name: 'Ash', elements: ['Fire', 'Negative'] },
  { name: 'Ash', elements: ['Negative', 'Fire'] },
  { name: 'Dust', elements: ['Earth', 'Negative'] },
  { name: 'Dust', elements: ['Negative', 'Earth'] },
  { name: 'Ice', elements: ['Air', 'Water'] },
  { name: 'Ice', elements: ['Water', 'Air'] },
  { name: 'Lightning', elements: ['Air', 'Positive'] },
  { name: 'Lightning', elements: ['Positive', 'Air'] },
  { name: 'Magma', elements: ['Earth', 'Fire'] },
  { name: 'Magma', elements: ['Fire', 'Earth'] },
  { name: 'Mineral', elements: ['Earth', 'Positive'] },
  { name: 'Mineral', elements: ['Positive', 'Earth'] },
  { name: 'Ooze', elements: ['Earth', 'Water'] },
  { name: 'Ooze', elements: ['Water', 'Earth'] },
  { name: 'Radiance', elements: ['Fire', 'Positive'] },
  { name: 'Radiance', elements: ['Positive', 'Fire'] },
  { name: 'Salt', elements: ['Water', 'Negative'] },
  { name: 'Salt', elements: ['Negative', 'Water'] },
  { name: 'Smoke', elements: ['Air', 'Fire'] },
  { name: 'Smoke', elements: ['Fire', 'Air'] },
  { name: 'Steam', elements: ['Water', 'Positive'] },
  { name: 'Steam', elements: ['Positive', 'Water'] },
  { name: 'Vacuum', elements: ['Air', 'Negative'] },
  { name: 'Vacuum', elements: ['Negative', 'Air'] },
  { name: 'Balance of Land and Sky', elements: ['Air', 'Earth'] },
  { name: 'Balance of Land and Sky', elements: ['Earth', 'Air'] },
  { name: 'Existential Stalemate', elements: ['Negative', 'Positive'] },
  { name: 'Existential Stalemate', elements: ['Positive', 'Negative'] },
  { name: 'Tempered', elements: ['Fire', 'Water'] },
  { name: 'Tempered', elements: ['Water', 'Fire'] }
] as ElementalList[]

export const devastationElementalList: ElementalList[] = [
  ...baseElemental,
  { name: 'Ash', elements: ['Ash', 'Fire'] },
  { name: 'Dust', elements: ['Dust', 'Earth'] },
  { name: 'Ice', elements: ['Ice', 'Air'] },
  { name: 'Lightning', elements: ['Strike', 'Air'] },
  { name: 'Magma', elements: ['Magma', 'Fire'] },
  { name: 'Mineral', elements: ['Mineral', 'Earth'] },
  { name: 'Ooze', elements: ['Ooze', 'Water'] },
  { name: 'Radiance', elements: ['Radiance', 'Fire'] },
  { name: 'Corrosive Salt', elements: ['Salt', 'Water'] },
  { name: 'Smoke Screen', elements: ['Screen', 'Fire'] },
  { name: 'Steam', elements: ['Steam', 'Water'] },
  { name: 'Vacuum', elements: ['Vacuum', 'Air'] },
  { name: 'Balance of Land and Sky', elements: ['Tempered', 'Earth'] },
  { name: 'Existential Stalemate', elements: ['Existential Stalemate', 'Positive'] },
  { name: 'Tempered', elements: ['Balance of Land and Sky', 'Water'] }
] as ElementalList[]
