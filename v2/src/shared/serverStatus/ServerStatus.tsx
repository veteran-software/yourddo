import { useState } from 'react'
import { IconActivity, IconChevronRight, IconGhost2Filled } from '@tabler/icons-react'
import { useLegacyStatus, type useServerStatus, type WorldStatus } from './useServerStatus'
import classes from './ServerStatus.module.css'

type Feeds = ReturnType<typeof useServerStatus>

function liveSummary({ worlds, checkedAt, failed }: Feeds['live']) {
  const online = worlds.filter((world) => world.status === 'online').length
  if (failed || worlds.some((world) => world.status === 'unknown'))
    return { count: '—', label: 'Unconfirmed', state: 'unknown' }
  if (!checkedAt) return { count: '…', label: 'Checking', state: 'unknown' }
  if (!worlds.length) return { count: '—', label: 'No worlds listed', state: 'unknown' }
  return {
    count: `${String(online)}/${String(worlds.length)}`,
    label: 'online',
    state: online === worlds.length ? 'online' : 'offline'
  }
}

export function ServerStatusShortcut({
  live,
  onOpen,
  className
}: {
  live: Feeds['live']
  onOpen: () => void
  className: string
}) {
  const { count, label, state } = liveSummary(live)
  const description = `Open server status · ${count} ${label}`
  return (
    <button
      type='button'
      className={`${classes.shortcut} ${className}`}
      aria-label={description}
      title={description}
      onClick={onOpen}
    >
      <IconActivity size={17} aria-hidden data-signal={state} />
      <span>{count}</span>
    </button>
  )
}

function WorldRow({
  name,
  region,
  legacy,
  status
}: Pick<WorldStatus, 'name' | 'region' | 'legacy'> & { status: WorldStatus['status'] | 'checking' }) {
  return (
    <li className={classes.world}>
      <span className={classes.name}>
        {name}
        {region && <small>{region}</small>}
      </span>
      <span className={classes.availability} data-signal={status} data-legacy={legacy || undefined}>
        {legacy ? <IconGhost2Filled size={16} aria-hidden /> : <i aria-hidden />}
        {status}
      </span>
    </li>
  )
}

export default function ServerStatus({ live, preview }: Feeds) {
  const [legacyOpen, setLegacyOpen] = useState(false)
  const legacy = useLegacyStatus(live.legacy, legacyOpen && !live.failed)
  const { count, label, state } = liveSummary(live)
  const previewWorlds = preview.worlds.filter((world) => world.status === 'online')
  return (
    <section id='server-status' aria-labelledby='server-status-heading' tabIndex={-1} className={classes.panel}>
      <header className={classes.heading}>
        <IconActivity size={20} stroke={1.8} aria-hidden />
        <h2 id='server-status-heading'>Server status</h2>
        <span className={classes.summary} data-signal={state} aria-live='polite'>
          {label === 'online' && <b>{count} </b>}
          {label}
        </span>
      </header>
      <div className={classes.body}>
        {live.worlds.length || previewWorlds.length ? (
          <ul className={classes.rows}>
            {live.worlds.map((world) => (
              <WorldRow key={world.name} {...world} />
            ))}
            {previewWorlds.map((world) => (
              <WorldRow key={'preview-' + world.name} {...world} region='Preview' />
            ))}
          </ul>
        ) : null}
        {live.failed ? (
          <p className={classes.meta}>World directory unavailable · Retrying</p>
        ) : (
          live.checkedAt && (
            <p className={classes.meta}>
              Checked{' '}
              <time dateTime={live.checkedAt.toISOString()}>
                {live.checkedAt.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
              </time>
            </p>
          )
        )}
        {live.legacy.length > 0 && (
          <>
            <button
              type='button'
              className={classes.legacyToggle}
              aria-expanded={legacyOpen}
              aria-controls='legacy-server-list'
              onClick={() => {
                setLegacyOpen((open) => !open)
              }}
            >
              <IconGhost2Filled size={17} aria-hidden />
              <span>Legacy servers</span>
              <small>{live.legacy.length}</small>
              <IconChevronRight size={14} aria-hidden className={classes.disclosureIcon} />
            </button>
            <ul aria-label='Legacy servers' id='legacy-server-list' className={classes.rows} hidden={!legacyOpen}>
              {legacyOpen &&
                live.legacy.map((world, index) => (
                  <WorldRow
                    key={world.name}
                    {...world}
                    status={live.failed ? 'unknown' : (legacy?.[index]?.status ?? 'checking')}
                  />
                ))}
            </ul>
          </>
        )}
      </div>
    </section>
  )
}
