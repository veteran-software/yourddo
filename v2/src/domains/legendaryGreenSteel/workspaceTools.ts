import { IconFileInfo, IconListCheck, IconListDetails, IconTools } from '@tabler/icons-react'

// Keep these definitions aligned with the HGS Workspace rail.
export const lgsWorkspaceToolDefinitions = [
  { id: 'tools', label: 'Tools', Icon: IconTools },
  { id: 'summary', label: 'Build Summary', Icon: IconFileInfo },
  { id: 'ingredients', label: 'Ingredients', Icon: IconListCheck },
  { id: 'breakdown', label: 'Crafting Breakdown', Icon: IconListDetails }
] as const
