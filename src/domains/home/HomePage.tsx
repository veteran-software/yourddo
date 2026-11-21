import { ActionIcon, Anchor, Button, Group, Paper, Stack, Text, Title } from '@mantine/core'
import {
  IconArrowUpRight,
  IconBook2,
  IconClock,
  IconCompass,
  IconNews,
  IconShield,
  IconStar,
  IconStarFilled
} from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ToolLayout from '../../shared/layout/ToolLayout'
import { navigation } from '../../shared/navigation/navigation'
import { homeTools, pinsKey, recentsKey, readShelf, writeShelf } from './shelves'

import { GEAR_PLANNER_STORAGE_KEY, parsePersistedGearPlannerState } from '../gearPlanner/plannerStorage'
import styles from './home.module.css'

const forum = 'https://forums.ddo.com/index.php?forums/announcements.5/'
function News() {
  const [items, setItems] = useState<{ title: string; link: string; date: string }[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        const response = await fetch(forum + 'index.rss', { signal: controller.signal })
        if (!response.ok) return
        const doc = new DOMParser().parseFromString(await response.text(), 'application/xml')
        const entries = [...doc.querySelectorAll('item,entry')]
          .flatMap((el) => {
            const url = el.querySelector('link')?.getAttribute('href') ?? el.querySelector('link')?.textContent
            const title = el.querySelector('title')?.textContent
            if (!title || !url?.startsWith('https://')) return []
            const timestamp = Date.parse(el.querySelector('pubDate,updated')?.textContent ?? '')
            return [
              { title, link: url, date: Number.isFinite(timestamp) ? new Date(timestamp).toLocaleDateString() : '' }
            ]
          })
          .slice(0, 4)
        if (!controller.signal.aborted) setItems(entries)
      } catch {
        /* The official forum link remains available when its feed is offline. */
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void load()
    return () => {
      controller.abort()
    }
  }, [])
  return (
    <Paper component='section' withBorder p='md'>
      <Group justify='space-between'>
        <Title className={styles.panelTitle} order={2} size='h4'>
          <IconNews aria-hidden size={18} />
          DDO announcements
        </Title>
        <Anchor size='sm' href={forum}>
          Official forum ↗
        </Anchor>
      </Group>
      {items.length ? (
        <Stack gap='xs' mt='sm'>
          {items.map((n) => (
            <Group key={n.link} justify='space-between'>
              <Anchor href={n.link}>{n.title}</Anchor>
              <Text size='xs'>{n.date}</Text>
            </Group>
          ))}
        </Stack>
      ) : (
        <Text size='sm' c='dimmed'>
          {loading ? 'Loading announcements…' : 'Visit the official forum for the latest announcements.'}
        </Text>
      )}
    </Paper>
  )
}
function shelfEntries(saved: string[]) {
  return saved.flatMap((entry) => {
    const [raw, title] = entry.split('||')
    const path = raw.startsWith('/') ? raw : '/' + raw
    const tool = homeTools.find((t) => t.path === path)
    return tool ? [{ ...tool, label: title || tool.label }] : []
  })
}

function readActiveSetupName() {
  try {
    const saved = parsePersistedGearPlannerState(JSON.parse(localStorage.getItem(GEAR_PLANNER_STORAGE_KEY) ?? 'null'))
    return saved.setups.find((s) => s.id === saved.activeSetupId)?.name
  } catch {
    return undefined
  }
}
function ContinueLink({ tool, setup }: Readonly<{ tool: { path: string; label: string }; setup?: string }>) {
  return (
    <Anchor className={styles.continueLink} component={Link} to={tool.path}>
      <span>
        Continue {tool.label}
        {setup && (
          <Text component='span' display='block' size='sm' c='dimmed'>
            {setup}
          </Text>
        )}
      </span>
      <IconArrowUpRight aria-hidden size={18} />
    </Anchor>
  )
}
export default function HomePage() {
  const [pins, setPins] = useState(() => readShelf(pinsKey))
  const [recent, setRecent] = useState(() => readShelf(recentsKey))
  function togglePin(id: string) {
    const next = pins.includes(id) ? pins.filter((pin) => pin !== id) : [id, ...pins]
    setPins(next)
    writeShelf(pinsKey, next)
  }
  const recentTools = shelfEntries(recent)
  const latest = recentTools[0]
  const [setup] = useState(() => (latest?.path === '/gear-planner' ? readActiveSetupName() : undefined))
  return (
    <ToolLayout>
      <header className={styles.masthead}>
        <div>
          <Title>YourDDO</Title>
          <Text>Gear planning, crafting, and quest puzzle solvers.</Text>
        </div>
        <IconCompass className={styles.compass} stroke={0.7} aria-hidden />
      </header>
      <div className={styles.dashboard}>
        {latest && (
          <div className={styles.mobileContinue}>
            <ContinueLink tool={latest} setup={setup} />
          </div>
        )}
        <div className={styles.directory}>
          {navigation.map((group) => (
            <section className={styles.category} key={group.label}>
              <Title className={styles.categoryTitle} order={2} size='h3'>
                <group.icon size={21} aria-hidden />
                {group.label}
              </Title>
              <div className={styles.tools}>
                {group.items.map((tool, index) => {
                  const id = tool.path.slice(1),
                    pinned = pins.includes(id)
                  return (
                    <div key={id} className={styles.tool}>
                      <Anchor
                        className={styles.toolLink}
                        component={Link}
                        to={tool.path}
                        aria-label={'Open ' + tool.label}
                      >
                        {group.label === 'Tools' &&
                          (index === 0 ? <IconShield aria-hidden /> : <IconBook2 aria-hidden />)}
                        {tool.label}
                      </Anchor>
                      <ActionIcon
                        variant='subtle'
                        aria-label={(pinned ? 'Unpin ' : 'Pin ') + tool.label}
                        aria-pressed={pinned}
                        onClick={() => {
                          togglePin(id)
                        }}
                      >
                        {pinned ? <IconStarFilled size={16} /> : <IconStar size={16} />}
                      </ActionIcon>
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
        <aside className={styles.sidebar} aria-label='Personal tools and announcements'>
          {['Pinned tools', 'Recent tools'].map((label, i) => {
            const entries = i ? recentTools : shelfEntries(pins)
            return (
              <Paper component='section' key={label} withBorder p='md'>
                <Group justify='space-between'>
                  <Title className={styles.panelTitle} order={2} size='h4'>
                    {i ? <IconClock size={18} aria-hidden /> : <IconStar size={18} aria-hidden />}
                    {label}
                  </Title>
                  {entries.length > 0 && (
                    <Button
                      variant='subtle'
                      size='compact-xs'
                      aria-label={'Clear ' + label.toLowerCase()}
                      onClick={() => {
                        ;(i ? setRecent : setPins)([])
                        writeShelf(i ? recentsKey : pinsKey, [])
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </Group>
                {entries.length ? (
                  <Stack gap={4} mt='sm'>
                    {i === 1 && latest && (
                      <div className={styles.desktopContinue}>
                        <ContinueLink tool={latest} setup={setup} />
                      </div>
                    )}
                    {entries.map((e, index) => (
                      <Group
                        key={e.path}
                        justify='space-between'
                        wrap='nowrap'
                        gap='xs'
                        className={i && index === 0 ? styles.mobileRecentLink : undefined}
                      >
                        <Anchor
                          flex={1}
                          className={styles.shelfLink}
                          component={Link}
                          to={e.path}
                          aria-label={'Open ' + e.label}
                        >
                          {e.label}
                          {i === 1 && <IconArrowUpRight aria-hidden size={15} />}
                        </Anchor>
                        {i === 0 && (
                          <ActionIcon
                            variant='subtle'
                            title={'Unpin ' + e.label}
                            aria-label={'Unpin ' + e.label + ' from shelf'}
                            onClick={() => {
                              togglePin(e.path.slice(1))
                            }}
                          >
                            <IconStarFilled size={16} aria-hidden />
                          </ActionIcon>
                        )}
                      </Group>
                    ))}
                  </Stack>
                ) : (
                  <Text c='dimmed' size='sm'>
                    {i ? 'Tools you visit appear here.' : 'Star a tool below to pin it here.'}
                  </Text>
                )}
              </Paper>
            )
          })}

          <News />
        </aside>
      </div>
    </ToolLayout>
  )
}
