import { expect, it } from 'vitest'
import { validateViktraniumDataset } from './data'
import { addNativeSelectionAliases, restoreNativeSlotSelections } from './nativeIds'
import { createViktraniumTestPayload } from './test-fixture'

it('restores historical selections for renamed equipment, reordered slots, and corrected augment names', async () => {
  const fixture = createViktraniumTestPayload()
  const name = 'Calamitous Sceptre'
  Object.assign(fixture.items[0], {
    id: 'item-1879298736',
    name,
    pageTitle: name,
    slots: ['Red', 'Lamordia: Melancholic (Weapon)', 'Lamordia: Dolorous (Weapon)', 'Lamordia: Miserable (Weapon)'].map(
      (type, order) => ({ id: 'slot-' + String(order + 1), augmentType: type, label: type, order })
    )
  })
  Object.assign(fixture.augments[0], { id: 'augment-1879305300', name: 'Ruby of Radiance 166', minimumLevel: 36 })
  const data = await addNativeSelectionAliases(validateViktraniumDataset(fixture))
  const previous = 'augment-6bbad4f4cf976a56d607cc0a'
  const item = data.indexes.itemById.get('item-bdc2080d92de6ef30da4ff10')
  expect(item?.id).toBe('item-1879298736')
  expect(data.indexes.augmentById.get(previous)?.name).toBe('Ruby of Radiance 166')
  const saved = { 'slot-6dabebc676c584c9bb3b083f': previous }
  expect(restoreNativeSlotSelections(item, saved)['slot-1']).toBe(previous)
  expect(restoreNativeSlotSelections(item, { ...saved, 'slot-1': null })['slot-1']).toBeNull()
})
