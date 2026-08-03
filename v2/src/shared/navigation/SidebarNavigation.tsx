import { NavLink, Stack, Text } from '@mantine/core'
import { NavLink as RouterNavLink, useLocation } from 'react-router-dom'
import { navigation } from './navigation'

interface SidebarNavigationProps {
  onNavigate: () => void
}

const SidebarNavigation = ({ onNavigate }: SidebarNavigationProps) => {
  const { pathname } = useLocation()

  return (
    <Stack gap='md'>
      <NavLink component={RouterNavLink} to='/' label='Home' active={pathname === '/'} onClick={onNavigate} />

      {navigation.map((group) => (
        <Stack key={group.label} gap={4}>
          <Text size='xs' fw={700} c='dimmed' tt='uppercase'>
            {group.label}
          </Text>

          {group.items.map((item) => (
            <NavLink
              key={item.path}
              component={RouterNavLink}
              to={item.path}
              label={item.label}
              active={pathname === item.path}
              onClick={onNavigate}
            />
          ))}
        </Stack>
      ))}
    </Stack>
  )
}

export default SidebarNavigation
