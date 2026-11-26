import { useState } from 'react'
import { Button, Group, Modal, Stack, Text, TextInput, UnstyledButton } from '@mantine/core'
import { IconArrowLeft, IconCheck, IconChevronRight, IconSearch } from '@tabler/icons-react'
import { bonusLabel, objectiveCategory, spellObjective } from '../statObjectives'
import css from './UpgradePaths.module.css'

function objectiveLabel(name: string) {
  return name.replace(/^skill:\s*/i, '')
}

function groupStats(matches: readonly string[], category: string) {
  const families = new Map<string, { name: string; subtype: string }[]>()
  const statsRows: string[] = []
  for (const name of matches) {
    const spell = category === 'Spellcasting' ? spellObjective(name) : null
    if (spell) {
      const members = families.get(spell.family)
      const member = { name, subtype: spell.subtype }
      if (members) members.push(member)
      else families.set(spell.family, [member])
    } else {
      statsRows.push(name)
    }
  }
  return { families, statsRows }
}

function backLabel(chosen: string | null, family: string) {
  if (chosen) return family ? 'Back to ' + family : 'Back to stats'
  return family ? 'Back to Spellcasting' : 'All categories'
}

export default function StatObjectivePicker({
  stats,
  equipped,
  value,
  bonus,
  focus = false,
  verbatim = false,
  onSelect
}: Readonly<{
  stats: ReadonlyMap<string, ReadonlySet<string>>
  equipped: ReadonlySet<string>
  value: string | null
  bonus?: string
  focus?: boolean
  verbatim?: boolean
  onSelect: (name: string, bonus?: string) => void
}>) {
  const label = verbatim ? (name: string) => name : objectiveLabel
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  const [family, setFamily] = useState('')
  const [chosen, setChosen] = useState<string | null>(null)
  const categories = [
    'Equipped stats',
    'Ability scores',
    'Defenses',
    'Combat',
    'Spellcasting',
    'Skills',
    'Other effects'
  ]
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const names = [...stats.keys()]
  const inCategory = (name: string, c: string) =>
    c === 'Equipped stats' ? equipped.has(name.toLowerCase()) : objectiveCategory(name) === c
  const matches = names.filter(
    (name) => (!category || inCategory(name, category)) && words.every((word) => name.toLowerCase().includes(word))
  )
  const { families, statsRows } = groupStats(matches, category)
  // Keep the spell groups together before the individually selectable stats.
  const rows = [...families.keys()].sort((left, right) => left.localeCompare(right)).concat(statsRows)
  const members = (families.get(family) ?? []).toSorted((a, b) => a.subtype.localeCompare(b.subtype))
  const selectedBonus = bonus ? bonusLabel(bonus) : 'All bonus types'
  function pick(name: string, type?: string) {
    onSelect(name, type)
    setOpen(false)
  }
  function back() {
    if (chosen) {
      setChosen(null)
    } else if (family) {
      setFamily('')
    } else {
      setQuery('')
      setCategory('')
      setPage(0)
    }
  }
  const placeholder = focus ? 'Add focus stat' : 'Choose a stat'
  return (
    <div>
      <Text size='sm' fw={500}>
        {focus ? 'Focus stats' : 'Stat objective'}
      </Text>
      <Button
        fullWidth
        justify='space-between'
        variant='default'
        rightSection={<IconChevronRight size={16} />}
        onClick={() => {
          setCategory('')
          setQuery('')
          setPage(0)
          setChosen(null)
          setFamily('')
          setOpen(true)
        }}
      >
        {value ? label(value) + ' · ' + selectedBonus : placeholder}
      </Button>
      <Modal
        opened={open}
        onClose={() => {
          setOpen(false)
        }}
        title={chosen ? 'Choose bonus type' : family || 'Choose a stat'}
        size='lg'
        centered
      >
        {open && (
          <Stack gap='sm'>
            {(chosen !== null || category.length > 0 || words.length > 0) && (
              <Button
                variant='subtle'
                size='compact-sm'
                style={{ alignSelf: 'start' }}
                leftSection={<IconArrowLeft size={14} />}
                onClick={back}
              >
                {backLabel(chosen, family)}
              </Button>
            )}
            {chosen && (
              <>
                <Text fw={700}>{label(chosen)}</Text>
                <div className={css.objectiveGrid}>
                  {[undefined, ...[...(stats.get(chosen) ?? [])].sort((left, right) => left.localeCompare(right))].map(
                    (type) => (
                      <UnstyledButton
                        className={css.objectiveRow}
                        key={type ?? 'all'}
                        aria-pressed={value === chosen && bonus === type}
                        onClick={() => {
                          pick(chosen, type)
                        }}
                      >
                        <span>{type ? bonusLabel(type) : 'All bonus types'}</span>
                        {value === chosen && bonus === type && <IconCheck size={14} aria-hidden />}
                      </UnstyledButton>
                    )
                  )}
                </div>
              </>
            )}
            {!chosen && family && (
              <div className={css.objectiveGrid}>
                {members.map(({ name, subtype }) => (
                  <UnstyledButton
                    className={css.objectiveRow}
                    key={name}
                    onClick={() => {
                      if (focus) pick(name)
                      else setChosen(name)
                    }}
                  >
                    <span>{verbatim ? name : subtype}</span>
                    <IconChevronRight size={14} />
                  </UnstyledButton>
                ))}
              </div>
            )}
            {!chosen && !family && (
              <>
                <TextInput
                  data-autofocus
                  aria-label='Search stats'
                  placeholder='Search stats'
                  leftSection={<IconSearch size={16} />}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.currentTarget.value)
                    setPage(0)
                    setCategory('')
                  }}
                />
                {!category && !words.length ? (
                  <div className={css.objectiveGrid}>
                    {categories.map((c) => {
                      const count = names.filter((name) => inCategory(name, c)).length
                      return (
                        count > 0 && (
                          <UnstyledButton
                            className={css.objectiveRow}
                            key={c}
                            onClick={() => {
                              setCategory(c)
                              setPage(0)
                            }}
                          >
                            <span>{c}</span>
                            <small>{count}</small>
                            <IconChevronRight size={14} />
                          </UnstyledButton>
                        )
                      )
                    })}
                  </div>
                ) : (
                  <>
                    <Text size='sm' c='dimmed' role='status'>
                      {category || 'Search results'} · {rows.length}
                    </Text>
                    <div className={css.objectiveGrid}>
                      {rows.slice(page * 10, page * 10 + 10).map((name) => (
                        <UnstyledButton
                          className={css.objectiveRow}
                          key={name}
                          onClick={() => {
                            if (families.has(name)) setFamily(name)
                            else if (focus) pick(name)
                            else setChosen(name)
                          }}
                        >
                          <span>{label(name)}</span>
                          <IconChevronRight size={14} />
                        </UnstyledButton>
                      ))}
                    </div>
                    {!rows.length && <Text size='sm'>No matching stats.</Text>}
                    {rows.length > 10 && (
                      <Group justify='space-between'>
                        <Button
                          variant='subtle'
                          size='compact-sm'
                          disabled={!page}
                          onClick={() => {
                            setPage(page - 1)
                          }}
                        >
                          Previous
                        </Button>
                        <Text size='xs'>
                          Page {page + 1} of {Math.ceil(rows.length / 10)}
                        </Text>
                        <Button
                          variant='subtle'
                          size='compact-sm'
                          disabled={(page + 1) * 10 >= rows.length}
                          onClick={() => {
                            setPage(page + 1)
                          }}
                        >
                          Next
                        </Button>
                      </Group>
                    )}
                  </>
                )}
              </>
            )}
          </Stack>
        )}
      </Modal>
    </div>
  )
}
