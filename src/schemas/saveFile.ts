import * as z from 'zod'
import { GearSetupSchema } from './gearSetup'

export const SAVE_FILE_VERSION = 1 as const

export const SaveFileV1Schema = z.object({
  version: z.literal(1),
  exportedAt: z.iso.datetime(),
  setups: z.array(GearSetupSchema).min(1)
})

export const SaveFileSchema = SaveFileV1Schema

export type SaveFile = z.infer<typeof SaveFileSchema>
