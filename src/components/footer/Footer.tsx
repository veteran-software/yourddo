import { DateTime } from 'luxon'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { Container, Navbar, Stack } from 'react-bootstrap'
import { FaCircleNotch } from 'react-icons/fa6'
import { serverStatusApi } from '../../api/serverStatusApi.ts'
import { useAppDispatch } from '../../redux/hooks.ts'
import { setFooterHeight } from '../../redux/slices/appSlice.ts'
import type { AppDispatch } from '../../redux/store.ts'
import ServerStatusDisplay from '../ServerStatusDisplay.tsx'
import Countdown from '../timer/Countdown.tsx'
import { extractServerName, isServerUp } from './helpers/helpers.ts'

const Footer = () => {
  const dispatch: AppDispatch = useAppDispatch()

  const [trigger, { data, isLoading }] = serverStatusApi.useAllServersMutation()

  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    trigger().catch(console.error)

    const intervalId = setInterval(() => {
      trigger().catch(console.error)
    }, 90000)

    return () => {
      clearInterval(intervalId)
    }
  }, [trigger])

  useLayoutEffect(() => {
    const box = navRef.current?.getBoundingClientRect()
    if (box?.height) {
      dispatch(setFooterHeight(box.height))
    }
  }, [dispatch])

  return (
    <Navbar ref={navRef} fixed='bottom' variant='dark' className='bg-primary overflow-x-auto overflow-y-hidden'>
      <Container fluid className='m-auto w-auto py-0'>
        <Stack direction='vertical' gap={1}>
          <Stack direction='horizontal' gap={2}>
            {isLoading && (
              <FaCircleNotch
                title='Loading...'
                size={15}
                color='gray'
                style={{ animation: 'spin 1s linear infinite' }}
              />
            )}

            {data?.map((server, idx: number) => {
              return (
                <>
                  {idx > 0 && <>&bull;</>}
                  <ServerStatusDisplay name={extractServerName(server)} up={isServerUp(server)} />
                </>
              )
            })}

            {/* 64-bit servers coming soon; everything "should auto-update on launch day" */}
            {/* So I'm going to gate these behind the timer and see what happens /shrug */}
            {DateTime.now().toSeconds() <= 1752080400 && (
              <>
                &bull;
                <ServerStatusDisplay name='Shadowdale' up={undefined} comingSoon={true} />
                &bull;
                <ServerStatusDisplay name='Thrane' up={undefined} comingSoon={true} />
                &bull;
                <ServerStatusDisplay name='Moonsea' up={undefined} comingSoon={true} />
              </>
            )}
          </Stack>

          {/* Hide the timer at 1pm EST [the usual time the servers are back online after an update] */}
          {DateTime.now().toSeconds() <= 1752080400 && (
            <Stack className='w-auto justify-content-center' direction='horizontal' gap={2}>
              <strong>Countdown to 64-bit Servers:</strong>
              <Countdown targetTimestamp={1752066000} />
            </Stack>
          )}
        </Stack>
      </Container>
    </Navbar>
  )
}

export default Footer
