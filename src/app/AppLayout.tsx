import { CraftingSession } from '../shared/layout/craftingSession'
import { IconBrandDiscord, IconBrandGithub, IconBeer } from '@tabler/icons-react'
import RouteSeo from '../shared/seo/RouteSeo'
import { useEffect, useState } from 'react'
import { recordVisit } from '../domains/home/shelves'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { TroveImport, TroveProvider } from '../domains/gearPlanner/components/TroveInventory'
import { ActionIcon, AppShell, Burger, Drawer, Group, Image, ScrollArea, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import SidebarNavigation from '../shared/navigation/SidebarNavigation'
import ServerStatus, { ServerStatusShortcut } from '../shared/serverStatus/ServerStatus'
import { useServerStatus } from '../shared/serverStatus/useServerStatus'
import ThemeSwitch from '../shared/ui/ThemeSwitch'

function openStatus(openNav: () => void) {
  openNav()
  requestAnimationFrame(() => document.getElementById('server-status')?.focus({ preventScroll: true }))
}

const AppLayout = ({ develop }: { develop: boolean }) => {
  const [craftingSession] = useState(() => ({}))
  const [mobileOpened, mobile] = useDisclosure(false)
  const [desktopOpened, desktop] = useDisclosure(true)

  const [coffeeOpened, coffee] = useDisclosure(false)

  const location = useLocation()
  const { pathname } = location
  const visitState: unknown = location.state
  const recentPath =
    visitState &&
    typeof visitState === 'object' &&
    'recentToolPath' in visitState &&
    typeof visitState.recentToolPath === 'string'
      ? visitState.recentToolPath
      : pathname
  useEffect(() => {
    recordVisit(recentPath)
  }, [recentPath])
  const status = useServerStatus()
  return (
    <TroveProvider>
      <AppShell
        header={{ height: develop ? 86 : 56 }}
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
        <RouteSeo />
        <AppShell.Header>
          {develop && (
            <Text bg='orange.9' c='white' ta='center' h={30} lh='30px' size='xs' fw={600}>
              Development preview · Verify plans before crafting in game.
            </Text>
          )}
          <Group h={56} px={{ base: 'xs', sm: 'md' }} gap='xs' wrap='nowrap' justify='space-between'>
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

              <Link to='/' aria-label='YourDDO home' onClick={mobile.close}>
                <Image
                  src='/yourddo-logo.png'
                  alt='YourDDO'
                  w='clamp(7.5rem, calc(100vw - 13.75rem), 11.875rem)'
                  miw={0}
                  h={38}
                  fit='contain'
                />
              </Link>
            </Group>

            <Group gap='xs' wrap='nowrap' style={{ flexShrink: 0 }}>
              <ThemeSwitch />
              {pathname !== '/gear-planner' && <TroveImport compact />}
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
          <Group px='sm' pb='xs' gap='xs'>
            <ActionIcon
              component='a'
              variant='subtle'
              href='https://github.com/veteran-software/yourddo'
              aria-label='YourDDO on GitHub'
              title='GitHub'
            >
              <IconBrandGithub size={20} />
            </ActionIcon>
            <ActionIcon
              component='a'
              variant='subtle'
              href='https://discord.gg/jk3hYA5Jgv'
              aria-label='YourDDO Discord community'
              title='Discord'
            >
              <IconBrandDiscord size={20} />
            </ActionIcon>
            <ActionIcon
              variant='subtle'
              onClick={coffee.open}
              aria-haspopup='dialog'
              aria-label='Buy Me a Beer'
              title='Buy Me a Beer'
            >
              <IconBeer size={20} aria-hidden />
            </ActionIcon>
          </Group>
          <ServerStatus {...status} />
        </AppShell.Navbar>

        <Drawer
          opened={coffeeOpened}
          onClose={coffee.close}
          position='right'
          size={420}
          title='Buy Me a Beer'
          closeButtonProps={{ 'aria-label': 'Close support widget' }}
          styles={{
            content: { display: 'flex', flexDirection: 'column' },
            body: { flex: 1, display: 'flex', padding: 0 }
          }}
        >
          {coffeeOpened && (
            <iframe
              title='Buy Me a Beer support form'
              src='https://buymeacoffee.com/widget/page/yourddo?description=Buy%20Me%20a%20Beer&color=%23B38B36'
              allow='publickey-credentials-get *; payment *'
              style={{ width: '100%', border: 0 }}
            />
          )}
        </Drawer>

        <AppShell.Main>
          <CraftingSession.Provider value={craftingSession}>
            <Outlet />
          </CraftingSession.Provider>
        </AppShell.Main>
      </AppShell>
    </TroveProvider>
  )
}

export default AppLayout
