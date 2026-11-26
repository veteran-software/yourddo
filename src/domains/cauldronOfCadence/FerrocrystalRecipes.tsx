import { Badge, Group, List, Paper, SegmentedControl, Select, Stack, Text, Title } from '@mantine/core'
import { useState } from 'react'
import styles from '../../shared/layout/workspace.module.css'
import type { WeaponRecipe } from './catalog'

export default function FerrocrystalRecipes({ weapons }: Readonly<{ weapons: WeaponRecipe[] }>) {
  const [tier, setTier] = useState('heroic')
  const [selection, setSelection] = useState<string | null>(null)
  const options = weapons.filter((weapon) => weapon.tier === tier).toSorted((a, b) => a.name.localeCompare(b.name))
  const current = options.find((weapon) => String(weapon.id) === selection)
  return (
    <div className={styles.recipeDesk}>
      <Stack className={styles.recipeControls}>
        <SegmentedControl
          aria-label='Weapon tier'
          value={tier}
          onChange={(value) => {
            setTier(value)
            setSelection(null)
          }}
          data={[
            { value: 'heroic', label: 'Heroic' },
            { value: 'legendary', label: 'Legendary' }
          ]}
        />
        <Select
          label='Ferrocrystal weapon'
          placeholder='Choose a weapon'
          searchable
          clearable
          data={options.map((weapon) => ({ value: String(weapon.id), label: weapon.name }))}
          value={selection}
          onChange={setSelection}
        />
      </Stack>
      <Paper className={styles.surface} withBorder p='lg'>
        {current ? (
          <Stack>
            <Title order={2}>{current.name}</Title>
            <Group>
              <Badge variant='light'>Minimum Level {current.minimumLevel}</Badge>
            </Group>
            <Text>{current.description}</Text>
            <Title order={3} size='h4'>
              Required Items
            </Title>
            {current.requirements.map((input) => (
              <Group key={input.name}>
                <Text>{input.name}</Text>
                <Badge variant='light'>×{input.quantity}</Badge>
              </Group>
            ))}
            <Title order={3} size='h4'>
              Weapon effects
            </Title>
            <List>
              {current.effects.map((effect) => (
                <List.Item key={effect}>{effect}</List.Item>
              ))}
            </List>
            {Boolean(current.discrepancies?.length) && (
              <section aria-label='Known in-game discrepancies'>
                <Title order={3} size='h4'>
                  Known in-game discrepancies
                </Title>
                <List>
                  {current.discrepancies?.map((note) => (
                    <List.Item key={note}>{note}</List.Item>
                  ))}
                </List>
              </section>
            )}
          </Stack>
        ) : (
          <Text c='dimmed'>Choose a weapon to view its ingredients and effects.</Text>
        )}
      </Paper>
    </div>
  )
}
