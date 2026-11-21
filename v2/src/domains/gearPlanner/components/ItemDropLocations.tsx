import { gearDropLocations } from '../dropLocations'
import { Anchor, List, Stack, Text } from '@mantine/core'
import type { GearPlannerItem } from '../gearPlanner.types'

export default function ItemDropLocations({ locations }: { locations: GearPlannerItem['source']['dropLocations'] }) {
  const entries = gearDropLocations(locations)
  if (!entries.length) return null
  return (
    <Stack gap={2}>
      <Text fw={600} size='sm'>
        Drop locations
      </Text>
      <List size='sm' spacing={2} withPadding aria-label='Drop locations'>
        {entries.map(({ title, page, detail }) => (
          <List.Item key={JSON.stringify([title, page, detail])}>
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
