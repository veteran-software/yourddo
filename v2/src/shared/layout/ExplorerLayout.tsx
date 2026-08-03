import type { ReactNode } from 'react'
import ToolLayout from './ToolLayout'

interface ExplorerLayoutProps {
  children: ReactNode
}

const ExplorerLayout = ({ children }: ExplorerLayoutProps) => <ToolLayout>{children}</ToolLayout>

export default ExplorerLayout
