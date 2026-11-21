import * as z from 'zod'
import { EnhancementSchema } from './enhancement'

export const SetBonusSchema = z.object({
  name: z.string().trim(),
  enhancements: z.array(EnhancementSchema).optional(),
  numPiecesEquipped: z.number().optional()
})
