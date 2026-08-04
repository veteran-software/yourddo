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
const toolPanelTransitionDuration = 220

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
  const reduceMotion = useReducedMotion()
  const layoutId = useId()
  const [activeToolId, setActiveToolId] = useState(defaultActiveToolId)
  const [panelToolId, setPanelToolId] = useState(defaultActiveToolId)
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
  // Retain the last tool while its panel closes so the content moves with the panel.
  const panelTool = panelToolId ? resolvedTools.find((tool) => tool.id === panelToolId) : undefined
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

  const toolButton = (tool: WorkspaceTool, index: number, showLabel = railExpanded) => {
    const active = activeTool?.id === tool.id
    const label = legacyInspector ? (active ? 'Close inspector' : 'Open inspector') : tool.label
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
          fullWidth
          h={36}
          px='xs'
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
          {tool.label}
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

  return (
    <Flex data-testid='workspace-layout' h='calc(100dvh - var(--app-shell-header-height, 56px))' mih={0}>
      <Box component='section' aria-label='Workspace' data-testid='workspace-main' flex={1} miw={0} mih={0}>
        <ScrollArea h='100%' type='auto'>
          {mobileTools ? (
            <ScrollArea type='auto' offsetScrollbars scrollbarSize={6} data-testid='workspace-mobile-tools'>
              <Group component='nav' aria-label='Workspace tools' wrap='nowrap' gap={4} miw='max-content' p='xs'>
                {resolvedTools.map((tool, index) => toolButton(tool, index, true))}
              </Group>
            </ScrollArea>
          ) : null}
          {children}
        </ScrollArea>
      </Box>

      {desktopTools ? (
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
          style={{
            opacity: activeTool ? 1 : 0,
            overflow: 'hidden',
            pointerEvents: activeTool ? 'auto' : 'none',
            transform: activeTool ? 'translateX(0)' : 'translateX(0.5rem)',
            transition: reduceMotion
              ? 'none'
              : activeTool
                ? `width ${String(toolPanelTransitionDuration)}ms ease, opacity ${String(toolPanelTransitionDuration)}ms ease, transform ${String(toolPanelTransitionDuration)}ms ease, visibility 0s`
                : `width ${String(toolPanelTransitionDuration)}ms ease, opacity ${String(toolPanelTransitionDuration)}ms ease, transform ${String(toolPanelTransitionDuration)}ms ease, visibility 0s linear ${String(toolPanelTransitionDuration)}ms`,
            visibility: activeTool ? 'visible' : 'hidden'
          }}
        >
          {panelTool ? (
            <>
              <Divider orientation='vertical' pos='absolute' left={0} top={0} bottom={0} />
              <Stack w={panelWidth} h='100%' gap={0}>
                <Group p='xs' gap={8} wrap='nowrap' miw={0}>
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
                  {panelTool.content}
                </ScrollArea>
              </Stack>
            </>
          ) : null}
        </Box>
      ) : null}

      {desktopTools ? (
        <Flex
          component='nav'
          aria-label='Workspace tools'
          data-testid='workspace-tool-rail'
          w={railExpanded ? expandedRailWidth : collapsedRailWidth}
          mih={0}
          flex='0 0 auto'
        >
          <Divider orientation='vertical' />
          <Stack gap={0} flex={1} mih={0} p={4}>
            <ScrollArea type='auto' scrollbars='y' flex={1} mih={0}>
              <Stack gap={2}>{resolvedTools.map((tool, index) => toolButton(tool, index))}</Stack>
            </ScrollArea>
            <Divider my={4} />
            <Tooltip
              label={railExpanded ? 'Collapse workspace tool labels' : 'Expand workspace tool labels'}
              position='left'
            >
              <ActionIcon
                variant='subtle'
                color='gray'
                size={36}
                mx='auto'
                radius='sm'
                aria-label={railExpanded ? 'Collapse workspace tool labels' : 'Expand workspace tool labels'}
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
            <Stack data-testid='workspace-mobile-tool-content' gap={0} mih='100%'>
              <ScrollArea type='auto' offsetScrollbars scrollbarSize={6} mb='sm'>
                <Group component='nav' aria-label='Workspace tools' wrap='nowrap' gap={4} miw='max-content'>
                  {resolvedTools.map((tool, index) => toolButton(tool, index, true))}
                </Group>
              </ScrollArea>
              <ScrollArea type='auto' flex={1} mih={0}>
                {activeTool.content}
              </ScrollArea>
            </Stack>
          ) : null}
        </Drawer>
      ) : null}
    </Flex>
  )
}

export type { WorkspaceLayoutProps, WorkspaceTool }
export default WorkspaceLayout
