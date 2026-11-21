import * as z from 'zod'
import { MAX_CHARACTER_LEVEL } from '../utils/constants'
import { GearItemSchema } from './gearItem'
import { PetStateSchema } from './petState'
import { SlottedPropertiesSchema } from './slottedProperties'

export const GearSetupSchema = SlottedPropertiesSchema.extend({
  id: z.string().trim(),
  name: z.string().trim(),
  minLevel: z.int().min(1).max(MAX_CHARACTER_LEVEL),
  maxLevel: z.int().min(1).max(MAX_CHARACTER_LEVEL),
  classes: z.array(z.string().trim().nullable()),
  weaponFilters: z.array(z.string().trim()),
  armorFilters: z.array(z.string().trim()),
  shieldFilters: z.array(z.string().trim()),
  allowMetalWithDruid: z.boolean(),
  slots: z.record(z.string(), GearItemSchema.nullable()),
  artificerPet: PetStateSchema,
  druidPet: PetStateSchema
})
