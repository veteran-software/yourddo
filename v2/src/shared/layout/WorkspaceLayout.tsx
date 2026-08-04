import { ActionIcon, Box, Divider, Drawer, ScrollArea, Stack, Tooltip, UnstyledButton, useMatches } from '@mantine/core'
import type { ReactNode } from 'react'
import { useEffect, useId, useRef, useState } from 'react'

interface WorkspaceTool {
  id: string
  label: string
  icon: ReactNode
  content: ReactNode
}

interface WorkspaceLayoutProps {
  children: ReactNode
  tools?: readonly WorkspaceTool[]
  defaultActiveToolId?: string
  toolPanelWidth?: string | number
  // Temporary adapter for the unmigrated Dinosaur Bone consumer.
  inspector?: ReactNode
  inspectorTitle?: string
}

const defaultToolPanelWidth = '22rem'
const collapsedRailWidth = '3rem'
const expandedRailWidth = '11rem'

const toCssSize = (size: string | number) => (typeof size === 'number' ? `${String(size)}px` : size)

const WorkspaceLayout = ({
  children,
  tools,
  defaultActiveToolId,
  toolPanelWidth = defaultToolPanelWidth,
  inspector,
  inspectorTitle
}: WorkspaceLayoutProps) => {
  const desktop = useMatches({ base: false, lg: true }, { getInitialValueInEffect: false })
  const layoutId = useId()
  const [activeToolId, setActiveToolId] = useState(defaultActiveToolId)
  const [railExpanded, setRailExpanded] = useState(false)
  const mobileOpeningTrigger = useRef<HTMLButtonElement | null>(null)
  const legacyInspector = tools === undefined && inspector !== undefined

  // The first matching tool is the deterministic winner when IDs are duplicated.
  const resolvedTools =
    tools ??
    (inspector !== undefined
      ? [
          {
            id: 'legacy-inspector',
            label: inspectorTitle ?? 'Inspector',
            icon: (
              <Box component='span' aria-hidden>
                ⚙
              </Box>
            ),
            content: inspector
          }
        ]
      : [])
  const activeTool = activeToolId ? resolvedTools.find((tool) => tool.id === activeToolId) : undefined
  const panelId = `${layoutId}-tool-panel`
  const panelWidth = toCssSize(toolPanelWidth)

  // Keep the local ID in sync when a parent removes the active tool.
  useEffect(() => {
    if (activeToolId && !activeTool) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveToolId(undefined)
    }
  }, [activeTool, activeToolId])

  useEffect(() => {
    if (!activeTool && mobileOpeningTrigger.current) {
      mobileOpeningTrigger.current.focus()
      mobileOpeningTrigger.current = null
    }
  }, [activeTool])

  const selectTool = (toolId: string, trigger?: HTMLButtonElement) => {
    if (!desktop && !activeToolId) mobileOpeningTrigger.current = trigger ?? null
    setActiveToolId((currentId) => (currentId === toolId ? (desktop ? undefined : currentId) : toolId))
  }

  const closeTool = () => {
    setActiveToolId(undefined)
  }

  const toolButton = (tool: WorkspaceTool, index: number, showLabel = railExpanded) => {
    const active = activeTool?.id === tool.id
    const button = (
      <UnstyledButton
        component='button'
        type='button'
        key={`${tool.id}-${String(index)}`}
        aria-label={legacyInspector ? (active ? 'Close inspector' : 'Open inspector') : tool.label}
        aria-pressed={active}
        aria-expanded={active}
        aria-controls={active ? panelId : undefined}
        data-testid={`workspace-tool-${String(index)}`}
        onClick={(event) => {
          selectTool(tool.id, event.currentTarget)
        }}
        style={(theme) => ({
          display: 'flex',
          alignItems: 'center',
          justifyContent: showLabel ? 'flex-start' : 'center',
          gap: theme.spacing.sm,
          minHeight: 36,
          minWidth: 36,
          width: '100%',
          borderRadius: theme.radius.sm,
          color: active ? 'var(--mantine-primary-color-filled)' : 'var(--mantine-color-text)',
          backgroundColor: active ? 'var(--mantine-primary-color-light)' : 'transparent',
          // overflow: 'hidden',
          whiteSpace: 'nowrap',
          padding: showLabel ? '6px 8px' : 6
        })}
        styles={{
          root: {
            '&:hover': { backgroundColor: 'var(--mantine-color-default-hover)' },
            '&:focus-visible': {
              outline: '2px solid var(--mantine-primary-color-filled)',
              outlineOffset: 2
            }
          }
        }}
      >
        <Box component='span' aria-hidden style={{ display: 'inline-flex', flex: '0 0 auto' }}>
          {tool.icon}
        </Box>
        {showLabel ? (
          <Box component='span' aria-hidden>
            {tool.label}
          </Box>
        ) : null}
      </UnstyledButton>
    )

    return showLabel ? (
      button
    ) : (
      <Tooltip key={`tooltip-${tool.id}-${String(index)}`} label={tool.label} position='left'>
        {button}
      </Tooltip>
    )
  }

  const desktopTools = desktop && resolvedTools.length > 0
  const mobileTools = !desktop && resolvedTools.length > 0

  return (
    <Box
      data-testid='workspace-layout'
      style={{
        display: 'grid',
        gridTemplateColumns: desktopTools
          ? `minmax(0, 1fr) ${activeTool ? panelWidth : '0px'} ${railExpanded ? expandedRailWidth : collapsedRailWidth}`
          : 'minmax(0, 1fr)',
        height: 'calc(100dvh - var(--app-shell-header-height, 56px))',
        minHeight: 0,
        overflow: 'hidden'
      }}
    >
      <Box
        component='section'
        aria-label='Workspace'
        data-testid='workspace-main'
        style={{ gridRow: 1, gridColumn: 1, minWidth: 0, minHeight: 0, overflow: 'auto' }}
      >
        {mobileTools ? (
          <ScrollArea type='auto' offsetScrollbars scrollbarSize={6} data-testid='workspace-mobile-tools'>
            <Box
              component='nav'
              aria-label='Workspace tools'
              style={{ display: 'flex', gap: 4, minWidth: 'max-content' }}
              p='xs'
            >
              {resolvedTools.map((tool, index) => toolButton(tool, index, true))}
            </Box>
          </ScrollArea>
        ) : null}
        {children}
      </Box>

      {desktopTools && activeTool ? (
        <Box
          component='aside'
          aria-label={activeTool.label}
          data-testid='workspace-tool-panel'
          style={{
            gridRow: 1,
            gridColumn: 2,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            minHeight: 0,
            overflow: 'hidden'
          }}
        >
          <Box p='xs' style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <Box component='span' aria-hidden>
              {activeTool.icon}
            </Box>
            <Box
              component='h2'
              m={0}
              style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {activeTool.label}
            </Box>
            <ActionIcon variant='subtle' size='sm' aria-label={`Close ${activeTool.label}`} onClick={closeTool}>
              ×
            </ActionIcon>
          </Box>
          <Divider />
          <Box
            data-testid='workspace-tool-panel-content'
            style={{ minWidth: 0, minHeight: 0, flex: 1, overflow: 'auto' }}
          >
            {activeTool.content}
          </Box>
        </Box>
      ) : null}

      {desktopTools ? (
        <Box
          component='nav'
          aria-label='Workspace tools'
          data-testid='workspace-tool-rail'
          style={{
            gridRow: 1,
            gridColumn: 3,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            overflow: 'hidden',
            borderLeft: '1px solid var(--mantine-color-default-border)'
          }}
          p={4}
        >
          <Box style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}>
            <Stack gap={2}>{resolvedTools.map((tool, index) => toolButton(tool, index))}</Stack>
          </Box>
          <Divider my={4} />
          <Tooltip
            label={railExpanded ? 'Collapse workspace tool labels' : 'Expand workspace tool labels'}
            position='left'
          >
            <ActionIcon
              variant='subtle'
              mx='auto'
              aria-label={railExpanded ? 'Collapse workspace tool labels' : 'Expand workspace tool labels'}
              aria-expanded={railExpanded}
              onClick={() => {
                setRailExpanded((expanded) => !expanded)
              }}
            >
              {railExpanded ? '»' : '«'}
            </ActionIcon>
          </Tooltip>
        </Box>
      ) : null}

      {mobileTools ? (
        <Drawer
          opened={Boolean(activeTool)}
          onClose={closeTool}
          title={activeTool?.label}
          position='right'
          size={panelWidth}
          closeButtonProps={{ 'aria-label': 'Close workspace tool' }}
        >
          {activeTool ? (
            <Box
              data-testid='workspace-mobile-tool-content'
              style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', overflow: 'hidden' }}
            >
              <ScrollArea type='auto' offsetScrollbars scrollbarSize={6} mb='sm'>
                <Box
                  component='nav'
                  aria-label='Workspace tools'
                  style={{ display: 'flex', gap: 4, minWidth: 'max-content' }}
                >
                  {resolvedTools.map((tool, index) => toolButton(tool, index, true))}
                </Box>
              </ScrollArea>
              <Box style={{ minHeight: 0, overflow: 'auto', flex: 1 }}>{activeTool.content}</Box>
            </Box>
          ) : null}
        </Drawer>
      ) : null}
    </Box>
  )
}

export type { WorkspaceLayoutProps, WorkspaceTool }
export default WorkspaceLayout
