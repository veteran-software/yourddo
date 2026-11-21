import { Text } from '@mantine/core'
import { TroveSnapshot } from '../../domains/gearPlanner/trove'
import { useTroveInventory } from '../../domains/gearPlanner/troveContext'

export default function IngredientStock({ name, required }: { name: string; required: number }) {
  const { inventory } = useTroveInventory()
  if (!inventory.size) return null
  const key = name.trim().toLowerCase()
  const holdings = inventory instanceof TroveSnapshot ? inventory.holdings.get(key) : undefined
  const locations =
    holdings?.map(
      (h) => h.location + ' ×' + String(h.quantity) + (h.binding === 'character' ? ' · Character-bound' : '')
    ) ??
    inventory.get(key) ??
    []
  const owned = holdings?.reduce((sum, h) => sum + h.quantity, 0) ?? (inventory.has(key) ? undefined : 0)
  const label =
    owned === undefined
      ? 'Owned · quantity unknown'
      : owned.toLocaleString() + ' / ' + required.toLocaleString() + ' owned'
  return locations.length ? (
    <details>
      <summary>{label}</summary>
      {locations.map((location, i) => (
        <Text key={i} size='xs'>
          {location}
        </Text>
      ))}
    </details>
  ) : (
    <Text size='xs' c='dimmed'>
      {label}
    </Text>
  )
}
