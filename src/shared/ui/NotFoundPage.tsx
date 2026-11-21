import { Button, Stack, Text, Title } from '@mantine/core'
import { Link } from 'react-router-dom'
import ToolLayout from '../layout/ToolLayout'

const NotFoundPage = () => (
  <ToolLayout>
    <Stack align='flex-start'>
      <Title order={1}>Page not found</Title>
      <Text c='dimmed'>The requested YourDDO tool could not be found.</Text>
      <Button component={Link} to='/'>
        Return home
      </Button>
    </Stack>
  </ToolLayout>
)

export default NotFoundPage
