import { Box } from '@mantine/core'
import type { ReactNode } from 'react'

interface WorkspaceLayoutProps {
  children: ReactNode
}

const WorkspaceLayout = ({ children }: WorkspaceLayoutProps) => <Box h='calc(100dvh - 56px)'>{children}</Box>

export default WorkspaceLayout
