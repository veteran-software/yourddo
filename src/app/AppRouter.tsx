import { Alert, Button, Center, Loader, Stack, Text } from '@mantine/core'
import { Component, Suspense, type ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { routeAliases } from '../shared/seo/seoConfig'
import NotFoundPage from '../shared/ui/NotFoundPage.tsx'
import AppLayout from './AppLayout'
import { pageRoutes, type PreparedRoutePage } from './routePages'

function LegacyGearLink({ children }: Readonly<{ children: ReactNode }>) {
  const { hash } = useLocation()
  // Older deployments put the Gear Planner route and its shared setup in the hash.
  if (hash.startsWith('#/gear-planner?') && new URLSearchParams(hash.slice('#/gear-planner?'.length)).has('gp')) {
    return <Navigate to={hash.slice(1)} replace />
  }
  return children
}

class RouteLoadBoundary extends Component<Readonly<{ children: ReactNode }>, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? (
      <Alert m='md' color='red' title='This page could not load'>
        <Button
          variant='light'
          onClick={() => {
            window.location.reload()
          }}
        >
          Reload page
        </Button>
      </Alert>
    ) : (
      this.props.children
    )
  }
}

function RouteLoading() {
  return (
    <Center mih={160} role='status'>
      <Stack align='center' gap='xs'>
        <Loader size='sm' />
        <Text size='sm'>Loading page…</Text>
      </Stack>
    </Center>
  )
}

const AppRouter = ({
  hostname = globalThis.window?.location.hostname ?? '',
  prepared
}: Readonly<{ hostname?: string; prepared?: PreparedRoutePage }> = {}) => (
  <Routes>
    <Route element={<AppLayout develop={hostname.startsWith('develop.')} />}>
      {pageRoutes.map((route) => {
        const Page = prepared?.path === route.path ? prepared.Page : route.Page
        const element =
          route.path === '/' || route.path === '/gear-planner' ? (
            <LegacyGearLink>
              <Page />
            </LegacyGearLink>
          ) : (
            <Page />
          )
        return (
          <Route
            key={route.path}
            path={route.path}
            element={
              <RouteLoadBoundary key={route.path}>
                <Suspense fallback={<RouteLoading />}>{element}</Suspense>
              </RouteLoadBoundary>
            }
          />
        )
      })}
      {routeAliases.map(({ path, target }) => (
        <Route key={path} path={path} element={<Navigate to={target} state={{ recentToolPath: path }} replace />} />
      ))}
      <Route path='*' element={<NotFoundPage />} />
    </Route>
  </Routes>
)

export default AppRouter
