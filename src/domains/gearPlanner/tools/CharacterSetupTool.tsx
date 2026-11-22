import { Accordion, Button, Checkbox, MultiSelect, Stack, Text } from '@mantine/core'
import { changeClasses, classNames, proficiencyOptions, type CharacterSettings } from '../character'

export default function CharacterSetupTool({
  settings,
  weaponTypes,
  onChange
}: Readonly<{
  weaponTypes: string[]
  settings: CharacterSettings
  onChange: (settings: CharacterSettings) => void
}>) {
  const unavailable = settings.weapons.filter((value) => !weaponTypes.includes(value))
  return (
    <Stack p='md' gap='md'>
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
        Adjust the equipment types shown in gear searches. An empty list shows every type in that category.
      </Text>
      {unavailable.length > 0 && (
        <Stack gap={4}>
          <Text size='sm' c='orange'>
            Saved weapon filter unavailable: {unavailable.join(', ')}. Choose a replacement under Weapons or clear the
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
        {(['weapons', 'armor', 'shields'] as const).map((key) => {
          const title = { weapons: 'Weapons', armor: 'Armor', shields: 'Shields' }[key]
          return (
            <Accordion.Item key={key} value={key}>
              <Accordion.Control>
                <Text span fw={600}>
                  {title}
                </Text>
                <Text span size='xs' c='dimmed' ml='xs'>
                  {settings[key].length ? String(settings[key].length) + ' selected' : 'All types'}
                </Text>
              </Accordion.Control>
              <Accordion.Panel>
                <Checkbox.Group
                  aria-label={title + ' proficiencies'}
                  value={
                    key === 'weapons' ? settings.weapons.filter((value) => weaponTypes.includes(value)) : settings[key]
                  }
                  onChange={(values) => {
                    onChange({ ...settings, [key]: values })
                  }}
                >
                  <Stack gap='xs'>
                    {(key === 'weapons' ? weaponTypes : proficiencyOptions[key]).map((type) => (
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
