import { useLocalStorage } from '@mantine/hooks'
import { createContext } from 'react'

export const BackupOnly = createContext(false)

export function useSlotView(workspace: string) {
  return useLocalStorage<'list' | 'grid'>({ key: 'yourddo:' + workspace + ':slot-view', defaultValue: 'list' })
}
