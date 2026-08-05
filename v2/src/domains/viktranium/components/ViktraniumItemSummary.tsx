import { Badge, Box, Divider, Group, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import EffectList from '../../../shared/items/EffectList.tsx'
import ItemIcon from '../../../shared/items/ItemIcon.tsx'
import { formatEffect, getFamilyLabel } from '../logic.ts'
import type { ViktraniumItem } from '../viktranium.types.ts'

const bindingText = (binding: Readonly<Record<string, string>> | undefined) =>
  binding ? Object.values(binding).join(' · ') : undefined

const ViktraniumItemSummary = ({ item }: { item: ViktraniumItem }) => {
  const metadata = [
    item.type,
    item.category,
    `Minimum level ${String(item.minimumLevel)}`,
    bindingText(item.binding),
    item.material
  ].filter((value): value is string => Boolean(value))
  return (
    <Paper withBorder p='md'>
      <Stack gap='sm'>
        <Group justify='space-between' align='flex-start' wrap='wrap'>
          <Group align='flex-start' wrap='nowrap' style={{ minWidth: 0 }}>
            <ItemIcon item={item} size={72} alt={`${item.name} icon`} />
            <Box style={{ minWidth: 0 }}>
              <Title order={2} size='h3' style={{ overflowWrap: 'anywhere' }}>
                {item.name}
              </Title>
              <Text c='dimmed' size='sm'>
                {metadata.join(' · ')}
              </Text>
            </Box>
          </Group>
          <Badge variant='light'>{getFamilyLabel(item.family)}</Badge>
        </Group>
        {item.description ? <Text size='sm'>{item.description}</Text> : null}
        <Divider />
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <Box>
            <Text fw={600} size='sm' mb={4}>
              Base effects
            </Text>
            <EffectList effects={item.enchantments.map(formatEffect)} />
          </Box>
          <Stack gap={4}>
            <Text size='sm'>Configurable slots: {String(item.slots.length)}</Text>
            {item.recipes.map((recipe) => (
              <Text size='sm' key={recipe.id}>
                Crafted at {recipe.device}
              </Text>
            ))}
            {item.dropLocations.map((location, index) => (
              <Text size='sm' key={`${location.sourceType}-${String(index)}`}>
                Found in {[location.source, location.location, location.difficulty].filter(Boolean).join(' · ')}
              </Text>
            ))}
            {item.notes ? <Text size='sm'>Note: {item.notes}</Text> : null}
          </Stack>
        </SimpleGrid>
      </Stack>
    </Paper>
  )
}

export default ViktraniumItemSummary
