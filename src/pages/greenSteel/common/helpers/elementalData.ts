import { altarOfDevastation } from '../../../../data/altarOfDevastation.ts'
import { altarOfFecundity } from '../../../../data/altarOfFecundity.ts'
import { altarOfInvasion } from '../../../../data/altarOfInvasion.ts'
import { altarOfSubjugation } from '../../../../data/altarOfSubjugation.ts'
import type { CraftingIngredient } from '../../../../types/crafting.ts'

export interface ElementalList {
  name: string
  elements: string[]
}

export const baseElemental: ElementalList[] = [
  { name: 'Air', elements: ['Air', 'Air'] },
  { name: 'Earth', elements: ['Earth', 'Earth'] },
  { name: 'Fire', elements: ['Fire', 'Fire'] },
  { name: 'Water', elements: ['Water', 'Water'] },
  { name: 'Negative Energy', elements: ['Negative Energy', 'Negative Energy'] },
  { name: 'Positive Energy', elements: ['Positive Energy', 'Positive Energy'] }
] as ElementalList[]

export const subjugationElementalList: ElementalList[] = [
  ...baseElemental,
  { name: 'Ash', elements: ['Fire', 'Negative Energy'] },
  { name: 'Ash', elements: ['Negative Energy', 'Fire'] },
  { name: 'Dust', elements: ['Earth', 'Negative Energy'] },
  { name: 'Dust', elements: ['Negative Energy', 'Earth'] },
  { name: 'Ice', elements: ['Air', 'Water'] },
  { name: 'Ice', elements: ['Water', 'Air'] },
  { name: 'Lightning', elements: ['Air', 'Positive Energy'] },
  { name: 'Lightning', elements: ['Positive Energy', 'Air'] },
  { name: 'Magma', elements: ['Earth', 'Fire'] },
  { name: 'Magma', elements: ['Fire', 'Earth'] },
  { name: 'Mineral', elements: ['Earth', 'Positive Energy'] },
  { name: 'Mineral', elements: ['Positive Energy', 'Earth'] },
  { name: 'Ooze', elements: ['Earth', 'Water'] },
  { name: 'Ooze', elements: ['Water', 'Earth'] },
  { name: 'Radiance', elements: ['Fire', 'Positive Energy'] },
  { name: 'Radiance', elements: ['Positive Energy', 'Fire'] },
  { name: 'Salt', elements: ['Water', 'Negative Energy'] },
  { name: 'Salt', elements: ['Negative Energy', 'Water'] },
  { name: 'Smoke', elements: ['Air', 'Fire'] },
  { name: 'Smoke', elements: ['Fire', 'Air'] },
  { name: 'Steam', elements: ['Water', 'Positive Energy'] },
  { name: 'Steam', elements: ['Positive Energy', 'Water'] },
  { name: 'Vacuum', elements: ['Air', 'Negative Energy'] },
  { name: 'Vacuum', elements: ['Negative Energy', 'Air'] },
  { name: 'Balance of Land and Sky', elements: ['Air', 'Earth'] },
  { name: 'Balance of Land and Sky', elements: ['Earth', 'Air'] },
  { name: 'Existential Stalemate', elements: ['Negative Energy', 'Positive Energy'] },
  { name: 'Existential Stalemate', elements: ['Positive Energy', 'Negative Energy'] },
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

export const allAltars: CraftingIngredient[] = [
  ...altarOfFecundity,
  ...altarOfInvasion,
  ...altarOfSubjugation,
  ...altarOfDevastation
]
