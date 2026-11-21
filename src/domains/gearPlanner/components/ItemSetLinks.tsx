import { Anchor, Group } from '@mantine/core'

export default function ItemSetLinks({
  names,
  onOpen
}: Readonly<{ names: readonly string[]; onOpen: (name: string) => void }>) {
  if (!names.length) return null
  return (
    <Group gap='xs'>
      {[...new Set(names)].map((name) => (
        <Anchor
          key={name}
          component='button'
          type='button'
          size='xs'
          onClick={() => {
            onOpen(name)
          }}
        >
          {name}
        </Anchor>
      ))}
    </Group>
  )
}
