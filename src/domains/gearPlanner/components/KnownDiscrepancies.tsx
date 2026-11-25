import { Text } from '@mantine/core'

export default function KnownDiscrepancies({ notes }: Readonly<{ notes?: readonly string[] }>) {
  if (!notes?.length) return null
  return (
    <aside aria-label='Known in-game discrepancies'>
      <Text size='xs' fw={600}>
        Known in-game {notes.length === 1 ? 'discrepancy' : 'discrepancies'}
      </Text>
      {notes.map((note) => (
        <Text key={note} size='xs'>
          {note}
        </Text>
      ))}
    </aside>
  )
}
