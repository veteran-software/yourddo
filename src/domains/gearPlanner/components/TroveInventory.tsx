import {
  Badge,
  Button,
  Checkbox,
  Code,
  FileButton,
  Group,
  Modal,
  SegmentedControl,
  Stack,
  Text,
  Tooltip
} from '@mantine/core'
import { IconCopy, IconFolderOpen, IconUpload } from '@tabler/icons-react'
import { copyText } from '../../../shared/serialization/browser'
import { useMemo, useCallback, useState, type ReactNode, type MouseEvent } from 'react'
import {
  getTroveOwners,
  parseTroveCsv,
  serializeTroveInventory,
  readTroveInventory,
  troveStorageKey,
  type TroveInventory
} from '../trove'

import { importTroveV5 } from '../troveV5'
import { TroveContext, useTroveInventory } from '../troveContext'
export function TroveProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [{ inventory, importedAt }, setSnapshot] = useState<{ inventory: TroveInventory; importedAt?: string }>(() => {
    const saved = readTroveInventory()
    return { inventory: saved, importedAt: saved.importedAt }
  })
  const [ownedOnly, setOwnedOnly] = useState(false)
  const replace = useCallback((next: TroveInventory) => {
    const time = new Date().toISOString()
    setSnapshot({ inventory: next, importedAt: time })
    if (!next.size) setOwnedOnly(false)
    localStorage.setItem(troveStorageKey, serializeTroveInventory(next, time))
  }, [])
  const value = useMemo(
    () => ({ inventory, importedAt, ownedOnly, setOwnedOnly, replace }),
    [inventory, importedAt, ownedOnly, replace]
  )
  return <TroveContext.Provider value={value}>{children}</TroveContext.Provider>
}

export function TroveOwnership({
  name,
  filigree = false,
  inOption = false
}: Readonly<{
  name: string
  filigree?: boolean
  inOption?: boolean
}>) {
  const { inventory } = useTroveInventory()
  const owners = getTroveOwners(inventory, name, filigree)
  if (!owners) return null
  const badge = (
    <Badge component='span' size='xs' variant='light' color='teal' radius='sm'>
      Owned
    </Badge>
  )
  const first = owners[0] ?? 'Location unavailable · reimport Trove to refresh'
  const label = (
    <Group component='span' gap={6} align='baseline' wrap='wrap'>
      {badge}
      <Text component='span' size='xs' style={{ overflowWrap: 'anywhere' }}>
        {first}
      </Text>
    </Group>
  )
  if (owners.length <= 1) return label
  if (inOption)
    return (
      <Stack gap={2}>
        {label}
        <Text size='xs'>{owners.slice(1).join(' · ')}</Text>
      </Stack>
    )
  return (
    <details>
      <summary style={{ cursor: 'pointer' }}>
        <Group component='span' display='inline-flex' gap={6} align='baseline'>
          {label}
          <Text component='span' size='xs' c='dimmed'>
            +{owners.length - 1} more
          </Text>
        </Group>
      </summary>
      <ul style={{ marginBlock: '.25rem', paddingInlineStart: '1.25rem' }}>
        {owners.slice(1).map((owner) => (
          <li key={owner}>
            <Text size='xs'>{owner}</Text>
          </li>
        ))}
      </ul>
    </details>
  )
}

export function OwnedFilter() {
  const { inventory, ownedOnly, setOwnedOnly } = useTroveInventory()
  return inventory.size ? (
    <Checkbox
      size='xs'
      label='Show owned items only'
      checked={ownedOnly}
      onChange={(e) => {
        setOwnedOnly(e.currentTarget.checked)
      }}
    />
  ) : null
}

const pickerInputProps = {
  onClick(event: MouseEvent<HTMLInputElement>) {
    event.currentTarget.value = ''
  }
}

const folderInputProps = { ...pickerInputProps, webkitdirectory: '' }

export function TroveImport({ compact = false }: { compact?: boolean } = {}) {
  const { inventory, importedAt, replace } = useTroveInventory()
  const lastImport = importedAt
    ? 'Last imported ' + new Date(importedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : undefined
  const itemCount =
    inventory.size.toLocaleString() + (inventory.size === 1 ? ' distinct item loaded' : ' distinct items loaded')
  const inventoryStatus = [itemCount, lastImport].filter(Boolean).join(' · ')
  const [opened, setOpened] = useState(false)
  const [copied, setCopied] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [format, setFormat] = useState('Trove v5')
  const close = () => {
    setOpened(false)
  }
  const copyPath = async (server: string, path: string) => {
    try {
      await copyText(path)
      setCopied(server)
    } catch {
      setCopied('')
      setMessage('Select the folder path and copy it manually.')
    }
  }
  const load = async (files: File[]) => {
    if (!files.length) return
    setLoading(true)
    try {
      const { inventory: next, fileCount } =
        format === 'Legacy CSV'
          ? { inventory: await parseTroveCsv(await files[0].text()), fileCount: 1 }
          : await importTroveV5(files)
      try {
        replace(next)
        setMessage(`Inventory updated. Read ${fileCount.toLocaleString()} ${fileCount === 1 ? 'file' : 'files'}.`)
      } catch {
        setMessage('Inventory loaded for this session. Browser storage is unavailable.')
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not read the Trove file.')
    } finally {
      setLoading(false)
    }
  }
  return (
    <>
      <Tooltip label={'Import Trove · ' + inventoryStatus} events={{ hover: true, focus: true, touch: false }}>
        <Button
          size='xs'
          variant='light'
          aria-label='Import Trove'
          color={inventory.size ? 'teal' : undefined}
          aria-description={inventoryStatus}
          leftSection={compact ? undefined : <IconUpload size={16} aria-hidden />}
          onClick={() => {
            setMessage('')
            setCopied('')
            setOpened(true)
          }}
        >
          {compact ? <IconUpload size={16} /> : 'Import Trove'}
        </Button>
      </Tooltip>
      <Modal opened={opened} onClose={close} title='DH Trove Import' centered size='lg'>
        <Stack gap='md'>
          {lastImport && (
            <Text size='sm' c='dimmed'>
              {lastImport}
            </Text>
          )}
          <SegmentedControl
            aria-label='Trove format'
            data={['Trove v5', 'Legacy CSV']}
            value={format}
            disabled={loading}
            onChange={(value) => {
              setFormat(value)
              setMessage('')
            }}
          />
          {format === 'Trove v5' ? (
            <>
              <Text size='sm'>
                Choose your server folder, such as <Code>Shadowdale</Code>. YourDDO reads inventory and bank snapshots
                in its subfolders automatically.
              </Text>
              <Group gap='xs'>
                <FileButton
                  multiple
                  disabled={loading}
                  inputProps={folderInputProps}
                  onChange={(files) => void load(files)}
                >
                  {(props) => (
                    <Button {...props} loading={loading} leftSection={<IconFolderOpen size={16} aria-hidden />}>
                      Choose server folder
                    </Button>
                  )}
                </FileButton>
                <FileButton
                  multiple
                  disabled={loading}
                  accept='.json,application/json'
                  inputProps={pickerInputProps}
                  onChange={(files) => void load(files)}
                >
                  {(props) => (
                    <Button {...props} disabled={loading} variant='default'>
                      Select JSON files
                    </Button>
                  )}
                </FileButton>
              </Group>
            </>
          ) : (
            <>
              <Text size='sm'>
                Choose <Code>TroveExport.Inventory.csv</Code> from your server folder. If you only see{' '}
                <Code>TroveExport.csv</Code>, update Dungeon Helper Trove and export your inventory again.
              </Text>
              <Group>
                <FileButton
                  disabled={loading}
                  accept='.csv,text/csv'
                  inputProps={pickerInputProps}
                  onChange={(file) => void load(file ? [file] : [])}
                >
                  {(props) => (
                    <Button {...props} loading={loading} leftSection={<IconUpload size={16} aria-hidden />}>
                      Upload DH Trove CSV
                    </Button>
                  )}
                </FileButton>
              </Group>
            </>
          )}
          {message && (
            <Text size='sm' role='status'>
              {message}
            </Text>
          )}
          <Text size='sm' c='dimmed'>
            {inventory.size ? `${inventory.size.toLocaleString()} distinct items loaded. ` : ''}Your inventory stays in
            this browser. Each import replaces the current inventory.
          </Text>
          {opened && inventory.size > 0 && !inventory.values().some((owners) => owners.length > 0) && (
            <Text size='sm'>Reimport your Trove files to add owner details to this inventory.</Text>
          )}
          <Text size='sm' fw={600}>
            Server folders
          </Text>
          <Stack gap='sm'>
            {['Shadowdale', 'Thrane', 'Cormyr', 'Moonsea'].map((server) => {
              const path = `%APPDATA%\\Dungeon Helper\\plugins\\Trove\\${server}`
              return (
                <Group key={server} wrap='nowrap' gap='xs' align='center'>
                  <Stack gap={2} flex={1} miw={0}>
                    <Text size='sm' fw={600}>
                      {server}
                    </Text>
                    <Code style={{ overflowWrap: 'anywhere' }}>{path}</Code>
                  </Stack>
                  <Button
                    size='compact-sm'
                    variant='subtle'
                    aria-label={`Copy ${server} path`}
                    leftSection={<IconCopy size={14} aria-hidden />}
                    onClick={() => void copyPath(server, path)}
                  >
                    {copied === server ? 'Copied' : 'Copy'}
                  </Button>
                </Group>
              )
            })}
          </Stack>
          <Group justify='flex-end'>
            <Button size='sm' variant='default' onClick={close}>
              Close
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}
