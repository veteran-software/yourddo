import { AppShell, Burger, Group, Image, ScrollArea } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Outlet } from 'react-router-dom'
import SidebarNavigation from '../shared/navigation/SidebarNavigation'
import ServerStatus, { ServerStatusShortcut } from '../shared/serverStatus/ServerStatus'
import { useServerStatus } from '../shared/serverStatus/useServerStatus'
import ThemeSwitch from '../shared/ui/ThemeSwitch'

const AppLayout = () => {
  const [mobileOpened, mobile] = useDisclosure(false)
  const [desktopOpened, desktop] = useDisclosure(true)

  const status = useServerStatus()
  function openStatus(openNav: () => void) {
    openNav()
    requestAnimationFrame(() => document.getElementById('server-status')?.focus({ preventScroll: true }))
  }
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
        <Group h='100%' px={{ base: 'xs', sm: 'md' }} gap='xs' wrap='nowrap' justify='space-between'>
          <Group gap='sm' wrap='nowrap' miw={0}>
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
              miw={0}
              h={38}
              fit='contain'
            />
          </Group>

          <Group gap='xs' wrap='nowrap' style={{ flexShrink: 0 }}>
            <ThemeSwitch />
            {!mobileOpened && (
              <ServerStatusShortcut
                live={status.live}
                onOpen={() => {
                  openStatus(mobile.open)
                }}
                className='mantine-hidden-from-lg'
              />
            )}
            {!desktopOpened && (
              <ServerStatusShortcut
                live={status.live}
                onOpen={() => {
                  openStatus(desktop.open)
                }}
                className='mantine-visible-from-lg'
              />
            )}
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar>
        <AppShell.Section grow component={ScrollArea} p='sm' type='auto' offsetScrollbars>
          <SidebarNavigation onNavigate={mobile.close} />
        </AppShell.Section>
        <ServerStatus {...status} />
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}

export default AppLayout
