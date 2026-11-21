import { Anchor, List, Stack, Text } from '@mantine/core'
import type { GearPlannerItem } from '../gearPlanner.types'

export default function ItemDropLocations({ locations }: { locations: GearPlannerItem['source']['dropLocations'] }) {
  const entries = new Map<string, { title: string; page: string; detail: string }>()
  for (const location of locations ?? []) {
    const field = (key: string) => (typeof location[key] === 'string' ? location[key].trim() : '')
    const namedLocation =
      field('questWildernessChain') ||
      field('adventurePack') ||
      field('vendorName') ||
      field('crateName') ||
      field('craftingLocation')
    const title =
      namedLocation ||
      (location.isCraftOnly === true ? 'Craft only' : field('sourceType').replace(/([a-z])([A-Z])/g, '$1 $2'))
    if (!title) continue
    const page = namedLocation && (field('titleForLink') || namedLocation)
    const detail = [field('difficulty'), field('whichChestPerson'), field('vendorLocation'), field('vendorArea')]
      .filter(Boolean)
      .join(' · ')
    entries.set(JSON.stringify([title, page, detail]), { title, page, detail })
  }
  if (!entries.size) return null
  return (
    <Stack gap={2}>
      <Text fw={600} size='sm'>
        Drop locations
      </Text>
      <List size='sm' spacing={2} withPadding aria-label='Drop locations'>
        {[...entries].map(([key, { title, page, detail }]) => (
          <List.Item key={key}>
            {page ? (
              <Anchor
                size='sm'
                href={`https://ddocompendium.com/w/${encodeURIComponent(page)}`}
                target='_blank'
                rel='noreferrer'
              >
                {title}
              </Anchor>
            ) : (
              title
            )}
            {detail && (
              <Text component='span' size='sm' c='dimmed'>
                {' '}
                · {detail}
              </Text>
            )}
          </List.Item>
        ))}
      </List>
    </Stack>
  )
}
