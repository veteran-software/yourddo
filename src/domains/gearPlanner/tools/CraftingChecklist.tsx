import { Accordion, Badge, Checkbox, Group, SegmentedControl, Stack, Text, Title } from '@mantine/core'
import { useLocalStorage } from '@mantine/hooks'
import { useMemo } from 'react'
import IngredientLabel from '../../../shared/items/IngredientLabel'
import type { EssenceBinding, EssenceCraftingData } from '../../essenceCrafting/essenceCrafting.types'
import { craftingChecklistItems, craftingMaterialTotals } from '../craftingChecklist'
import type { GearPlannerReforgingData } from '../reforging'
import type { GearPlannerSetup } from '../setups'
import type { TroveInventory } from '../trove'
import css from './FarmingTool.module.css'

export default function CraftingChecklist({
  setup,
  essence,
  reforging,
  inventory,
  character,
  importedAt
}: Readonly<{
  setup: GearPlannerSetup
  essence: EssenceCraftingData
  reforging: GearPlannerReforgingData
  inventory: TroveInventory
  character: string
  importedAt?: string
}>) {
  const [binding, setBinding] = useLocalStorage<EssenceBinding>({
    key: 'yourddo:crafting-binding:' + setup.id,
    defaultValue: 'bound'
  })
  const [checked, setChecked] = useLocalStorage<string[]>({
    key: 'yourddo:crafting-progress:' + setup.id,
    defaultValue: []
  })
  const items = useMemo(
    () => craftingChecklistItems(setup, reforging, essence, binding),
    [setup, reforging, essence, binding]
  )
  const completed = useMemo(() => new Set(checked), [checked])
  const checklist = items.map(({ slot, item, steps }) => ({
    slot,
    item,
    steps: steps.map((step) => {
      const key = JSON.stringify([character.trim().toLowerCase(), slot, item.id, step.id])
      return { ...step, key, done: completed.has(key) }
    })
  }))
  const pending = checklist.flatMap(({ steps }) => steps.filter(({ done }) => !done))
  const totalCount = checklist.reduce((count, { steps }) => count + steps.length, 0)
  const totals = craftingMaterialTotals(
    pending.flatMap(({ materials }) => materials ?? []),
    inventory,
    character,
    importedAt
  )
  const uncatalogued = pending.filter(({ materials }) => materials === undefined).length

  if (!items.length) {
    return (
      <Text size='sm' c='dimmed'>
        Choose an item upgrade or equip Essence Crafted gear to start this checklist.
      </Text>
    )
  }

  return (
    <>
      {items.some(({ item }) => item.essenceCrafting) && (
        <Stack gap={4}>
          <Text size='xs' fw={500} id='crafting-essence-binding'>
            Essence recipe binding
          </Text>
          <SegmentedControl
            size='xs'
            fullWidth
            aria-labelledby='crafting-essence-binding'
            value={binding}
            onChange={setBinding}
            data={[
              { label: 'Bound', value: 'bound' },
              { label: 'Unbound', value: 'unbound' }
            ]}
          />
        </Stack>
      )}
      <section aria-labelledby='crafting-materials'>
        <Title order={4} size='h6' id='crafting-materials'>
          Materials for remaining steps
        </Title>
        {uncatalogued > 0 && (
          <Text size='xs' c='dimmed' mt={4}>
            Recipe costs are unavailable for {uncatalogued} {uncatalogued === 1 ? 'step' : 'steps'}.
          </Text>
        )}
        {totals.length > 0 && !character.trim() && (
          <Text size='xs' c='dimmed' mt={4}>
            Choose a Trove character to check binding restrictions.
          </Text>
        )}
        {totals.length > 0 && (Boolean(importedAt) || inventory.size > 0) && (
          <Text size='xs' c='dimmed' mt={4}>
            Stock reflects your last Trove import. Reimport after using materials.
          </Text>
        )}
        {!totals.length && (
          <Text size='sm' c='dimmed' mt={4}>
            {pending.length ? 'No published materials for the remaining steps.' : 'All crafting steps are complete.'}
          </Text>
        )}
        {totals.length > 0 && (
          <div className={css.group}>
            <ul>
              {totals.map(({ key, name, id, quantity, usable, missing, unverified, locations, restricted, verify }) => (
                <li key={key}>
                  <Stack gap={3} w='100%'>
                    <Group justify='space-between' align='flex-start' gap={4}>
                      <Text size='sm' fw={600}>
                        <IngredientLabel name={name} ingredientId={id} />
                      </Text>
                      <Badge size='sm' variant='light'>
                        {quantity.toLocaleString()} needed
                      </Badge>
                    </Group>
                    {missing !== null && (
                      <Group gap={8}>
                        <Text size='xs' c='dimmed'>
                          {usable.toLocaleString()} {character.trim() ? 'usable' : 'in Trove'}
                        </Text>
                        {missing > 0 && (
                          <Badge size='sm' variant='light' color='yellow'>
                            {missing.toLocaleString()} missing
                          </Badge>
                        )}
                        {unverified > 0 && (
                          <Badge size='sm' variant='light' color='gray'>
                            {unverified.toLocaleString()} unverified
                          </Badge>
                        )}
                      </Group>
                    )}
                    {locations.size > 0 && (
                      <small>
                        {[...locations]
                          .map(([location, count]) => location + ' ×' + count.toLocaleString())
                          .join(' · ')}
                      </small>
                    )}
                    {restricted.length > 0 && <small>Character-bound on {restricted.join(' · ')}</small>}
                    {unverified > 0 && (
                      <small>
                        Verify Trove quantities or binding{verify.length ? ' in ' + verify.join(' · ') : ''}.
                      </small>
                    )}
                  </Stack>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
      <section aria-labelledby='crafting-steps'>
        <Group justify='space-between' gap={4} mb={6}>
          <Title order={4} size='h6' id='crafting-steps'>
            Crafting steps
          </Title>
          <Badge size='sm' variant='light'>
            {totalCount - pending.length} / {totalCount} complete
          </Badge>
        </Group>
        <Accordion variant='contained' chevronPosition='right' multiple>
          {checklist.map(({ slot, item, steps }) => (
            <Accordion.Item key={slot} value={slot}>
              <Accordion.Control>
                <Text component='span' display='block' size='sm' fw={600}>
                  {item.source.name}
                </Text>
                <Text component='span' display='block' size='xs' c='dimmed'>
                  {slot} · {steps.filter(({ done }) => !done).length} remaining
                </Text>
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap='xs'>
                  {steps.map(({ key, label, materials, done }) => (
                    <Checkbox
                      key={key}
                      size='xs'
                      checked={done}
                      label={label}
                      description={
                        materials === undefined
                          ? 'Recipe costs unavailable'
                          : materials.map(({ name, quantity }) => name + ' ×' + quantity.toLocaleString()).join(' · ')
                      }
                      onChange={({ currentTarget: { checked: complete } }) => {
                        setChecked((previous) =>
                          complete ? [...new Set([...previous, key])] : previous.filter((value) => value !== key)
                        )
                      }}
                    />
                  ))}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </section>
    </>
  )
}
