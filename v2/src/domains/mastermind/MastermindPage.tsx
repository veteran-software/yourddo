import {
  Alert,
  Anchor,
  Badge,
  Box,
  Button,
  Divider,
  Group,
  NumberInput,
  Paper,
  SimpleGrid,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
  VisuallyHidden
} from '@mantine/core'
import { type SyntheticEvent, useState } from 'react'
import ToolLayout from '../../shared/layout/ToolLayout.tsx'
import useMastermindSolver, { type Color, type Feedback, type Guess } from './useMastermindSolver.ts'

const MAX_ATTEMPTS = 10
const INITIAL_GUESS: Color[] = [1, 1, 2, 2]

const colors: Record<Color, { color: string; label: string }> = {
  1: { color: 'blue', label: 'Blue' },
  2: { color: 'green', label: 'Green' },
  3: { color: 'orange', label: 'Orange' },
  4: { color: 'pink', label: 'Pink' },
  5: { color: 'red', label: 'Red' },
  6: { color: 'yellow', label: 'Yellow' }
}

const describeCode = (code: Color[]): string =>
  code.map((color) => `${colors[color].label} ${String(color)}`).join(', ')

const CodePegs = ({ code, size = 46, label }: { code: Color[]; size?: number; label: string }) => (
  <Group gap='sm' wrap='nowrap' role='img' aria-label={`${label}: ${describeCode(code)}`}>
    {code.map((color, index) => (
      <ThemeIcon
        key={`${String(color)}-${String(index)}`}
        color={colors[color].color}
        radius='xl'
        size={size}
        autoContrast
      >
        <Text component='span' fw={700} aria-hidden='true'>
          {color}
        </Text>
      </ThemeIcon>
    ))}
  </Group>
)

const FeedbackBadges = ({ feedback }: { feedback: Feedback }) => (
  <Group gap='xs' wrap='nowrap' aria-label={`${String(feedback.black)} black, ${String(feedback.white)} white`}>
    <Badge color='dark' variant='filled'>
      Black: {feedback.black}
    </Badge>
    <Badge color='gray' variant='outline'>
      White: {feedback.white}
    </Badge>
  </Group>
)

const GuessHistory = ({ guesses }: { guesses: Guess[] }) => {
  if (guesses.length === 0) return <Text c='dimmed'>No feedback submitted yet.</Text>

  return (
    <Table.ScrollContainer minWidth={420}>
      <Table verticalSpacing='sm' highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Attempt</Table.Th>
            <Table.Th>Guess</Table.Th>
            <Table.Th>Feedback</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {guesses.map((guess, index) => (
            <Table.Tr key={`${guess.code.join('-')}-${String(index)}`}>
              <Table.Td>{index + 1}</Table.Td>
              <Table.Td>
                <CodePegs code={guess.code} size={32} label={`Attempt ${String(index + 1)} guess`} />
              </Table.Td>
              <Table.Td>
                <FeedbackBadges feedback={guess.feedback} />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  )
}

const isValidInput = (value: number | string): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 4

const isAllowedFeedbackValue = ({ floatValue }: { floatValue?: number }): boolean =>
  floatValue === undefined || (Number.isInteger(floatValue) && floatValue >= 0 && floatValue <= 4)

const MastermindPage = () => {
  const { currentGuess, possibleCount, guesses, finished, reset, submitFeedback } = useMastermindSolver(
    INITIAL_GUESS,
    MAX_ATTEMPTS
  )
  const [black, setBlack] = useState<number | string>(0)
  const [white, setWhite] = useState<number | string>(0)
  const [feedbackError, setFeedbackError] = useState<string>()

  const latestFeedback = guesses.at(-1)?.feedback
  const solved = latestFeedback?.black === 4 || possibleCount === 1
  const maximumReached = finished && !solved
  const displayedAttempt = finished ? guesses.length : guesses.length + 1

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!isValidInput(black) || !isValidInput(white)) {
      setFeedbackError('Enter whole numbers from 0 to 4 for both feedback values.')
      return
    }

    const result = submitFeedback({ black, white })
    if (result?.error) {
      setFeedbackError(result.error)
      return
    }

    setFeedbackError(undefined)
    setBlack(0)
    setWhite(0)
  }

  const handleReset = () => {
    reset()
    setBlack(0)
    setWhite(0)
    setFeedbackError(undefined)
  }

  return (
    <ToolLayout>
      {!finished && (
        <VisuallyHidden role='status' aria-live='polite' aria-atomic='true'>
          {guesses.length === 0 ? 'Initial guess' : 'New guess generated'}: {describeCode(currentGuess)}. Attempt{' '}
          {displayedAttempt} of {MAX_ATTEMPTS}. {possibleCount} possibilities remain.
        </VisuallyHidden>
      )}

      <Stack gap='xs'>
        <Group justify='space-between' align='flex-start' wrap='wrap'>
          <Stack gap={2}>
            <Title order={1}>Mastermind Solver</Title>
            <Text c='dimmed'>The Reaver&apos;s Fate</Text>
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
          Try the displayed code in game, then enter the black pegs for correct positions and white pegs for correct
          colors in different positions.
        </Text>
      </Stack>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing={{ base: 'md', md: 'lg' }}>
        <Paper withBorder p={{ base: 'md', sm: 'lg' }}>
          <Stack gap='lg'>
            <Group justify='space-between' wrap='wrap'>
              <Badge variant='light'>
                {finished ? 'Attempts used' : 'Attempt'}: {displayedAttempt} of {MAX_ATTEMPTS}
              </Badge>
              <Badge variant='outline'>Remaining possibilities: {possibleCount}</Badge>
            </Group>
            <Divider />
            <Stack gap='sm' align='flex-start'>
              <Title order={2} size='h3'>
                {solved ? 'Solution' : maximumReached ? 'Last guess' : 'Next guess'}
              </Title>
              <CodePegs
                code={currentGuess}
                label={solved ? 'Solution' : maximumReached ? 'Last guess' : 'Next guess'}
              />
            </Stack>
          </Stack>
        </Paper>

        {!finished ? (
          <Paper withBorder p={{ base: 'md', sm: 'lg' }}>
            <Box component='form' onSubmit={handleSubmit}>
              <Stack gap='md'>
                <Group justify='space-between' wrap='wrap'>
                  <Title order={2} size='h3'>
                    Enter feedback
                  </Title>
                  <Badge color={feedbackError ? 'red' : 'blue'} variant='light'>
                    {feedbackError ? 'No valid solution remains' : 'In progress'}
                  </Badge>
                </Group>
                <Text c='dimmed' size='sm'>
                  Enter the feedback shown in game for the guess beside these controls.
                </Text>
                <SimpleGrid cols={{ base: 1, xs: 2 }} spacing='sm'>
                  <NumberInput
                    label='Black feedback'
                    description='Correct color and position'
                    value={black}
                    onChange={setBlack}
                    min={0}
                    max={4}
                    allowDecimal={false}
                    clampBehavior='strict'
                    isAllowed={isAllowedFeedbackValue}
                  />
                  <NumberInput
                    label='White feedback'
                    description='Correct color, different position'
                    value={white}
                    onChange={setWhite}
                    min={0}
                    max={4}
                    allowDecimal={false}
                    clampBehavior='strict'
                    isAllowed={isAllowedFeedbackValue}
                  />
                </SimpleGrid>
                {feedbackError && (
                  <Alert color='red' title='No valid solution remains' role='alert'>
                    {feedbackError} Check the in-game feedback and try again.
                  </Alert>
                )}
                <Button type='submit' fullWidth>
                  Submit feedback
                </Button>
              </Stack>
            </Box>
          </Paper>
        ) : solved ? (
          <Alert color='green' title='Puzzle solved!' role='status' aria-live='polite'>
            The solution is shown beside this message. Go grab your loot!
          </Alert>
        ) : (
          <Alert color='red' title='Maximum attempts reached' role='status' aria-live='polite'>
            The solver did not identify a solution within {MAX_ATTEMPTS} attempts. Reset the puzzle to try again.
          </Alert>
        )}
      </SimpleGrid>

      <Group justify='flex-end'>
        <Button variant='subtle' color='gray' onClick={handleReset}>
          Reset solver
        </Button>
      </Group>

      <Divider />

      <Stack gap='sm'>
        <Title order={2} size='h3'>
          Previous guesses and feedback
        </Title>
        <GuessHistory guesses={guesses} />
      </Stack>
    </ToolLayout>
  )
}

export default MastermindPage
