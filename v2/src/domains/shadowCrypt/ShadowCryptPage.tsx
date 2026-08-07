import {
  Accordion,
  Alert,
  Anchor,
  Badge,
  Box,
  Button,
  Group,
  Paper,
  Progress,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
  VisuallyHidden
} from '@mantine/core'
import {
  type Icon,
  IconArrowDown,
  IconArrowLeft,
  IconArrowRight,
  IconArrowUp,
  IconCheck,
  IconDoorExit
} from '@tabler/icons-react'
import { useState } from 'react'
import ToolLayout from '../../shared/layout/ToolLayout.tsx'
import {
  advanceRouteProgress,
  backRouteProgress,
  type Direction,
  getCurrentRouteStep,
  getDirectionLabel,
  getRouteStepCount,
  getRouteStepLabel,
  resetRouteProgress,
  type RouteDefinition,
  type RouteStep,
  setCompletedStepCount,
  SHADOW_CRYPT_ROUTES,
  type StartingRoomColor
} from './data.ts'

type RouteType = 'twelve-gear' | 'eight-gear-duo'
type RouteProgress = Record<string, number>

const COLOR_OPTIONS: { value: StartingRoomColor; label: string }[] = [
  { value: 'red', label: 'Red' },
  { value: 'green', label: 'Green' },
  { value: 'blue', label: 'Blue' }
]

const ROUTE_TYPE_OPTIONS: { value: RouteType; label: string }[] = [
  { value: 'twelve-gear', label: '12-Gear' },
  { value: 'eight-gear-duo', label: '8-Gear Duo' }
]

const DIRECTION_ICONS: Record<Direction, Icon> = {
  north: IconArrowUp,
  south: IconArrowDown,
  east: IconArrowRight,
  west: IconArrowLeft
}

const getRouteKey = (color: StartingRoomColor, routeType: RouteType, group?: 'groupA' | 'groupB'): string =>
  [color, routeType, group].filter(Boolean).join(':')

const getColorLabel = (color: StartingRoomColor): string => `${color[0].toUpperCase()}${color.slice(1)}`

const getStepIcon = (step: RouteStep): Icon =>
  step.type === 'dimension-door' ? IconDoorExit : DIRECTION_ICONS[step.direction]

const getStepAbbreviation = (step: RouteStep): string =>
  step.type === 'dimension-door' ? 'DD' : getDirectionLabel(step.direction).slice(0, 1)

interface RouteOverviewProps {
  route: RouteDefinition
  completedSteps: number
  routeName: string
}

const RouteOverview = ({ route, completedSteps, routeName }: RouteOverviewProps) => (
  <Stack gap='xs'>
    <Text size='sm' fw={600}>
      Route overview
    </Text>
    <Box role='list' aria-label={`${routeName} route overview`}>
      <SimpleGrid cols={{ base: 4, xs: 6, sm: 8, md: 10 }} spacing={6}>
        {route.steps.map((step, index) => {
          const completed = index < completedSteps
          const current = index === completedSteps
          const StepIcon = getStepIcon(step)
          const state = completed ? 'completed' : current ? 'current' : 'remaining'

          return (
            <Box
              key={`${String(index)}-${getStepAbbreviation(step)}`}
              role='listitem'
              aria-current={current ? 'step' : undefined}
              aria-label={`Step ${String(index + 1)}: ${getRouteStepLabel(step)}, ${state}`}
            >
              <Paper
                withBorder
                p={4}
                radius='sm'
                bg={current ? 'var(--mantine-primary-color-light)' : undefined}
                style={{ opacity: completed ? 0.7 : 1 }}
              >
                <Stack gap={0} align='center'>
                  <ThemeIcon
                    size={24}
                    radius='xl'
                    variant={current ? 'filled' : 'light'}
                    color={step.type === 'dimension-door' ? 'grape' : 'blue'}
                  >
                    {completed ? <IconCheck size={15} aria-hidden='true' /> : <StepIcon size={15} aria-hidden='true' />}
                  </ThemeIcon>
                  <Text size='xs' fw={700} aria-hidden='true'>
                    {completed ? 'Done' : current ? 'Now' : String(index + 1)}
                  </Text>
                  <Text size='xs' fw={600} aria-hidden='true'>
                    {getStepAbbreviation(step)}
                  </Text>
                </Stack>
              </Paper>
            </Box>
          )
        })}
      </SimpleGrid>
    </Box>
  </Stack>
)

interface RouteProgressPanelProps {
  title: string
  description?: string
  headingOrder: 2 | 3
  route: RouteDefinition
  completedSteps: number
  onAdvance: () => void
  onBack: () => void
  onReset: () => void
}

const RouteProgressPanel = ({
  title,
  description,
  headingOrder,
  route,
  completedSteps,
  onAdvance,
  onBack,
  onReset
}: RouteProgressPanelProps) => {
  const totalSteps = getRouteStepCount(route)
  const normalizedCompletedSteps = setCompletedStepCount(route, completedSteps)
  const currentStep = getCurrentRouteStep(route, normalizedCompletedSteps)
  const complete = normalizedCompletedSteps === totalSteps
  const headingId = `${title.toLowerCase().replaceAll(' ', '-')}-route-heading`
  const currentHeadingOrder = headingOrder === 2 ? 3 : 4
  const CurrentStepIcon = currentStep ? getStepIcon(currentStep) : null
  const progressAnnouncement = currentStep
    ? `${title}, step ${String(normalizedCompletedSteps + 1)} of ${String(totalSteps)}: ${getRouteStepLabel(currentStep)}`
    : `${title} has no current route step.`
  const resetLabel = title === 'Group A' || title === 'Group B' ? `Reset ${title}` : 'Reset route'

  return (
    <Paper component='section' withBorder p={{ base: 'md', sm: 'lg' }} aria-labelledby={headingId}>
      {!complete && (
        <VisuallyHidden role='status' aria-live='polite' aria-atomic='true'>
          {progressAnnouncement}
        </VisuallyHidden>
      )}

      <Stack gap='md'>
        <Group justify='space-between' align='flex-start' wrap='wrap'>
          <Stack gap={2}>
            <Title id={headingId} order={headingOrder} size='h3'>
              {title}
            </Title>
            {description && (
              <Text c='dimmed' size='sm'>
                {description}
              </Text>
            )}
          </Stack>
          <Badge color={complete ? 'green' : 'blue'} variant='light' size='lg'>
            {complete
              ? `${String(totalSteps)} of ${String(totalSteps)} complete`
              : `Step ${String(normalizedCompletedSteps + 1)} of ${String(totalSteps)}`}
          </Badge>
        </Group>

        <Progress
          value={(normalizedCompletedSteps / totalSteps) * 100}
          aria-label={`${title}: ${String(normalizedCompletedSteps)} of ${String(totalSteps)} steps completed`}
        />

        {currentStep ? (
          <Paper withBorder p={{ base: 'md', sm: 'xl' }} radius='md' bg='var(--mantine-primary-color-light)'>
            <Stack gap='xs' align='center' ta='center'>
              {CurrentStepIcon && (
                <ThemeIcon
                  size={72}
                  radius='xl'
                  variant='light'
                  color={currentStep.type === 'dimension-door' ? 'grape' : 'blue'}
                >
                  <CurrentStepIcon size={42} aria-hidden='true' />
                </ThemeIcon>
              )}
              <Text size='xs' tt='uppercase' fw={700}>
                Current instruction
              </Text>
              <Title order={currentHeadingOrder} size='h2'>
                {getRouteStepLabel(currentStep)}
              </Title>
              {currentStep.type === 'dimension-door' ? (
                <Text maw={460}>
                  Use Dimension Door to return to the starting room, then continue with the next route step. Do not run
                  backward.
                </Text>
              ) : (
                <Text c='dimmed'>Go {getDirectionLabel(currentStep.direction)}.</Text>
              )}
            </Stack>
          </Paper>
        ) : (
          <Alert color='green' title={`${title} route complete`} role='status' aria-live='polite'>
            Every route step is marked complete. Nice work!
          </Alert>
        )}

        <Group grow>
          <Button
            variant='default'
            size='lg'
            disabled={normalizedCompletedSteps === 0}
            onClick={onBack}
            aria-label={`${title}: Back one step`}
          >
            Back
          </Button>
          {!complete && (
            <Button size='lg' onClick={onAdvance} aria-label={`${title}: Complete step`}>
              {normalizedCompletedSteps === totalSteps - 1 ? 'Complete route' : 'Complete step'}
            </Button>
          )}
        </Group>

        <Group justify='flex-end'>
          <Button variant='subtle' color='gray' onClick={onReset} aria-label={`Reset ${title} route`}>
            {resetLabel}
          </Button>
        </Group>

        <RouteOverview route={route} completedSteps={normalizedCompletedSteps} routeName={title} />
      </Stack>
    </Paper>
  )
}

const ShadowCryptPage = () => {
  const [selectedColor, setSelectedColor] = useState<StartingRoomColor | null>(null)
  const [selectedRouteType, setSelectedRouteType] = useState<RouteType>('twelve-gear')
  const [progressByRoute, setProgressByRoute] = useState<RouteProgress>({})

  const updateProgress = (routeKey: string, updater: (current: number) => number) => {
    setProgressByRoute((currentProgress) => ({
      ...currentProgress,
      [routeKey]: updater(currentProgress[routeKey] ?? 0)
    }))
  }

  const renderRoutePanel = (
    title: string,
    description: string | undefined,
    headingOrder: 2 | 3,
    route: RouteDefinition,
    routeKey: string
  ) => (
    <RouteProgressPanel
      title={title}
      description={description}
      headingOrder={headingOrder}
      route={route}
      completedSteps={progressByRoute[routeKey] ?? 0}
      onAdvance={() => {
        updateProgress(routeKey, (current) => advanceRouteProgress(route, current))
      }}
      onBack={() => {
        updateProgress(routeKey, (current) => backRouteProgress(route, current))
      }}
      onReset={() => {
        updateProgress(routeKey, resetRouteProgress)
      }}
    />
  )

  const selectedRoutes = selectedColor ? SHADOW_CRYPT_ROUTES[selectedColor] : null
  return (
    <ToolLayout>
      <Stack gap='xs'>
        <Group justify='space-between' align='flex-start' wrap='wrap'>
          <Stack gap={2}>
            <Title order={1}>The Shadow Crypt</Title>
            <Text c='dimmed'>The Necropolis, Part II</Text>
          </Stack>
          <Anchor
            href='https://github.com/veteran-software/yourddo/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22Puzzle%20Solvers%22'
            target='_blank'
            rel='noreferrer'
            size='sm'
          >
            Known issues / bug reports
          </Anchor>
        </Group>
        <Text>
          For 12-Gear or Group A, choose the color in the first east room. Group B waits at the start. Then choose the
          route type and follow the current instruction one step at a time.
        </Text>
      </Stack>

      <Paper withBorder p={{ base: 'md', sm: 'lg' }}>
        <Stack gap='lg'>
          <Stack gap='xs' maw={520}>
            <Text id='starting-room-color-label' fw={600}>
              1. Starting-room color
            </Text>
            <SegmentedControl
              aria-labelledby='starting-room-color-label'
              data={COLOR_OPTIONS}
              value={selectedColor ?? ''}
              onChange={(value) => {
                if (value === 'red' || value === 'green' || value === 'blue') setSelectedColor(value)
              }}
              size='lg'
              fullWidth
            />
          </Stack>

          <Stack gap='xs' maw={420}>
            <Text id='route-type-label' fw={600}>
              2. Route type
            </Text>
            <SegmentedControl
              aria-labelledby='route-type-label'
              data={ROUTE_TYPE_OPTIONS}
              value={selectedRouteType}
              onChange={(value) => {
                if (value === 'twelve-gear' || value === 'eight-gear-duo') setSelectedRouteType(value)
              }}
              fullWidth
            />
          </Stack>
        </Stack>
      </Paper>

      {!selectedColor || !selectedRoutes ? (
        <Paper withBorder p='lg'>
          <Text fw={600}>Choose the starting-room color to show the next route instruction.</Text>
        </Paper>
      ) : selectedRouteType === 'twelve-gear' ? (
        <Box maw={760}>
          {renderRoutePanel(
            `${getColorLabel(selectedColor)} 12-Gear`,
            'Go east from the start, identify the room color, then follow this route.',
            2,
            selectedRoutes.twelveGear,
            getRouteKey(selectedColor, selectedRouteType)
          )}
        </Box>
      ) : (
        <Stack gap='md'>
          <Stack gap={2}>
            <Title order={2} size='h3'>
              {getColorLabel(selectedColor)} 8-Gear Duo
            </Title>
            <Text c='dimmed'>Each group follows its own route and keeps independent progress.</Text>
          </Stack>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing={{ base: 'md', md: 'lg' }}>
            {renderRoutePanel(
              'Group A',
              'Move east from the start to identify the color, then follow this route.',
              3,
              selectedRoutes.eightGearDuo.groupA,
              getRouteKey(selectedColor, selectedRouteType, 'groupA')
            )}
            {renderRoutePanel(
              'Group B',
              'Wait at the starting room until Group A identifies the color. Do not first go east unless this route says East.',
              3,
              selectedRoutes.eightGearDuo.groupB,
              getRouteKey(selectedColor, selectedRouteType, 'groupB')
            )}
          </SimpleGrid>
        </Stack>
      )}

      <Accordion variant='separated'>
        <Accordion.Item value='how-to-use'>
          <Accordion.Control>How to use this pathfinder</Accordion.Control>
          <Accordion.Panel>
            <Stack gap='sm'>
              <Text>
                For a 12-Gear run, head to the first room east of the starting point, note whether it is Red, Green, or
                Blue, then select that color and follow the route one step at a time.
              </Text>
              <Text>
                For an 8-Gear Duo, Group A goes east to identify the color and then follows Group A&apos;s route. Group
                B waits at the starting point until the color is known, then follows Group B&apos;s route from there.
              </Text>
              <Text>
                When the current instruction is Dimension Door, use Dimension Door to teleport back to the starting
                point before continuing. Do not try to run backward to the beginning; you will get lost.
              </Text>
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </ToolLayout>
  )
}

export default ShadowCryptPage
