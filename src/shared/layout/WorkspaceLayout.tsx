import {
  ActionIcon,
  Box,
  Button,
  Divider,
  Drawer,
  Flex,
  Group,
  ScrollArea,
  Stack,
  Text,
  Tooltip,
  useMatches
} from '@mantine/core'
import { useReducedMotion } from '@mantine/hooks'
import { IconChevronsLeft, IconChevronsRight } from '@tabler/icons-react'
import type { CSSProperties, ReactNode } from 'react'
import { useEffect, useId, useRef, useState } from 'react'
import styles from './workspace.module.css'

type WorkspaceTool = {
  id: string
  label: string
  icon: ReactNode
} & ({ content: ReactNode } | { renderContent: (revealWorkspace: () => void) => ReactNode })

interface WorkspaceLayoutProps {
  children: ReactNode
  scrollMain?: boolean
  tools?: readonly WorkspaceTool[]
  defaultActiveToolId?: string
  toolPanelWidth?: string | number
  // Temporary adapter for the unmigrated Dinosaur Bone consumer.
  inspector?: ReactNode
  inspectorTitle?: string
}

const defaultToolPanelWidth = '24.2rem'
const collapsedRailWidth = '3rem'
const expandedRailWidth = '11rem'
const toolPanelTransitionDuration = 220

const toCssSize = (size: string | number) => (typeof size === 'number' ? `${String(size)}px` : size)

function panelStyle(open: boolean, reduceMotion: boolean): CSSProperties {
  const duration = String(toolPanelTransitionDuration) + 'ms'
  const visibility = open ? 'visibility 0s' : 'visibility 0s linear ' + duration
  return {
    opacity: Number(open),
    overflow: 'hidden',
    pointerEvents: open ? 'auto' : 'none',
    transform: open ? 'translateX(0)' : 'translateX(0.5rem)',
    transition: reduceMotion
      ? 'none'
      : `width ${duration} ease, opacity ${duration} ease, transform ${duration} ease, ${visibility}`,
    visibility: open ? 'visible' : 'hidden'
  }
}
const WorkspaceLayout = ({
  children,
  scrollMain = true,
  tools,
  defaultActiveToolId,
  toolPanelWidth = defaultToolPanelWidth,
  inspector,
  inspectorTitle
}: WorkspaceLayoutProps) => {
  const desktop = useMatches({ base: false, lg: true }, { getInitialValueInEffect: false })
  const reduceMotion = useReducedMotion()
  const layoutId = useId()
  const [activeToolId, setActiveToolId] = useState(defaultActiveToolId)
  const [panelToolId, setPanelToolId] = useState(defaultActiveToolId)
  const [railExpanded, setRailExpanded] = useState(false)
  const mobileOpeningTrigger = useRef<HTMLButtonElement | null>(null)
  const legacyInspector = tools === undefined && inspector !== undefined

  // The first matching tool is the deterministic winner when IDs are duplicated.
  const resolvedTools =
    tools?.toSorted((a, b) => Number(a.id === 'sharing') - Number(b.id === 'sharing')) ??
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
  const findTool = (id: string | undefined) => (id ? resolvedTools.find((tool) => tool.id === id) : undefined)
  const activeTool = findTool(activeToolId)
  // Retain the last tool while its panel closes so the content moves with the panel.
  const panelTool = findTool(panelToolId)
  const panelId = `${layoutId}-tool-panel`
  const panelWidth = toCssSize(toolPanelWidth)
  const railLabel = railExpanded ? 'Collapse workspace tool labels' : 'Expand workspace tool labels'
  const railWidth = railExpanded ? expandedRailWidth : collapsedRailWidth

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
    if (activeToolId === toolId) {
      if (desktop) setActiveToolId(undefined)
      return
    }

    setPanelToolId(toolId)
    setActiveToolId(toolId)
  }

  const closeTool = () => {
    setActiveToolId(undefined)
  }

  // Navigation inside a tool reveals the main workspace. Desktop summaries can stay alongside it.
  const revealWorkspace = () => {
    if (!desktop) {
      mobileOpeningTrigger.current = null
      closeTool()
    }
  }
  const renderContent = (tool: WorkspaceTool) =>
    'renderContent' in tool ? tool.renderContent(revealWorkspace) : tool.content

  const toolButton = (tool: WorkspaceTool, index: number, showLabel = railExpanded) => {
    const active = activeTool?.id === tool.id
    const inspectorLabel = active ? 'Close inspector' : 'Open inspector'
    const label = legacyInspector ? inspectorLabel : tool.label
    const select = (trigger: HTMLButtonElement) => {
      selectTool(tool.id, trigger)
    }

    if (showLabel) {
      return (
        <Button
          key={`${tool.id}-${String(index)}`}
          type='button'
          variant={active ? 'light' : 'subtle'}
          color={active ? undefined : 'gray'}
          leftSection={tool.icon}
          justify='flex-start'
          fullWidth={desktop}
          h={36}
          px='xs'
          radius='sm'
          style={{ minWidth: 0, overflow: 'hidden' }}
          styles={{
            inner: { minWidth: 0 },
            label: { minWidth: 0, display: 'flex', alignItems: 'center' },
            section: { width: '1.5rem', minWidth: '1.5rem', flex: '0 0 1.5rem', justifyContent: 'center' }
          }}
          aria-label={label}
          aria-pressed={active}
          aria-expanded={active}
          aria-controls={active ? panelId : undefined}
          data-testid={`workspace-tool-${String(index)}`}
          onClick={(event) => {
            select(event.currentTarget)
          }}
        >
          <Box
            component='span'
            w='100%'
            style={{
              display: 'block',
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {tool.label}
          </Box>
        </Button>
      )
    }

    return (
      <Tooltip key={`tooltip-${tool.id}-${String(index)}`} label={tool.label} position='left'>
        <ActionIcon
          type='button'
          variant={active ? 'light' : 'subtle'}
          color={active ? undefined : 'gray'}
          size={36}
          mx='auto'
          radius='sm'
          aria-label={label}
          aria-pressed={active}
          aria-expanded={active}
          aria-controls={active ? panelId : undefined}
          data-testid={`workspace-tool-${String(index)}`}
          onClick={(event) => {
            select(event.currentTarget)
          }}
        >
          {tool.icon}
        </ActionIcon>
      </Tooltip>
    )
  }

  const desktopTools = desktop && resolvedTools.length > 0
  const mobileTools = !desktop && resolvedTools.length > 0

  const mobileNavigation = mobileTools && (
    <ScrollArea
      style={{ flexShrink: 0 }}
      type='auto'
      offsetScrollbars
      scrollbarSize={6}
      data-testid='workspace-mobile-tools'
    >
      <Group
        component='nav'
        aria-label='Workspace tools'
        wrap='nowrap'
        gap={4}
        miw='max-content'
        p='xs'
        bg='var(--app-nav)'
      >
        {resolvedTools.map((tool, index) => toolButton(tool, index, true))}
      </Group>
    </ScrollArea>
  )

  return (
    <Flex
      className={styles.plannerLayout}
      data-testid='workspace-layout'
      h='calc(100dvh - var(--app-shell-header-height, 56px))'
      mih={0}
      style={{ overflow: 'hidden' }}
    >
      <Box component='section' aria-label='Workspace' data-testid='workspace-main' flex={1} miw={0} mih={0}>
        {scrollMain ? (
          <ScrollArea h='100%' type='auto'>
            {mobileNavigation}
            {children}
          </ScrollArea>
        ) : (
          <Stack h='100%' gap={0}>
            {mobileNavigation}
            {children}
          </Stack>
        )}
      </Box>

      {desktopTools && (
        <Box
          component='aside'
          id={panelId}
          aria-label={activeTool?.label}
          aria-hidden={!activeTool}
          data-testid='workspace-tool-panel'
          w={activeTool ? panelWidth : 0}
          miw={0}
          mih={0}
          flex='0 0 auto'
          pos='relative'
          bg='var(--app-panel)'
          style={panelStyle(Boolean(activeTool), reduceMotion)}
        >
          {panelTool && (
            <>
              <Divider orientation='vertical' pos='absolute' left={0} top={0} bottom={0} />
              <Stack w={panelWidth} h='100%' gap={0}>
                <Group px='md' py='xs' gap='sm' wrap='nowrap' miw={0}>
                  {panelTool.icon}
                  <Text component='h2' m={0} flex={1} miw={0} fz='h2' lh='h2' fw={700} truncate>
                    {panelTool.label}
                  </Text>
                  <Tooltip label={`Close ${panelTool.label}`} position='left'>
                    <ActionIcon
                      variant='subtle'
                      color='gray'
                      size={36}
                      radius='sm'
                      aria-label={`Close ${panelTool.label}`}
                      onClick={closeTool}
                    >
                      ×
                    </ActionIcon>
                  </Tooltip>
                </Group>
                <Divider />
                <ScrollArea data-testid='workspace-tool-panel-content' type='auto' flex={1} miw={0} mih={0}>
                  {renderContent(panelTool)}
                </ScrollArea>
              </Stack>
            </>
          )}
        </Box>
      )}

      {desktopTools && (
        <Flex
          component='nav'
          aria-label='Workspace tools'
          data-testid='workspace-tool-rail'
          bg='var(--app-nav)'
          mih={0}
          style={{
            width: railWidth,
            minWidth: railWidth,
            maxWidth: railWidth,
            flex: `0 0 ${railWidth}`,
            overflow: 'hidden'
          }}
        >
          <Divider orientation='vertical' />
          <Stack gap={0} flex={1} miw={0} mih={0} p={4}>
            <ScrollArea type='auto' scrollbars='y' flex={1} w='100%' miw={0} mih={0}>
              <Stack gap='xs' miw={0}>
                {resolvedTools.map((tool, index) => toolButton(tool, index))}
              </Stack>
            </ScrollArea>
            <Divider my={4} />
            <Tooltip label={railLabel} position='left'>
              <ActionIcon
                variant='subtle'
                color='gray'
                size={36}
                mx='auto'
                radius='sm'
                aria-label={railLabel}
                aria-expanded={railExpanded}
                onClick={() => {
                  setRailExpanded((expanded) => !expanded)
                }}
              >
                {railExpanded ? <IconChevronsRight stroke={2} /> : <IconChevronsLeft stroke={2} />}
              </ActionIcon>
            </Tooltip>
          </Stack>
        </Flex>
      )}

      {mobileTools && (
        <Drawer
          opened={Boolean(activeTool)}
          onClose={closeTool}
          returnFocus={false}
          title={activeTool?.label}
          position='right'
          size={`min(${panelWidth}, 100vw)`}
          styles={{ body: { padding: 0 } }}
          closeButtonProps={{ 'aria-label': 'Close workspace tool' }}
        >
          {activeTool && (
            <Stack data-testid='workspace-mobile-tool-content' gap={0} mih='100%'>
              <ScrollArea type='auto' offsetScrollbars scrollbarSize={6}>
                <Group
                  component='nav'
                  aria-label='Workspace tools'
                  wrap='nowrap'
                  gap='xs'
                  px='md'
                  py='xs'
                  miw='max-content'
                >
                  {resolvedTools.map((tool, index) => toolButton(tool, index, true))}
                </Group>
              </ScrollArea>
              <ScrollArea type='auto' flex={1} mih={0}>
                {renderContent(activeTool)}
              </ScrollArea>
            </Stack>
          )}
        </Drawer>
      )}
    </Flex>
  )
}

export type { WorkspaceLayoutProps, WorkspaceTool }
export default WorkspaceLayout
