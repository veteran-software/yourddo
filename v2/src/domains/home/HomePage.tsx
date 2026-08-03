import { Stack, Text, Title } from '@mantine/core'
import ToolLayout from '../../shared/layout/ToolLayout'

const HomePage = () => (
  <ToolLayout>
    <Stack gap='xs'>
      <Title order={1}>YourDDO</Title>
      <Text c='dimmed'>Crafting, planning, tracking, and puzzle tools for Dungeons & Dragons Online.</Text>
    </Stack>
  </ToolLayout>
)

export default HomePage
