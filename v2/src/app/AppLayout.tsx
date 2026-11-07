import { AppShell, Burger, Group, Image, ScrollArea } from '@mantine/core'
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
            <Burger
              opened={mobileOpened}
              onClick={mobile.toggle}
              aria-label={mobileOpened ? 'Close navigation' : 'Open navigation'}
              hiddenFrom='lg'
              size='sm'
              color='dark.1'
            />

            <Burger
              opened={desktopOpened}
              onClick={desktop.toggle}
              aria-label={desktopOpened ? 'Collapse navigation' : 'Expand navigation'}
              visibleFrom='lg'
              size='sm'
              color='dark.1'
            />

            <Image
              src='/yourddo-logo.png'
              alt='YourDDO'
              w='clamp(7.5rem, calc(100vw - 13.75rem), 11.875rem)'
              h={38}
              fit='contain'
            />
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
