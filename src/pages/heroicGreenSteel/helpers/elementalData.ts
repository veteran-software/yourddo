export interface ElementalList {
  name: string
  elements: string[]
}

export const baseElemental: ElementalList[] = [
  {
    name: 'Air',
    elements: ['Air', 'Air']
  },
  { name: 'Earth', elements: ['Earth', 'Earth'] },
  { name: 'Fire', elements: ['Fire', 'Fire'] },
  { name: 'Water', elements: ['Water', 'Water'] },
  { name: 'Negative Energy', elements: ['Negative', 'Negative'] },
  { name: 'Positive Energy', elements: ['Positive', 'Positive'] }
] as ElementalList[]

export const fullElemental: ElementalList[] = [
  ...baseElemental,
  { name: 'Ash', elements: ['Ash', 'Fire'] },
  { name: 'Dust', elements: ['Dust', 'Earth'] },
  { name: 'Ice', elements: ['Freezing Ice', 'Air'] },
  { name: 'Lightning', elements: ['Lightning Strike', 'Air'] },
  { name: 'Magma', elements: ['Magma', 'Fire'] },
  { name: 'Mineral', elements: ['Mineral', 'Earth'] },
  { name: 'Ooze', elements: ['Ooze', 'Water'] },
  { name: 'Radiance', elements: ['Radiance', 'Fire'] },
  { name: 'Corrosive Salt', elements: ['Corrosive Salt', 'Water'] },
  { name: 'Smoke Screen', elements: ['Smoke Screen', 'Fire'] },
  { name: 'Steam', elements: ['Steam', 'Water'] },
  { name: 'Vacuum', elements: ['Vacuum', 'Air'] },
  { name: 'Balance of Land and Sky', elements: ['Tempered', 'Earth'] },
  {
    name: 'Existential Stalemate',
    elements: ['Existential Stalemate', 'Positive Energy']
  },
  { name: 'Tempered', elements: ['Balance of Land and Sky', 'Water'] }
] as ElementalList[]
