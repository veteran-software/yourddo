import { Box, Container, Paper, Stack } from '@mantine/core'
import { IconListCheck } from '@tabler/icons-react'
import type { ReactNode } from 'react'
import WorkspaceHeader from './WorkspaceHeader'
import styles from './workspace.module.css'

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
    <Stack gap='md'>
      <WorkspaceHeader icon={IconListCheck} title={title} description={description} actions={actions} />
      {(summary !== undefined || controls !== undefined) && (
        <div className={styles.trackerTools}>
          {summary !== undefined && <Paper className={styles.summary}>{summary}</Paper>}
          {controls !== undefined && <Box>{controls}</Box>}
        </div>
      )}
      <Box component='main' w='100%' miw={0}>
        {children}
      </Box>
    </Stack>
  </Container>
)

export default TrackerLayout
