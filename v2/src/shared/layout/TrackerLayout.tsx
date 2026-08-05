import { Box, Container, Flex, Paper, Stack, Text, Title } from '@mantine/core'
import type { ReactNode } from 'react'

interface TrackerLayoutProps {
  title: string
  description?: ReactNode
  summary?: ReactNode
  controls?: ReactNode
  actions?: ReactNode
  children: ReactNode
}

const TrackerLayout = ({ title, description, summary, controls, actions, children }: TrackerLayoutProps) => (
  <Container size='xl' px='md' py='lg'>
    <Stack gap='lg'>
      <Box component='header'>
        <Stack gap='md'>
          <Flex direction={{ base: 'column', sm: 'row' }} align={{ sm: 'flex-start' }} gap='md'>
            <Stack gap={4} flex={1} miw={0}>
              <Title order={1}>{title}</Title>
              {description !== undefined ? (
                <Text component='div' c='dimmed'>
                  {description}
                </Text>
              ) : null}
            </Stack>

            {actions !== undefined ? (
              <Flex wrap='wrap' gap='md' justify={{ base: 'flex-start', sm: 'flex-end' }}>
                {actions}
              </Flex>
            ) : null}
          </Flex>

          {summary !== undefined ? <Paper p='md'>{summary}</Paper> : null}
          {controls !== undefined ? <Box w='100%'>{controls}</Box> : null}
        </Stack>
      </Box>

      <Box component='main' w='100%' miw={0}>
        {children}
      </Box>
    </Stack>
  </Container>
)

export default TrackerLayout
