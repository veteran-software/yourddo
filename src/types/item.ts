import type { Binding, Cost } from './core.ts'

export interface Trinket {
  name: string
  equipsTo: 'Trinket'
  description: string
  binding?: Binding
  minimumLevel?: number
  durability?: number
  material?: string
  hardness?: number
  baseValue?: Cost
  weight?: number
  foundIn: string[]
}
