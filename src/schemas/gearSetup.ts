import * as z from 'zod'
import { GearItemSchema } from './gearItem'
import { PetStateSchema } from './petState'
import { SlottedPropertiesSchema } from './slottedProperties'

export const GearSetupSchema = SlottedPropertiesSchema.extend({
  id: z.string().trim(),
  name: z.string().trim(),
  minLevel: z.int().min(1).max(34),
  maxLevel: z.int().min(1).max(34),
  classes: z.array(z.string().trim().nullable()),
  weaponFilters: z.array(z.string().trim()),
  armorFilters: z.array(z.string().trim()),
  shieldFilters: z.array(z.string().trim()),
  allowMetalWithDruid: z.boolean(),
  slots: z.record(z.string(), GearItemSchema.nullable()),
  artificerPet: PetStateSchema,
  druidPet: PetStateSchema
})
