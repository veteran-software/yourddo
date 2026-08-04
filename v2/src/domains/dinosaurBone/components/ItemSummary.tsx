import { Badge, Box, Divider, Group, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import type { ClassifiedDinosaurBoneItem } from '../dinosaurBone.types.ts'
import { formatEffect, getFamilyLabel, isArtifactItem } from '../logic.ts'
import EffectList from './EffectList.tsx'
import ItemIcon from './ItemIcon.tsx'

const formatBinding = (binding: Readonly<Record<string, string>> | undefined) =>
  binding ? Object.values(binding).join(' · ') : undefined

const ItemSummary = ({ item }: { item: ClassifiedDinosaurBoneItem }) => {
  const metadata = [
    item.type,
    item.minLevel !== undefined ? `Minimum level ${String(item.minLevel)}` : undefined,
    formatBinding(item.binding),
    item.material,
    item.craftedIn
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
          <Group gap='xs'>
            <Badge variant='light'>{getFamilyLabel(item.family)}</Badge>
            {isArtifactItem(item) ? (
              <Badge variant='light' color='grape'>
                {item.artifactType} Artifact
              </Badge>
            ) : null}
          </Group>
        </Group>
        {item.description ? <Text size='sm'>{item.description}</Text> : null}
        <Divider />
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <Box>
            <Text fw={600} size='sm' mb={4}>
              Base effects
            </Text>
            <EffectList effects={[...(item.effectsAdded ?? []), ...(item.enchantments ?? [])].map(formatEffect)} />
          </Box>
          <Stack gap={4}>
            <Text size='sm'>Configurable slots: {String(item.augments.length)}</Text>
            {item.restrictions?.map((restriction) => (
              <Text size='sm' key={restriction}>
                Restriction: {restriction}
              </Text>
            ))}
            {item.notes?.map((note) => (
              <Text size='sm' key={note}>
                Note: {note}
              </Text>
            ))}
          </Stack>
        </SimpleGrid>
      </Stack>
    </Paper>
  )
}

export default ItemSummary
