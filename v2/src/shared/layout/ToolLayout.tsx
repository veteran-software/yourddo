import { Container, Stack } from '@mantine/core'
import type { ReactNode } from 'react'

interface ToolLayoutProps {
  children: ReactNode
}

const ToolLayout = ({ children }: ToolLayoutProps) => (
  <Container size='xl' py='lg'>
    <Stack gap='lg'>{children}</Stack>
  </Container>
)

export default ToolLayout
