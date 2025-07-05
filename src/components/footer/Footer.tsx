import { DateTime } from 'luxon'
import { useLayoutEffect, useRef } from 'react'
import { Container, Navbar, Stack } from 'react-bootstrap'
import { serverStatusApi } from '../../api/serverStatusApi.ts'
import { serverStatusLamApi } from '../../api/serverStatusLamApi.ts'
import { useAppDispatch } from '../../redux/hooks.ts'
import { setFooterHeight } from '../../redux/slices/appSlice.ts'
import type { AppDispatch } from '../../redux/store.ts'
import ServerStatusDisplay from '../ServerStatusDisplay.tsx'
import Countdown from '../timer/Countdown.tsx'

const polling = {
  pollingInterval: 60000, // re-check every minute
  skipPollingIfUnfocused: true
}

const Footer = () => {
  const dispatch: AppDispatch = useAppDispatch()

  const { data: argoUp } = serverStatusApi.useArgonnessenQuery(undefined, polling)
  const { data: cannithUp } = serverStatusApi.useCannithQuery(undefined, polling)
  const { data: ghallandaUp } = serverStatusApi.useGhallandaQuery(undefined, polling)
  const { data: khyberUp } = serverStatusApi.useKhyberQuery(undefined, polling)
  const { data: orienUp } = serverStatusApi.useOrienQuery(undefined, polling)
  const { data: sarlonaUp } = serverStatusApi.useSarlonaQuery(undefined, polling)
  const { data: thelanisUp } = serverStatusApi.useThelanisQuery(undefined, polling)
  const { data: wayfinderUp } = serverStatusApi.useWayfinderQuery(undefined, polling)
  // const { data: hardcoreUp } = serverStatusApi.useHardcoreQuery(undefined, polling)
  const { data: lamanniaUp } = serverStatusLamApi.useLamanniaQuery(undefined, polling)
  const { data: cormyrUp } = serverStatusApi.useCormyrQuery(undefined, polling)

  const navRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const box = navRef.current?.getBoundingClientRect()
    if (box?.height) {
      dispatch(setFooterHeight(box.height))
    }
  }, [dispatch])

  const targetTime: DateTime = DateTime.fromISO('2025-07-15T18:00:00.000', { zone: 'gmt' })

  return (
    <Navbar ref={navRef} fixed='bottom' variant='dark' className='bg-primary overflow-x-auto overflow-y-hidden'>
      <Container fluid className='m-auto w-auto py-0'>
        <Stack direction='vertical' gap={1}>
          <Stack direction='horizontal' gap={3}>
            <ServerStatusDisplay name='Cormyr' up={cormyrUp} />
            &bull;
            <ServerStatusDisplay name='Cannith' up={cannithUp} />
            &bull;
            <ServerStatusDisplay name='Argonnessen' up={argoUp} />
            &bull;
            <ServerStatusDisplay name='Ghallanda' up={ghallandaUp} />
            &bull;
            <ServerStatusDisplay name='Khyber' up={khyberUp} />
            &bull;
            <ServerStatusDisplay name='Orien' up={orienUp} />
            &bull;
            <ServerStatusDisplay name='Sarlona' up={sarlonaUp} />
            &bull;
            <ServerStatusDisplay name='Thelanis' up={thelanisUp} />
            &bull;
            <ServerStatusDisplay name='Wayfinder' up={wayfinderUp} />
            {/*
            I think Hardcore is no longer in existence.
            It doesn't show up in the server list when pinging the data center
            */}
            {/*&bull;*/}
            {/*<ServerStatusDisplay name='Hardcore' up={hardcoreUp} />*/}
            &bull;
            <ServerStatusDisplay name='Lamannia' up={lamanniaUp} />
            &bull;
            {/* 64-bit servers coming soon */}
            <ServerStatusDisplay name='Shadowdale' up={undefined} comingSoon={true} comingSoonDate={targetTime} />
            &bull;
            <ServerStatusDisplay name='Thrane' up={undefined} comingSoon={true} comingSoonDate={targetTime} />
            &bull;
            <ServerStatusDisplay name='Moonsea' up={undefined} comingSoon={true} comingSoonDate={targetTime} />
          </Stack>

          {/* Hide the timer at 6pm EST */}
          {DateTime.now().toSeconds() <= targetTime.plus({ hours: 4 }).toSeconds() && (
            <Stack className='w-auto justify-content-center' direction='horizontal' gap={2}>
              <strong>Countdown to 64-bit Servers:</strong>
              <Countdown targetTimestamp={targetTime.toSeconds()} />
            </Stack>
          )}
        </Stack>
      </Container>
    </Navbar>
  )
}

export default Footer
