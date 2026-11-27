import { Button, Checkbox, Group, Paper, ScrollArea, Stack, Text, TextInput } from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'
import { useState } from 'react'
import type { TroveEquippedItem } from '../troveV5'

export default function TroveEquippedPicker({
  rows,
  onCancel,
  onConfirm
}: Readonly<{
  rows: readonly TroveEquippedItem[]
  onCancel: () => void
  onConfirm: (selected: readonly TroveEquippedItem[]) => void
}>) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<ReadonlySet<string>>(() => new Set())
  const grouped = Map.groupBy(rows, ({ character }) => character.toLowerCase())
  const characters = [...grouped]
    .filter(([key]) => key !== '')
    .sort(([, a], [, b]) => a[0].character.localeCompare(b[0].character))
  const visible = characters.filter(([key]) => key.includes(query.trim().toLowerCase()))
  const selectedCount = characters.filter(([key]) => selected.has(key)).length

  return (
    <Stack gap='md'>
      <Text size='sm' c='dimmed'>
        Your Trove inventory is imported. Choose which characters to turn into Equipped setups.
      </Text>
      {characters.length > 0 && (
        <>
          <TextInput
            aria-label='Search Trove characters'
            placeholder='Search characters'
            leftSection={<IconSearch size={16} aria-hidden />}
            value={query}
            onChange={(event) => {
              setQuery(event.currentTarget.value)
            }}
          />
          <Group justify='space-between' gap='xs'>
            <Text size='xs' c='dimmed'>
              {characters.length} {characters.length === 1 ? 'character' : 'characters'} with equipped gear
            </Text>
            <Text size='xs' fw={600} role='status'>
              {selectedCount} selected
            </Text>
          </Group>
          <Paper withBorder>
            <ScrollArea.Autosize mah='min(38dvh, 20rem)' offsetScrollbars>
              <Stack gap='sm' p='sm' role='group' aria-label='Trove characters'>
                {visible.map(([key, items]) => (
                  <Checkbox
                    key={key}
                    label={items[0].character}
                    description={String(items.length) + (items.length === 1 ? ' equipped item' : ' equipped items')}
                    checked={selected.has(key)}
                    onChange={(event) => {
                      const checked = event.currentTarget.checked
                      setSelected((previous) => {
                        const next = new Set(previous)
                        if (checked) next.add(key)
                        else next.delete(key)
                        return next
                      })
                    }}
                  />
                ))}
                {!visible.length && (
                  <Text size='sm' c='dimmed'>
                    No characters match your search.
                  </Text>
                )}
              </Stack>
            </ScrollArea.Autosize>
          </Paper>
        </>
      )}
      {grouped.has('') && (
        <Text size='xs' c='dimmed'>
          Some equipped items have no character name in the export.
        </Text>
      )}
      <Group justify='flex-end' gap='xs'>
        <Button variant='default' onClick={onCancel}>
          Skip setup creation
        </Button>
        <Button
          disabled={!selectedCount}
          onClick={() => {
            onConfirm(characters.flatMap(([key, items]) => (selected.has(key) ? items : [])))
          }}
        >
          {selectedCount
            ? 'Create ' + String(selectedCount) + (selectedCount === 1 ? ' setup' : ' setups')
            : 'Create setups'}
        </Button>
      </Group>
    </Stack>
  )
}
