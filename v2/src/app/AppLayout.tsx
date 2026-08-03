import { AppShell, Burger, Group, ScrollArea, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Outlet } from 'react-router-dom'
import SidebarNavigation from '../shared/navigation/SidebarNavigation'
import ThemeMenu from '../shared/ui/ThemeMenu'

const AppLayout = () => {
  const [mobileOpened, mobile] = useDisclosure(false)
  const [desktopOpened, desktop] = useDisclosure(true)

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{
        width: 260,
        breakpoint: 'lg',
        collapsed: {
          mobile: !mobileOpened,
          desktop: !desktopOpened
        }
      }}
      padding={0}
    >
      <AppShell.Header>
        <Group h='100%' px='md' justify='space-between'>
          <Group gap='sm'>
            <Burger opened={mobileOpened} onClick={mobile.toggle} hiddenFrom='lg' size='sm' />

            <Burger opened={desktopOpened} onClick={desktop.toggle} visibleFrom='lg' size='sm' />

            <Text fw={700}>YourDDO</Text>
          </Group>

          <ThemeMenu />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar>
        <AppShell.Section grow component={ScrollArea} p='sm' type='auto' offsetScrollbars>
          <SidebarNavigation onNavigate={mobile.close} />
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}

export default AppLayout
