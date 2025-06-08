import type { Binding, Cost } from './core.ts'

export interface Ingredient {
  name: string
  type?: string
  description: string
  binding: Binding
  baseValue?: Cost
  weight?: number
  foundIn: string[]
  image?: string
  bagMaxStack?: number
  inventoryMaxStack?: number
}
