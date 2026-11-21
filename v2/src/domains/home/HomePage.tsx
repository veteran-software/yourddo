import { ActionIcon, Anchor, Button, Group, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import { IconStar, IconStarFilled } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ToolLayout from '../../shared/layout/ToolLayout'
import { navigation } from '../../shared/navigation/navigation'
import { homeTools, pinsKey, recentsKey, readShelf, writeShelf } from './shelves'

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
        <Title order={2} size='h3'>
          DDO announcements
        </Title>
        <Anchor href={forum}>Official forum ↗</Anchor>
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
export default function HomePage() {
  const [pins, setPins] = useState(() => readShelf(pinsKey))
  const [recent, setRecent] = useState(() => readShelf(recentsKey))
  return (
    <ToolLayout>
      <Title>YourDDO</Title>
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        {['Pinned tools', 'Recent tools'].map((label, i) => {
          const entries = (i ? recent : pins).flatMap((entry) => {
            const [raw, title] = entry.split('||')
            const path = raw.startsWith('/') ? raw : '/' + raw
            const tool = homeTools.find((t) => t.path === path)
            return tool ? [{ ...tool, label: title || tool.label }] : []
          })
          return (
            <Paper component='section' key={label} withBorder p='md'>
              <Group justify='space-between'>
                <Title order={2} size='h3'>
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
                <Stack gap='xs' mt='sm'>
                  {entries.map((e) => (
                    <Anchor key={e.path} component={Link} to={e.path} aria-label={'Open ' + e.label}>
                      {e.label}
                    </Anchor>
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
      </SimpleGrid>
      {navigation.map((group) => (
        <section key={group.label}>
          <Title order={2} size='h3' mb='xs'>
            {group.label}
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
            {group.items.map((tool) => {
              const id = tool.path.slice(1),
                pinned = pins.includes(id)
              return (
                <Paper key={id} withBorder p='sm'>
                  <Group wrap='nowrap' justify='space-between'>
                    <Anchor component={Link} to={tool.path} aria-label={'Open ' + tool.label}>
                      {tool.label}
                    </Anchor>
                    <ActionIcon
                      variant='subtle'
                      aria-label={(pinned ? 'Unpin ' : 'Pin ') + tool.label}
                      aria-pressed={pinned}
                      onClick={() => {
                        const next = pinned ? pins.filter((p) => p !== id) : [id, ...pins]
                        setPins(next)
                        writeShelf(pinsKey, next)
                      }}
                    >
                      {pinned ? <IconStarFilled size={16} /> : <IconStar size={16} />}
                    </ActionIcon>
                  </Group>
                </Paper>
              )
            })}
          </SimpleGrid>
        </section>
      ))}
      <News />
    </ToolLayout>
  )
}
