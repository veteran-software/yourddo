import { Accordion, Checkbox, MultiSelect, Stack, Text } from '@mantine/core'
import { changeClasses, classNames, proficiencyOptions, type CharacterSettings } from '../character'

export default function CharacterSetupTool({
  settings,
  onChange
}: Readonly<{
  settings: CharacterSettings
  onChange: (settings: CharacterSettings) => void
}>) {
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
          onChange(changeClasses(settings, values))
        }}
      />
      <Text size='sm' c='dimmed'>
        Adjust the equipment types shown in gear searches. An empty list shows every type in that category.
      </Text>
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
                  value={settings[key]}
                  onChange={(values) => {
                    onChange({ ...settings, [key]: values })
                  }}
                >
                  <Stack gap='xs'>
                    {proficiencyOptions[key].map((type) => (
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
