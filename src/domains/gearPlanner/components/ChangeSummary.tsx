import { Anchor, HoverCard, List, Text } from '@mantine/core'

export default function ChangeSummary({ entries, label }: Readonly<{ entries: string[]; label: string }>) {
  return (
    <>
      {entries.slice(0, 2).join(' · ')}
      {entries.length > 2 && (
        <>
          {' · '}
          <HoverCard
            role='tooltip'
            interactive
            withinPortal={false}
            events={{ touch: true }}
            withArrow
            shadow='md'
            position='bottom-start'
            width='min(21rem, calc(100vw - 3rem))'
          >
            <HoverCard.Target>
              <Anchor
                component='button'
                type='button'
                size='inherit'
                underline='always'
                aria-label={'Show all ' + String(entries.length) + ' ' + label.toLowerCase()}
              >
                +{entries.length - 2} more
              </Anchor>
            </HoverCard.Target>
            <HoverCard.Dropdown mah='40dvh' style={{ overflowY: 'auto', overflowWrap: 'anywhere' }}>
              <Text size='xs' fw={700} mb={4}>
                {label}
              </Text>
              <List size='sm' spacing={3}>
                {entries.map((entry, index) => (
                  <List.Item key={String(index) + entry}>{entry}</List.Item>
                ))}
              </List>
            </HoverCard.Dropdown>
          </HoverCard>
        </>
      )}
    </>
  )
}
