import { Container, Stack } from '@mantine/core'
import type { ReactNode } from 'react'
import styles from './workspace.module.css'

interface ToolLayoutProps {
  children: ReactNode
}

const ToolLayout = ({ children }: ToolLayoutProps) => (
  <Container className={styles.toolLayout} size='xl' py='lg'>
    <Stack gap='lg'>{children}</Stack>
  </Container>
)

export default ToolLayout
