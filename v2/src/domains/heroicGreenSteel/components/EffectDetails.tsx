import { Accordion, Badge, Group, List, Stack, Text } from '@mantine/core'
import type { HgsEffect, HgsSpell, HgsTierOption } from '../heroicGreenSteel.types.ts'
import { formatMechanic, formatProc, stripDdoMarkup } from '../logic.ts'

export const OptionBadges = ({ option }: { option: HgsTierOption }) => (
  <Group gap={6} wrap='wrap'>
    <Badge variant='light'>{option.focus}</Badge>
    <Badge variant='outline' color='gray'>
      {option.essence}
    </Badge>
    <Badge variant='outline' color='gray'>
      {option.gem}
    </Badge>
    {option.aspect ? <Badge variant='light'>{option.aspect}</Badge> : null}
    {option.shardType ? (
      <Badge variant='light' color={option.shardType === 'compound' ? 'violet' : 'blue'}>
        {option.shardType} shard
      </Badge>
    ) : null}
    {option.focuses?.map((focus) => (
      <Badge variant='dot' color='gray' key={focus}>
        {focus}
      </Badge>
    ))}
  </Group>
)

export const EffectDetails = ({ effects }: { effects: readonly HgsEffect[] }) => {
  if (effects.length === 0) {
    return (
      <Text c='dimmed' size='sm'>
        No published effects.
      </Text>
    )
  }
  return (
    <Accordion variant='contained' multiple>
      {effects.map((effect) => (
        <Accordion.Item key={effect.id} value={effect.id.toString()}>
          <Accordion.Control>{effect.displayName}</Accordion.Control>
          <Accordion.Panel>
            <Stack gap='sm'>
              {effect.description ? (
                <Text size='sm' style={{ whiteSpace: 'pre-line' }}>
                  {stripDdoMarkup(effect.description)}
                </Text>
              ) : null}
              {effect.enchantments.length > 0 ? (
                <Stack gap={4}>
                  <Text fw={600} size='xs'>
                    Passive enchantments
                  </Text>
                  <List size='sm' spacing={4}>
                    {effect.enchantments.map((mechanic, index) => (
                      <List.Item key={index}>{formatMechanic(mechanic)}</List.Item>
                    ))}
                  </List>
                </Stack>
              ) : null}
              {effect.procs.length > 0 ? (
                <Stack gap={4}>
                  <Text fw={600} size='xs'>
                    Triggered effects
                  </Text>
                  <List size='sm' spacing={4}>
                    {effect.procs.map((proc, index) => (
                      <List.Item key={index}>{formatProc(proc)}</List.Item>
                    ))}
                  </List>
                </Stack>
              ) : null}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  )
}

export const SpellDetails = ({ spell }: { spell: HgsSpell }) => (
  <Stack gap={4}>
    <Text fw={600}>{spell.name}</Text>
    <Text c='dimmed' size='xs'>
      Caster level {spell.casterLevel} · {spell.charges} charges · {spell.rechargePerDay} recharged per day
    </Text>
    <Text size='sm' style={{ whiteSpace: 'pre-line' }}>
      {stripDdoMarkup(spell.description)}
    </Text>
  </Stack>
)
