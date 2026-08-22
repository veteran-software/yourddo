import { Accordion, Badge, Group, List, Stack, Text } from '@mantine/core'
import type {
  HgsEffect,
  HgsMechanic,
  HgsProc,
  HgsSpell,
  HgsTargetEligibility,
  HgsTierOption
} from '../heroicGreenSteel.types.ts'
import { formatGenus, formatMechanic, formatProcTrigger, stripDdoMarkup } from '../logic.ts'

const elementalGenera = new Set(['Elemental_Air', 'Elemental_Earth', 'Elemental_Fire', 'Elemental_Water'])

const formatList = (values: readonly string[]) => new Intl.ListFormat('en', { type: 'disjunction' }).format(values)

const formatExcludedGenus = (genera: readonly string[]) => {
  const hasAllElementals = [...elementalGenera].every((genus) => genera.includes(genus))
  const values = genera
    .filter((genus) => !hasAllElementals || !elementalGenera.has(genus))
    .map((genus) => formatGenus(genus))
  return hasAllElementals ? [...values, 'Elementals'] : values
}

export const TargetEligibility = ({ eligibility }: { eligibility: HgsTargetEligibility | undefined }) => {
  if (!eligibility) return null
  const included = eligibility.includedGenus?.map((genus) => formatGenus(genus)) ?? []
  const excluded = [
    ...(eligibility.excludedCreatureTraits ?? []),
    ...formatExcludedGenus(eligibility.excludedGenus ?? [])
  ]
  const hasUnknownMask = Boolean(eligibility.unknownIncludedGenusMask ?? eligibility.unknownExcludedGenusMask)

  if (!included.length && !excluded.length && !hasUnknownMask) return null
  return (
    <Stack gap={0}>
      {included.length ? (
        <Text c='dimmed' size='xs'>
          Only affects: {formatList(included)}
        </Text>
      ) : null}
      {excluded.length ? (
        <Text c='dimmed' size='xs'>
          Does not affect: {formatList(excluded)}
        </Text>
      ) : null}
      {hasUnknownMask ? (
        <Text c='dimmed' size='xs'>
          Additional unresolved target restrictions apply.
        </Text>
      ) : null}
    </Stack>
  )
}

export const EffectSupportingMechanics = ({ mechanic }: { mechanic: HgsMechanic }) => {
  const traits = mechanic.traits ?? []
  if (!traits.length && !mechanic.targetEligibility) return null
  return (
    <Stack gap={0}>
      {traits.length ? (
        <Text c='dimmed' size='xs'>
          {traits.length === 1 ? 'Trait' : 'Traits'}: {traits.join(', ')}
        </Text>
      ) : null}
      <TargetEligibility eligibility={mechanic.targetEligibility} />
    </Stack>
  )
}

const EnchantmentDetails = ({ mechanic }: { mechanic: HgsMechanic }) => (
  <Stack gap={0}>
    <Text size='sm'>{formatMechanic(mechanic)}</Text>
    <EffectSupportingMechanics mechanic={mechanic} />
  </Stack>
)

const ProcOutcomeDetails = ({ proc, outcome }: { proc: HgsProc; outcome: HgsMechanic }) => (
  <Stack gap={0}>
    <Text size='sm'>
      {formatProcTrigger(proc)}: {formatMechanic(outcome)}
    </Text>
    <EffectSupportingMechanics mechanic={outcome} />
  </Stack>
)

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
      <Badge variant='outline' color='gray' key={focus}>
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
                      <List.Item key={index}>
                        <EnchantmentDetails mechanic={mechanic} />
                      </List.Item>
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
                      <List.Item key={index}>
                        <Stack gap={4}>
                          {proc.outcomes.map((outcome, outcomeIndex) => (
                            <ProcOutcomeDetails key={outcomeIndex} proc={proc} outcome={outcome} />
                          ))}
                        </Stack>
                      </List.Item>
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
