import { SAVE_FILE_VERSION, SaveFileSchema } from '../../schemas'
import type { GearSetup } from './types'

export const exportSetupsToJson = (setups: GearSetup[]): void => {
  const payload = {
    version: SAVE_FILE_VERSION,
    exportedAt: new Date().toISOString(),
    setups
  }

  const validation = SaveFileSchema.safeParse(payload)
  if (!validation.success) {
    console.error('Export validation error:', validation.error)
    throw new Error('Failed to save: current gear data failed validation.')
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'gear-planner-save.json'
  anchor.click()
  URL.revokeObjectURL(url)
}

export const importSetupsFromJson = async (file: File): Promise<GearSetup[]> => {
  const text = await file.text()
  const result = SaveFileSchema.safeParse(JSON.parse(text) as unknown)
  if (!result.success) {
    console.error('Import validation error:', result.error)
    throw new Error('The selected file is not a valid gear planner save file.')
  }
  return result.data.setups as GearSetup[]
}
