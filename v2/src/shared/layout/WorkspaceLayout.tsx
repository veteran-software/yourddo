import { Box, Button, Drawer, useMatches } from '@mantine/core'
import type { ReactNode } from 'react'
import { useId, useState } from 'react'

interface WorkspaceLayoutProps {
  children: ReactNode
  inspector?: ReactNode
  inspectorTitle?: ReactNode
  mobileInspectorOpened?: boolean
  onMobileInspectorClose?: () => void
  inspectorWidth?: string | number
}

const defaultInspectorWidth = '22rem'

const toCssSize = (size: string | number) => (typeof size === 'number' ? `${String(size)}px` : size)

const WorkspaceLayout = ({
  children,
  inspector,
  inspectorTitle,
  mobileInspectorOpened,
  onMobileInspectorClose,
  inspectorWidth = defaultInspectorWidth
}: WorkspaceLayoutProps) => {
  const desktop = useMatches({ base: false, lg: true })
  const inspectorTitleId = useId()
  const [desktopInspectorOpened, setDesktopInspectorOpened] = useState(false)
  const [internalMobileInspectorOpened, setInternalMobileInspectorOpened] = useState(false)
  const hasInspector = inspector !== undefined && inspector !== null
  const inspectorSize = toCssSize(inspectorWidth)
  const mobileInspectorIsControlled = mobileInspectorOpened !== undefined
  const mobileOpened = mobileInspectorOpened ?? internalMobileInspectorOpened
  const closeInspector = () => {
    if (desktop) {
      setDesktopInspectorOpened(false)
    } else {
      setInternalMobileInspectorOpened(false)
      onMobileInspectorClose?.()
    }
  }
  const toggleInspector = () => {
    if (desktop) {
      setDesktopInspectorOpened((opened) => !opened)
    } else if (!mobileInspectorIsControlled) {
      setInternalMobileInspectorOpened((opened) => !opened)
    }
  }

  return (
    <Box
      data-testid='workspace-layout'
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr)',
        height: 'calc(100dvh - var(--app-shell-header-height, 56px))',
        minHeight: 0,
        overflow: 'hidden'
      }}
    >
      <Box
        component='section'
        aria-label='Workspace'
        data-testid='workspace-main'
        style={{
          minWidth: 0,
          minHeight: 0,
          overflow: 'auto'
        }}
      >
        {hasInspector ? (
          <Button
            size='compact-sm'
            variant='subtle'
            aria-expanded={desktop ? desktopInspectorOpened : mobileOpened}
            onClick={toggleInspector}
            mb='md'
          >
            {desktop
              ? desktopInspectorOpened
                ? 'Close inspector'
                : 'Open inspector'
              : mobileOpened
                ? 'Close inspector'
                : 'Open inspector'}
          </Button>
        ) : null}
        {children}
      </Box>

      {hasInspector ? (
        <Drawer
          opened={desktop ? desktopInspectorOpened : mobileOpened}
          onClose={closeInspector}
          title={inspectorTitle ?? 'Inspector'}
          position='right'
          size={inspectorSize}
          closeButtonProps={{ 'aria-label': 'Close inspector' }}
        >
          <Box
            component='aside'
            aria-label={inspectorTitle ? undefined : 'Inspector'}
            aria-labelledby={inspectorTitle ? inspectorTitleId : undefined}
            data-testid='workspace-inspector'
            style={{ minWidth: 0, minHeight: 0, overflow: 'auto' }}
          >
            {inspectorTitle ? (
              <Box component='h2' id={inspectorTitleId} m={0} p='md' fz='md'>
                {inspectorTitle}
              </Box>
            ) : null}
            {inspector}
          </Box>
        </Drawer>
      ) : null}
    </Box>
  )
}

export type { WorkspaceLayoutProps }
export default WorkspaceLayout
