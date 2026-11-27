import { alchemicalRecipeHref } from '../alchemicalCrafting'
import { thunderRecipeHref } from '../thunderForgedCrafting'
import { TroveOwnership } from './TroveInventory'
import { Anchor, Box, Select, Stack, Switch, Text } from '@mantine/core'
import { gearCraftGroups, type GearCraftingData } from '../crafting.ts'
import type { GearPlannerItem } from '../gearPlanner.types.ts'

export default function ItemCraftingSelector({
  item,
  data,
  onChange
}: Readonly<{
  item: GearPlannerItem
  data: GearCraftingData
  onChange: (system: string, choiceId: string | null) => void
}>) {
  const groups = gearCraftGroups(item, data)
  if (!groups.length) return null
  const recipeHref = alchemicalRecipeHref(item) ?? thunderRecipeHref(item, data.thunderForged)
  const selected = item.crafts ?? []
  return (
    <Box component='details'>
      <Text component='summary' size='sm' fw={600} style={{ cursor: 'pointer' }}>
        Item upgrades{selected.length ? ` (${String(selected.length)})` : ''}
      </Text>
      <Stack mt='xs' gap='xs'>
        {recipeHref && (
          <Anchor href={recipeHref} size='sm'>
            Open crafting recipe
          </Anchor>
        )}
        {groups.map((group) => {
          const value = selected.find((c) => c.system === group.system)?.id ?? null
          if (group.replacesEnchantments)
            return (
              <Switch
                key={group.system}
                label={group.label}
                checked={value !== null}
                onChange={(e) => {
                  onChange(group.system, e.currentTarget.checked ? group.choices[0].id : null)
                }}
              />
            )
          return (
            <Select
              key={group.system}
              size='xs'
              label={group.label}
              placeholder='None'
              value={value}
              clearable
              clearButtonProps={{ tabIndex: 0, 'aria-hidden': false, 'aria-label': `Clear ${group.label}` }}
              searchable
              renderOption={
                group.system === 'ritual-table'
                  ? ({ option }) => (
                      <Stack gap={2}>
                        <span>{option.label}</span>
                        <TroveOwnership name={option.label} inOption />
                      </Stack>
                    )
                  : undefined
              }
              data={group.choices.map((c) => ({
                value: c.id,
                label: c.label,
                disabled:
                  group.system.startsWith('gem-set-') &&
                  selected.some((other) => other.system !== group.system && other.setName === c.setName)
              }))}
              onChange={(id) => {
                onChange(group.system, id)
              }}
            />
          )
        })}
      </Stack>
    </Box>
  )
}
