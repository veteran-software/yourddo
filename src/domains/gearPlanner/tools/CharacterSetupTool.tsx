import { useState } from 'react'
import { Accordion, Button, Checkbox, Group, MultiSelect, NativeSelect, RangeSlider, Stack, Text } from '@mantine/core'
import type { LevelRange } from '../components/LevelRangeInputs'
import {
  changeClasses,
  classNames,
  proficiencyGroups,
  proficiencyOptions,
  selectedProficiencies,
  updateProficiencyGroup,
  type CharacterSettings
} from '../character'

import { gearPlannerMaximumLevel, gearPlannerMinimumLevel } from '../setups'
import styles from './CharacterSetupTool.module.css'

const levelOptions = Array.from({ length: gearPlannerMaximumLevel - gearPlannerMinimumLevel + 1 }, (_, index) =>
  String(gearPlannerMinimumLevel + index)
)

function CharacterLevelRange({
  levels,
  updateLevels
}: Readonly<{
  levels: LevelRange
  updateLevels: (update: Partial<LevelRange>) => void
}>) {
  const [preview, setPreview] = useState<[number, number] | null>(null)
  const range: [number, number] = preview ?? [levels.minimumLevel, levels.maximumLevel]
  return (
    <section className={styles.levels} role='group' aria-label='Gear level range'>
      <Group justify='space-between' gap='xs'>
        <Text fw={600} size='sm'>
          Gear level range
        </Text>
        <Group gap={4} wrap='nowrap'>
          <NativeSelect
            size='xs'
            aria-label='Minimum level'
            data={levelOptions}
            value={range[0]}
            onChange={(event) => {
              updateLevels({ minimumLevel: Number(event.currentTarget.value) })
            }}
          />
          <Text span c='dimmed' aria-hidden>
            –
          </Text>
          <NativeSelect
            size='xs'
            aria-label='Maximum level'
            data={levelOptions}
            value={range[1]}
            onChange={(event) => {
              updateLevels({ maximumLevel: Number(event.currentTarget.value) })
            }}
          />
        </Group>
      </Group>
      <RangeSlider
        className={styles.slider}
        color='var(--app-accent)'
        size='sm'
        thumbSize='1rem'
        min={gearPlannerMinimumLevel}
        max={gearPlannerMaximumLevel}
        minRange={0}
        thumbFromLabel='Adjust minimum level'
        thumbToLabel='Adjust maximum level'
        value={range}
        onChange={setPreview}
        onChangeEnd={([minimumLevel, maximumLevel]) => {
          setPreview(null)
          updateLevels({ minimumLevel, maximumLevel })
        }}
      />
    </section>
  )
}

export default function CharacterSetupTool({
  levels,
  updateLevels,
  settings,
  weaponTypes,
  onChange
}: Readonly<{
  levels: LevelRange
  updateLevels: (update: Partial<LevelRange>) => void
  weaponTypes: string[]
  settings: CharacterSettings
  onChange: (settings: CharacterSettings) => void
}>) {
  const unavailable = settings.weapons.filter((value) => !weaponTypes.includes(value))
  return (
    <Stack p='md' gap='md'>
      <CharacterLevelRange levels={levels} updateLevels={updateLevels} />
      <MultiSelect
        label='Character classes'
        description='Choose up to three classes to set starting proficiencies.'
        placeholder={settings.classes.length ? undefined : 'Choose classes'}
        searchable
        maxValues={3}
        data={classNames}
        value={settings.classes}
        onChange={(values) => {
          onChange(changeClasses(settings, values, weaponTypes))
        }}
      />
      <Text size='sm' c='dimmed'>
        Choose which equipment types appear in gear searches.
      </Text>
      {unavailable.length > 0 && (
        <Stack gap={4}>
          <Text size='sm' c='orange'>
            Saved weapon filter unavailable: {unavailable.join(', ')}. Choose a replacement weapon type or clear the
            filter to show all weapon types.
          </Text>
          <Button
            size='compact-xs'
            variant='light'
            w='fit-content'
            onClick={() => {
              onChange({ ...settings, weapons: [] })
            }}
          >
            Clear weapon filter
          </Button>
        </Stack>
      )}
      <Accordion variant='separated'>
        {proficiencyGroups(weaponTypes).map(({ key, title, types }) => {
          const available = key === 'weapons' ? weaponTypes : proficiencyOptions[key]
          const selected = selectedProficiencies(settings, key, types)
          const update = (values: string[]) => {
            onChange(updateProficiencyGroup(settings, key, available, types, values))
          }
          return (
            <Accordion.Item key={title} value={title}>
              <Accordion.Control>
                <Text span fw={600}>
                  {title}
                </Text>
                <Text span size='xs' c='dimmed' ml='xs'>
                  {selected.length} of {types.length}
                </Text>
              </Accordion.Control>
              <Accordion.Panel>
                <Group gap='xs' mb='sm'>
                  <Button
                    size='compact-xs'
                    variant='light'
                    disabled={selected.length === types.length}
                    onClick={() => {
                      update(types)
                    }}
                  >
                    Select all
                  </Button>
                  <Button
                    size='compact-xs'
                    variant='subtle'
                    disabled={!selected.length}
                    onClick={() => {
                      update([])
                    }}
                  >
                    Select none
                  </Button>
                </Group>
                <Checkbox.Group aria-label={title + ' proficiencies'} value={selected} onChange={update}>
                  <Stack gap='xs'>
                    {types.map((type) => (
                      <Checkbox key={type} label={type} value={type} />
                    ))}
                  </Stack>
                </Checkbox.Group>
              </Accordion.Panel>
            </Accordion.Item>
          )
        })}
      </Accordion>
      {settings.classes.includes('Druid') && (
        <Checkbox
          label='Allow metal armor and shields'
          description='Override the Druidic Oath for equipped gear, gear searches, and Essence Crafting materials.'
          checked={settings.allowMetalWithDruid}
          onChange={(event) => {
            onChange({ ...settings, allowMetalWithDruid: event.currentTarget.checked })
          }}
        />
      )}
    </Stack>
  )
}
