import { XMLParser } from 'fast-xml-parser'
import { DateTime } from 'luxon'
import {
  type Dispatch,
  Fragment,
  type SetStateAction,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from 'react'
import { Container, Navbar, Stack } from 'react-bootstrap'
import { serverStatusApi } from '../../api/serverStatusApi.ts'
import { serverStatusLamApi } from '../../api/serverStatusLamApi.ts'
import { useAppDispatch } from '../../redux/hooks.ts'
import { setFooterHeight } from '../../redux/slices/appSlice.ts'
import type { AppDispatch } from '../../redux/store.ts'
import type { DatacenterStruct, Root, World } from '../../types/serverStatus.ts'
import ServerStatusDisplay from '../common/ServerStatusDisplay.tsx'
import Countdown from '../timer/Countdown.tsx'

const polling = {
  pollingInterval: 60000, // re-check every minute
  skipPollingIfUnfocused: false
}

const stripPrefix = (name: string) => name.replaceAll(/(?: ?\[(?:Old|US|EU)] ?)+/g, '')

const Footer = () => {
  const dispatch: AppDispatch = useAppDispatch()

  const { data: xmlData } = serverStatusApi.useDcQuery(undefined, polling)
  const [statusTrigger] = serverStatusApi.useLazyStatusQuery()
  const mainServersIntervalId = useRef<number>(-1)

  // Lamannia
  const { data: xmlDataLam } = serverStatusLamApi.useDcQuery(undefined, polling)
  const [statusTriggerLam] = serverStatusLamApi.useLazyStatusQuery()
  const lamServerIntervalId = useRef<number>(-1)

  const navRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const box = navRef.current?.getBoundingClientRect()
    if (box?.height) {
      dispatch(setFooterHeight(box.height))
    }
  }, [dispatch])

  const [gameWorlds, setGameWorlds] = useState<World[]>()
  const [statuses, setStatuses] = useState<Record<string, boolean | undefined>>({})

  // Lamannia
  const [gameWorldsLam, setGameWorldsLam] = useState<World[]>()
  const [statusesLam, setStatusesLam] = useState<Record<string, boolean | undefined>>({})

  const iterateResults = useCallback(
    async (
      promises: Promise<{
        name: string
        data: boolean | undefined
      }>[],
      setStatuses: Dispatch<SetStateAction<Record<string, boolean | undefined>>>
    ) => {
      const results = await Promise.all(promises)

      setStatuses((prev) => {
        const updated = { ...prev }
        for (const { name, data } of results) {
          updated[stripPrefix(name)] = data
        }

        return updated
      })
    },
    []
  )

  useEffect(() => {
    if (xmlData) {
      const parser = new XMLParser({ ignoreAttributes: true })
      const obj: Root = parser.parse(xmlData) as Root

      setGameWorlds(
        (
          (obj.ArrayOfDatacenterStruct.DatacenterStruct as DatacenterStruct).Datacenter.datacenter.Datacenter.Worlds
            .World as World[]
        ).toSorted((a: World, b: World) => (a.Order < b.Order ? -1 : 1))
      )
    }
  }, [xmlData])

  useEffect(() => {
    if (!gameWorlds) return

    const fetchApiStatuses = async () => {
      const promises = gameWorlds.map(async (world: World) => {
        const params: URLSearchParams = new URL(world.StatusServerUrl || '').searchParams
        const result = await statusTrigger(params.get('s') ?? '')

        return {
          name: stripPrefix(world.Name),
          data: 'data' in result ? result.data : undefined
        }
      })

      await iterateResults(promises, setStatuses)
    }

    fetchApiStatuses().catch(console.error)

    mainServersIntervalId.current = (globalThis.setInterval as unknown as (handler: TimerHandler, timeout?: number) => number)(() => {
      fetchApiStatuses().catch(console.error)
    }, 60000)

    return () => {
      globalThis.clearInterval(mainServersIntervalId.current as unknown as number)
    }
  }, [gameWorlds, iterateResults, statusTrigger])

  useEffect(() => {
    if (xmlDataLam) {
      const parser = new XMLParser({ ignoreAttributes: true })
      const obj: Root = parser.parse(xmlDataLam) as Root

      const ddoLam: DatacenterStruct | undefined = (
        obj.ArrayOfDatacenterStruct.DatacenterStruct as DatacenterStruct[]
      ).find((dcs: DatacenterStruct) => dcs.KeyName.toLowerCase() === 'ddo')
      if (ddoLam) {
        setGameWorldsLam([ddoLam.Datacenter.datacenter.Datacenter.Worlds.World as World])
      } else {
        setGameWorldsLam([])
      }
    }
  }, [xmlDataLam])

  useEffect(() => {
    if (!gameWorldsLam) return

    const fetchApiStatuses = async () => {
      const promises = gameWorldsLam.map(async (world: World) => {
        const params: URLSearchParams = new URL(world.StatusServerUrl || '').searchParams
        const result = await statusTriggerLam(params.get('s') ?? '')

        return {
          name: stripPrefix(world.Name),
          data: 'data' in result ? result.data : undefined
        }
      })

      await iterateResults(promises, setStatusesLam)
    }

    fetchApiStatuses().catch(console.error)

    lamServerIntervalId.current = (globalThis.setInterval as unknown as (handler: TimerHandler, timeout?: number) => number)(() => {
      fetchApiStatuses().catch(console.error)
    }, 60000)

    return () => {
      globalThis.clearInterval(lamServerIntervalId.current as unknown as number)
    }
  }, [gameWorldsLam, iterateResults, statusTriggerLam])

  const targetTime: DateTime = DateTime.fromISO('2025-07-17T18:00:00.000', { zone: 'gmt' })

  return (
    <Navbar ref={navRef} fixed='bottom' variant='dark' className='bg-primary overflow-x-auto overflow-y-hidden'>
      <Container fluid className='m-auto w-auto py-0 text-center'>
        <Stack direction='vertical' gap={1}>
          {/* 64-bit servers & Lam */}
          <Stack direction='horizontal' gap={3} className='w-auto justify-content-center'>
            {gameWorlds
              ?.filter((world) => world.Name.includes('[US]') || world.Name.includes('[EU]'))
              .map((world: World, idx: number) => {
                return (
                  <Fragment key={world.Name}>
                    {idx > 0 && <>&bull;</>}
                    <ServerStatusDisplay
                      name={stripPrefix(world.Name)}
                      up={statuses[stripPrefix(world.Name)]}
                      isGhost={false}
                    />
                  </Fragment>
                )
              })}

            {gameWorldsLam?.map((world: World) => {
              if (!statusesLam[world.Name]) {
                return <></>
              }

              return (
                <Fragment key={world.Name}>
                  <>&bull;</>
                  <ServerStatusDisplay name={world.Name} up={statusesLam[world.Name]} isGhost={false} />
                </Fragment>
              )
            })}
          </Stack>

          <hr className='my-1' />

          {/* Legacy Servers */}
          <Stack direction='horizontal' gap={3} className='w-auto justify-content-center'>
            {gameWorlds
              ?.filter((world) => world.Name.includes('[Old]'))
              .map((world: World, idx: number) => {
                if (world.Name.includes('[Old]')) {
                  return (
                    <Fragment key={world.Name}>
                      {idx > 0 && <>&bull;</>}
                      <ServerStatusDisplay
                        name={stripPrefix(world.Name)}
                        up={statuses[stripPrefix(world.Name)]}
                        isGhost={true}
                      />
                    </Fragment>
                  )
                }
              })}
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
