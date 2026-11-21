import * as z from 'zod'

export const GearAugmentSlotSchema = z.object({
  augmentType: z.string().trim(),
  name: z.string().trim().optional()
})
