import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Badge, Button, Card, Col, Container, Dropdown, Row, Stack } from 'react-bootstrap'
import {
  FaArrowRight,
  FaArrowUpRightFromSquare,
  FaBookOpen,
  FaDiscord,
  FaGithub,
  FaListCheck,
  FaPuzzlePiece,
  FaRegStar,
  FaRss,
  FaShieldHalved,
  FaStar,
  FaToolbox,
  FaWandMagicSparkles
} from 'react-icons/fa6'
import { Link } from 'react-router-dom'
import {
  decodeRecentToolEntry,
  FAVORITE_TOOLS_STORAGE_KEY,
  readStorageList,
  RECENT_TOOLS_STORAGE_KEY,
  recordRecentToolPath,
  writeStorageList
} from './home/homeShelf.ts'
import './Home.scss'

interface ToolCard {
  id: string
  title: string
  description: string
  to: string
  icon: ReactNode
  actionLabel?: string
  actions?: { label: string; to: string }[]
  tone: ToolTone
}

interface ToolGroup {
  title: string
  description: string
  tools: ToolCard[]
  tone: ToolTone
  eyebrow: string
}

interface ToolShelfItem extends ToolCard {
  group: string
}

interface RecentToolItem extends ToolShelfItem {
  displayTitle: string
}

type ToolTone = 'blue' | 'gold' | 'green'

interface FeedItem {
  title: string
  link: string
  published?: string
  summary?: string
}

const OFFICIAL_NEWS_FEED_URL = 'https://forums.ddo.com/index.php?forums/announcements.5/index.rss'
const OFFICIAL_NEWS_FORUM_URL = 'https://forums.ddo.com/index.php?forums/announcements.5/'

const readText = (parent: ParentNode, selector: string): string | undefined => {
  const node = parent.querySelector(selector)
  if (!node) return undefined

  const text = node.textContent ? node.textContent.trim() : ''
  return text && text.length > 0 ? text : undefined
}

const readAttr = (parent: ParentNode, selector: string, attr: string): string | undefined => {
  const node = parent.querySelector(selector)
  if (!node) return undefined

  const rawValue = node.getAttribute(attr)
  const value = rawValue ? rawValue.trim() : ''
  return value && value.length > 0 ? value : undefined
}

const groups: ToolGroup[] = [
  {
    tone: 'blue',
    eyebrow: 'Fast access',
    title: 'Start here',
    description: 'The pages most people need first when they are planning a character or checking progress.',
    tools: [
      {
        id: 'gear-planner',
        title: 'Gear Planner',
        description: 'Plan sets, augments, filigrees, and item conflicts in one place.',
        to: '/gear-planner',
        icon: <FaShieldHalved />,
        tone: 'blue',
        actionLabel: 'Open planner'
      },
      {
        id: 'saga-tracker',
        title: 'Saga Tracker',
        description: 'Track quests, turn-ins, and completed saga runs without juggling notes.',
        to: '/saga-tracker',
        icon: <FaListCheck />,
        tone: 'blue',
        actionLabel: 'Open tracker'
      },
      {
        id: 'essence-crafting',
        title: 'Essence Crafting',
        description: 'Work through crafting recipes, augment options, and upgrade paths.',
        to: '/essence-crafting',
        icon: <FaWandMagicSparkles />,
        tone: 'blue',
        actionLabel: 'Open crafting'
      },
      {
        id: 'reavers-fate',
        title: 'Puzzle Solvers',
        description: 'Jump into the puzzle helpers for fast in-run solving support.',
        to: '/reavers-fate',
        icon: <FaPuzzlePiece />,
        tone: 'blue',
        actionLabel: 'Open solver',
        actions: [
          { label: "Reaver's Fate", to: '/reavers-fate' },
          { label: 'Monastery of the Scorpion', to: '/monastery-of-the-scorpion' },
          { label: 'The Shadow Crypt', to: '/the-shadow-crypt' },
          { label: 'The Shroud', to: '/the-shroud' },
          { label: 'Total Chaos', to: '/total-chaos' },
          { label: 'The Key to the Mythal', to: '/the-key-to-the-mythal' }
        ]
      }
    ]
  },
  {
    tone: 'gold',
    eyebrow: 'Deep crafting',
    title: 'Crafting systems',
    description: 'Specialized planners for the deeper crafting systems that benefit from a dedicated reference.',
    tools: [
      {
        id: 'green-steel',
        title: 'Heroic Green Steel',
        description: 'Build Heroic Green Steel recipes and compare ingredient requirements.',
        to: '/green-steel',
        icon: <FaToolbox />,
        tone: 'gold'
      },
      {
        id: 'legendary-green-steel',
        title: 'Legendary Green Steel',
        description: 'Compare Legendary Green Steel recipes, tiers, and materials.',
        to: '/legendary-green-steel',
        icon: <FaToolbox />,
        tone: 'gold'
      },
      {
        id: 'dinosaur-bone',
        title: 'Dinosaur Bone Crafting',
        description: 'Browse Dinosaur Bone ingredients, item options, and upgrade paths.',
        to: '/dinosaur-bone',
        icon: <FaToolbox />,
        tone: 'gold'
      },
      {
        id: 'nearly-finished',
        title: 'Nearly Finished',
        description: 'Review reforging and item upgrade paths without digging through spreadsheets.',
        to: '/nearly-finished',
        icon: <FaBookOpen />,
        tone: 'gold'
      }
    ]
  },
  {
    tone: 'green',
    eyebrow: 'References',
    title: 'Reference tools',
    description: 'Smaller utilities for item planning, upgrade experimentation, and niche crafting workflows.',
    tools: [
      {
        id: 'cauldron-of-cadence',
        title: 'Cauldron of Cadence',
        description: 'Look up item effects and set bonus associations quickly.',
        to: '/cauldron-of-cadence',
        icon: <FaBookOpen />,
        tone: 'green'
      },
      {
        id: 'incredible-potential',
        title: 'Incredible Potential',
        description: 'Plan item upgrades, material requirements, and resulting outcomes.',
        to: '/incredible-potential',
        icon: <FaBookOpen />,
        tone: 'green'
      },
      {
        id: 'viktranium-experiment',
        title: 'Viktranium Experiment',
        description: 'Work through the Viktranium crafting system and item choices.',
        to: '/viktranium-experiment',
        icon: <FaWandMagicSparkles />,
        tone: 'green'
      },
      {
        id: 'total-chaos',
        title: 'Total Chaos',
        description: 'Use the puzzle helper for the Total Chaos solution path.',
        to: '/total-chaos',
        icon: <FaPuzzlePiece />,
        tone: 'green'
      }
    ]
  }
]

const allTools: ToolShelfItem[] = groups.flatMap((group) =>
  group.tools.map((tool) => ({ ...tool, group: group.title }))
)

const recentLabelOverrides: Record<string, string> = {
  '/reavers-fate': "Reaver's Fate"
}

const resolveRecentToolTitle = (pathname: string, label: string | undefined, defaultTitle: string) => {
  if (typeof label === 'string' && label.length > 0) {
    return label
  }

  const overrideTitle = recentLabelOverrides[pathname]
  if (typeof overrideTitle === 'string' && overrideTitle.length > 0) {
    return overrideTitle
  }

  return defaultTitle
}

const recentToolCatalog: Record<
  string,
  {
    title: string
    description: string
    group: string
    icon: ReactNode
    tone: ToolTone
  }
> = {
  '/monastery-of-the-scorpion': {
    title: 'Monastery of the Scorpion',
    description: 'Solve the Monastery of the Scorpion puzzle with the YourDDO helper.',
    group: 'Puzzle Solvers',
    icon: <FaPuzzlePiece />,
    tone: 'blue'
  },
  '/the-shadow-crypt': {
    title: 'The Shadow Crypt',
    description: 'Solve The Shadow Crypt puzzle with the YourDDO helper.',
    group: 'Puzzle Solvers',
    icon: <FaPuzzlePiece />,
    tone: 'blue'
  },
  '/the-shroud': {
    title: 'The Shroud',
    description: 'Solve The Shroud puzzle with the YourDDO helper.',
    group: 'Puzzle Solvers',
    icon: <FaPuzzlePiece />,
    tone: 'blue'
  },
  '/the-key-to-the-mythal': {
    title: 'The Key to the Mythal',
    description: "Use the Reaver's Fate puzzle helper for quicker DDO puzzle solving.",
    group: 'Puzzle Solvers',
    icon: <FaPuzzlePiece />,
    tone: 'blue'
  }
}

const ToolTile = ({
  id,
  title,
  description,
  to,
  icon,
  actionLabel = 'Open',
  actions,
  tone,
  onToggleFavorite,
  isFavorite,
  onOpen
}: ToolCard & {
  onToggleFavorite: (toolId: string) => void
  isFavorite: boolean
  onOpen: (pathname: string, label?: string) => void
}) => (
  <Card className={`home-tool-tile home-tool-tile--${tone} h-100 border-0`}>
    <Card.Body className='d-flex flex-column gap-3'>
      <div className='d-flex align-items-start justify-content-between gap-2'>
        <div className='home-tool-icon' aria-hidden='true'>
          {icon}
        </div>
        <Button
          type='button'
          variant='link'
          className={`home-favorite-button ${isFavorite ? 'is-favorite' : ''}`}
          onClick={() => {
            onToggleFavorite(id)
          }}
          aria-label={isFavorite ? `Remove ${title} from favorites` : `Add ${title} to favorites`}
          title={isFavorite ? 'Unpin tool' : 'Pin tool'}
        >
          {isFavorite ? <FaStar /> : <FaRegStar />}
        </Button>
      </div>
      <div>
        <Card.Title as='h3' className='home-tool-title mb-1'>
          {title}
        </Card.Title>
        <Card.Text className='home-tool-copy mb-0'>{description}</Card.Text>
      </div>
      <div className='mt-auto'>
        {actions && actions.length > 0 ? (
          <Dropdown className='home-tool-dropdown w-100'>
            <Dropdown.Toggle className='home-tool-button w-100' variant='primary'>
              {actionLabel}
            </Dropdown.Toggle>
            <Dropdown.Menu className='w-100'>
              {actions.map((action) => (
                <Dropdown.Item
                  key={action.to}
                  as={Link}
                  to={action.to}
                  onClick={() => {
                    onOpen(action.to, action.label)
                  }}
                >
                  {action.label}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        ) : (
          <Link
            to={to}
            className='btn btn-primary home-tool-button w-100'
            onClick={() => {
              onOpen(to)
            }}
          >
            {actionLabel}
            <FaArrowRight className='ms-2' />
          </Link>
        )}
      </div>
    </Card.Body>
  </Card>
)

const getShelfItemTitle = (item: ToolShelfItem | RecentToolItem) => {
  return 'displayTitle' in item ? item.displayTitle : item.title
}

const ShelfPanel = ({
  title,
  items,
  emptyTitle,
  emptyText,
  clearLabel,
  onClear,
  onToggleFavorite,
  onOpen
}: {
  title: string
  items: (ToolShelfItem | RecentToolItem)[]
  emptyTitle: string
  emptyText: string
  clearLabel?: string
  onClear?: () => void
  onToggleFavorite?: (toolId: string) => void
  onOpen: (pathname: string) => void
}) => (
  <section className='home-hero-shelf'>
    <div className='home-hero-shelf-header'>
      <span className='home-section-kicker'>{title}</span>
      {onClear ? (
        <Button type='button' variant='outline-secondary' size='sm' className='home-hero-shelf-clear' onClick={onClear}>
          {clearLabel ?? 'Clear'}
        </Button>
      ) : null}
    </div>

    {items.length > 0 ? (
      <div className='home-hero-shelf-list'>
        {items.map((item) => (
          <div key={item.id} className='home-hero-shelf-item'>
            <div className='home-hero-shelf-item-main'>
              <div className='home-hero-shelf-item-head'>
                <strong>{getShelfItemTitle(item)}</strong>
              </div>
            </div>
            <div className='home-hero-shelf-item-actions'>
              <Link
                to={item.to}
                className='btn btn-sm btn-primary home-hero-shelf-open'
                onClick={() => {
                  onOpen(item.to)
                }}
              >
                Open
              </Link>
              {onToggleFavorite ? (
                <Button
                  type='button'
                  size='sm'
                  variant='outline-secondary'
                  onClick={() => {
                    onToggleFavorite(item.id)
                  }}
                >
                  Unpin
                </Button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className='home-hero-shelf-empty'>
        <strong>{emptyTitle}</strong>
        <span>{emptyText}</span>
      </div>
    )}
  </section>
)

const parseFeed = (xmlText: string): FeedItem[] => {
  const parser = new DOMParser()
  const document = parser.parseFromString(xmlText, 'application/xml')
  const parseError = document.querySelector('parsererror')

  if (parseError) {
    return []
  }

  const rssItems = Array.from(document.querySelectorAll('channel > item')).slice(0, 4)
  if (rssItems.length > 0) {
    return rssItems.map((item) => ({
      title: readText(item, 'title') ?? 'Untitled update',
      link: readText(item, 'link') ?? OFFICIAL_NEWS_FORUM_URL,
      published: readText(item, 'pubDate'),
      summary: readText(item, 'description')
    }))
  }

  const atomItems = Array.from(document.querySelectorAll('entry')).slice(0, 4)
  return atomItems.map((entry) => ({
    title: readText(entry, 'title') ?? 'Untitled update',
    link:
      readAttr(entry, 'link[rel="alternate"]', 'href') ?? readAttr(entry, 'link', 'href') ?? OFFICIAL_NEWS_FORUM_URL,
    published: readText(entry, 'updated') ?? readText(entry, 'published'),
    summary: readText(entry, 'summary')
  }))
}

const formatFeedDate = (published?: string) => {
  if (!published) return ''

  const date = new Date(published)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric'
  }).format(date)
}

const NewsFeed = () => {
  const [items, setItems] = useState<FeedItem[]>([])
  const [error, setError] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    fetch(OFFICIAL_NEWS_FEED_URL, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`RSS request failed: ${String(response.status)}`)
        }

        return response.text()
      })
      .then((xmlText) => {
        const parsed = parseFeed(xmlText)
        if (parsed.length > 0) {
          setItems(parsed)
          setError(false)
          return
        }

        setError(true)
      })
      .catch(() => {
        setError(true)
      })

    return () => {
      controller.abort()
    }
  }, [])

  const visibleItems = useMemo(() => items.slice(0, 3), [items])

  return (
    <section className='home-news-band'>
      <Container>
        <div className='home-news-shell'>
          <div className='home-news-heading'>
            <div className='d-flex align-items-center gap-2 flex-wrap'>
              <span className='home-eyebrow'>Official news</span>
              <Badge bg='secondary' className='home-news-badge'>
                <FaRss className='me-1' />
                DDO forums
              </Badge>
            </div>
            <h2 className='home-section-title mb-2'>Recent launcher and forum updates</h2>
            <p className='home-section-copy mb-0'>
              Pulled from the official announcements area when the feed is available, with a direct link as fallback.
            </p>
          </div>

          <div className='home-news-list'>
            {visibleItems.length > 0 ? (
              visibleItems.map((item) => (
                <a
                  key={`${item.title}-${item.link}`}
                  href={item.link}
                  target='_blank'
                  rel='noreferrer'
                  className='home-news-item'
                >
                  <div className='home-news-item-top'>
                    <strong>{item.title}</strong>
                    {item.published ? <span>{formatFeedDate(item.published)}</span> : null}
                  </div>
                  {item.summary ? <div className='home-news-summary'>{item.summary}</div> : null}
                </a>
              ))
            ) : (
              <>
                <a href={OFFICIAL_NEWS_FORUM_URL} target='_blank' rel='noreferrer' className='home-news-item'>
                  <div className='home-news-item-top'>
                    <strong>Official DDO announcements</strong>
                    <span>Live source</span>
                  </div>
                  <div className='home-news-summary'>
                    The official forums host the latest announcements and service updates.
                  </div>
                </a>
                <a href={OFFICIAL_NEWS_FORUM_URL} target='_blank' rel='noreferrer' className='home-news-item'>
                  <div className='home-news-item-top'>
                    <strong>Latest news feed</strong>
                    <span>{error ? 'Fallback link' : 'Loading feed'}</span>
                  </div>
                  <div className='home-news-summary'>
                    If the RSS endpoint is available, the home page will show the newest launcher posts here.
                  </div>
                </a>
              </>
            )}
          </div>
        </div>
      </Container>
    </section>
  )
}

const useHomeShelf = () => {
  const [recentEntries, setRecentEntries] = useState<string[]>(() => readStorageList(RECENT_TOOLS_STORAGE_KEY))
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => readStorageList(FAVORITE_TOOLS_STORAGE_KEY))

  const recentTools = useMemo(
    () =>
      recentEntries
        .map((entry) => {
          const { pathname, label } = decodeRecentToolEntry(entry)
          const tool = allTools.find((candidate) => candidate.to === pathname || candidate.id === pathname)
          if (tool) {
            return {
              ...tool,
              displayTitle: resolveRecentToolTitle(pathname, label, tool.title)
            }
          }

          const recentTool = Object.entries(recentToolCatalog).find(([key]) => key === pathname)?.[1]
          if (recentTool == null) return null

          return {
            id: pathname,
            to: pathname,
            title: recentTool.title,
            displayTitle: resolveRecentToolTitle(pathname, label, recentTool.title),
            description: recentTool.description,
            group: recentTool.group,
            icon: recentTool.icon,
            tone: recentTool.tone
          }
        })
        .filter((tool): tool is RecentToolItem => tool != null),
    [recentEntries]
  )

  const favoriteTools = useMemo(
    () =>
      favoriteIds
        .map((id) => allTools.find((tool) => tool.id === id))
        .filter((tool): tool is ToolShelfItem => tool != null),
    [favoriteIds]
  )

  const openTool = (pathname: string, label?: string) => {
    const nextEntry = label ? `${pathname}||${label}` : pathname
    const nextRecent = [
      nextEntry,
      ...recentEntries.filter((entry) => decodeRecentToolEntry(entry).pathname !== pathname)
    ].slice(0, 5)
    setRecentEntries(nextRecent)
    recordRecentToolPath(pathname, label)
  }

  const clearRecentTools = () => {
    setRecentEntries([])
    writeStorageList(RECENT_TOOLS_STORAGE_KEY, [])
  }

  const toggleFavorite = (toolId: string) => {
    const nextFavorites = favoriteIds.includes(toolId)
      ? favoriteIds.filter((id) => id !== toolId)
      : [toolId, ...favoriteIds]

    setFavoriteIds(nextFavorites)
    writeStorageList(FAVORITE_TOOLS_STORAGE_KEY, nextFavorites)
  }

  const clearFavorites = () => {
    setFavoriteIds([])
    writeStorageList(FAVORITE_TOOLS_STORAGE_KEY, [])
  }

  return {
    clearFavorites,
    clearRecentTools,
    favoriteTools,
    isFavorite: (toolId: string) => favoriteIds.includes(toolId),
    openTool,
    recentTools,
    toggleFavorite
  }
}

const Home = () => {
  const shelf = useHomeShelf()

  return (
    <main className='home-page'>
      <Container fluid className='px-0'>
        <section className='home-hero'>
          <Container>
            <Row className='align-items-stretch g-4'>
              <Col lg={7} xl={6} className='d-flex'>
                <Stack gap={3} className='home-hero-copy home-hero-panel'>
                  <div className='d-flex flex-wrap gap-2 align-items-center home-kicker-row'>
                    <span className='home-eyebrow'>YourDDO</span>
                    <span className='home-badge'>crafting tools</span>
                    <span className='home-badge'>gear planning</span>
                    <span className='home-badge'>puzzle solvers</span>
                  </div>

                  <div>
                    <h1 className='home-title mb-3'>One place for planning, tracking, and solving.</h1>
                    <p className='home-lead mb-0'>Jump from the front page into the tool that matters right now.</p>
                  </div>

                  <div className='d-flex flex-wrap gap-2 home-action-row'>
                    <Link to='/gear-planner' className='btn btn-primary btn-lg home-primary-action'>
                      Gear Planner
                    </Link>
                    <Link to='/saga-tracker' className='btn btn-outline-primary btn-lg home-secondary-action'>
                      Saga Tracker
                    </Link>
                    <a href='#tool-groups' className='btn btn-outline-primary btn-lg home-secondary-action'>
                      Browse all tools
                    </a>
                  </div>

                  <div className='home-stat-row'>
                    <div className='home-stat-card'>
                      <span>Groups</span>
                      <strong>{String(groups.length)}</strong>
                    </div>
                    <div className='home-stat-card'>
                      <span>Tools</span>
                      <strong>{String(groups.reduce((count, group) => count + group.tools.length, 0))}</strong>
                    </div>
                    <div className='home-stat-card'>
                      <span>News</span>
                      <strong>Live feed</strong>
                    </div>
                  </div>

                  <div className='home-hero-footer'>
                    <div className='home-utility-links d-flex flex-wrap align-items-center'>
                      <a
                        href='https://github.com/veteran-software/yourddo'
                        target='_blank'
                        rel='noreferrer'
                        className='home-utility-link'
                      >
                        <FaGithub className='me-2' />
                        GitHub
                        <FaArrowUpRightFromSquare className='ms-2 home-link-icon' />
                      </a>
                      <a
                        href='https://discord.gg/jk3hYA5Jgv'
                        target='_blank'
                        rel='noreferrer'
                        className='home-utility-link'
                      >
                        <FaDiscord className='me-2' />
                        Discord
                        <FaArrowUpRightFromSquare className='ms-2 home-link-icon' />
                      </a>
                    </div>
                  </div>
                </Stack>
              </Col>

              <Col lg={5} xl={6} className='d-flex'>
                <div className='home-hero-shelf-stack home-hero-panel'>
                  <ShelfPanel
                    title='Recent tools'
                    items={shelf.recentTools}
                    emptyTitle='No recent tools yet'
                    emptyText='Open any tool and it will appear here.'
                    clearLabel='Clear recents'
                    onClear={shelf.clearRecentTools}
                    onOpen={shelf.openTool}
                  />

                  <ShelfPanel
                    title='Pinned tools'
                    items={shelf.favoriteTools}
                    emptyTitle='No favorites yet'
                    emptyText='Use the star on any tool card to pin it here.'
                    clearLabel='Clear pins'
                    onClear={shelf.clearFavorites}
                    onToggleFavorite={shelf.toggleFavorite}
                    onOpen={shelf.openTool}
                  />
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        <NewsFeed />
        <section className='home-section' id='tool-groups'>
          <Container>
            {groups.map((group) => (
              <div key={group.title} className={`home-group home-group--${group.tone}`}>
                <div className='home-group-header'>
                  <div>
                    <span className='home-section-kicker'>{group.eyebrow}</span>
                    <h2 className='home-section-title mb-2'>{group.title}</h2>
                    <p className='home-section-copy mb-0'>{group.description}</p>
                  </div>
                </div>

                <Row className='g-3 g-xl-4'>
                  {group.tools.map((tool) => (
                    <Col key={tool.title} sm={6} xl={3}>
                      <ToolTile
                        {...tool}
                        isFavorite={shelf.isFavorite(tool.id)}
                        onOpen={shelf.openTool}
                        onToggleFavorite={shelf.toggleFavorite}
                      />
                    </Col>
                  ))}
                </Row>
              </div>
            ))}
          </Container>
        </section>
      </Container>
    </main>
  )
}

export default Home
