import { Text } from '@mantine/core'

interface Material {
  name: string
  quantity: number
}

export default function ComponentFarmingLocations({
  materials,
  count,
  location
}: Readonly<{
  materials: readonly Material[]
  count: number
  location: (name: string) => string | undefined
}>) {
  const rows = materials.flatMap(({ name, quantity }) => {
    const foundIn = location(name)
    return foundIn ? [{ name, quantity: quantity * count, foundIn }] : []
  })
  if (!rows.length) return null
  return (
    <details>
      <summary>Farming locations</summary>
      <ul>
        {rows.map(({ name, quantity, foundIn }) => (
          <li key={name}>
            {name} ×{quantity}
            <Text size='xs' c='dimmed'>
              Found in: {foundIn}
            </Text>
          </li>
        ))}
      </ul>
    </details>
  )
}
